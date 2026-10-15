// DYNAMODB · tabla del Bloque 06
resource "aws_dynamodb_table" "contacts" {
  name         = "ContactMessagesTF"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

// SNS · topic del Bloque 08
resource "aws_sns_topic" "requests" {
  name = "EbookRequestsTF"
}

// LAMBDA · reutiliza el role permitido por Academy
resource "aws_lambda_function" "contact" {
  function_name    = "ebook-contact-tf"
  role             = var.lambda_role_arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = "${path.module}/lambda/function.zip"
  source_code_hash = filebase64sha256("${path.module}/lambda/function.zip")

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.contacts.name
      TOPIC_ARN  = aws_sns_topic.requests.arn
    }
  }
}

// API GATEWAY · REST API
resource "aws_api_gateway_rest_api" "ebook" {
  name = "ebook-api-tf"
}

// RESOURCE /contact
resource "aws_api_gateway_resource" "contact" {
  rest_api_id = aws_api_gateway_rest_api.ebook.id
  parent_id   = aws_api_gateway_rest_api.ebook.root_resource_id
  path_part   = "contact"
}

// METHOD POST
resource "aws_api_gateway_method" "post" {
  rest_api_id   = aws_api_gateway_rest_api.ebook.id
  resource_id   = aws_api_gateway_resource.contact.id
  http_method   = "POST"
  authorization = "NONE"
}

// INTEGRATION · POST /contact → Lambda
resource "aws_api_gateway_integration" "lambda" {
  rest_api_id             = aws_api_gateway_rest_api.ebook.id
  resource_id             = aws_api_gateway_resource.contact.id
  http_method             = aws_api_gateway_method.post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.contact.invoke_arn
}

// METHOD OPTIONS (CORS preflight)
resource "aws_api_gateway_method" "options" {
  rest_api_id   = aws_api_gateway_rest_api.ebook.id
  resource_id   = aws_api_gateway_resource.contact.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options" {
  rest_api_id = aws_api_gateway_rest_api.ebook.id
  resource_id = aws_api_gateway_resource.contact.id
  http_method = aws_api_gateway_method.options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.ebook.id
  resource_id = aws_api_gateway_resource.contact.id
  http_method = aws_api_gateway_method.options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.ebook.id
  resource_id = aws_api_gateway_resource.contact.id
  http_method = aws_api_gateway_method.options.http_method
  status_code = aws_api_gateway_method_response.options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.options]
}

// PERMISO · API Gateway puede invocar Lambda
resource "aws_lambda_permission" "api" {
  statement_id  = "AllowAPIGatewayInvokeTF"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.ebook.execution_arn}/*/*"
}

// DEPLOYMENT de la REST API
resource "aws_api_gateway_deployment" "ebook" {
  rest_api_id = aws_api_gateway_rest_api.ebook.id

  depends_on = [
    aws_api_gateway_integration.lambda,
    aws_api_gateway_integration.options
  ]
}

// STAGE dev
resource "aws_api_gateway_stage" "dev" {
  deployment_id = aws_api_gateway_deployment.ebook.id
  rest_api_id   = aws_api_gateway_rest_api.ebook.id
  stage_name    = "dev"
}
