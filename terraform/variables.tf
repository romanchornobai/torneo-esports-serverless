variable "aws_region" {
  description = "Región del AWS Academy Learning Lab"
  type        = string
  default     = "us-east-1"
}

variable "lambda_role_arn" {
  description = "Execution Role permitido por Learner Lab"
  type        = string
  default     = "arn:aws:iam::014181419088:role/LabRole"
}
