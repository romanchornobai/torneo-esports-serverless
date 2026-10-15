// DynamoDB: persistencia.
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

// SNS: mensajería publish/subscribe.
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import crypto from 'crypto';

const ddb = new DynamoDBClient({});
const sns = new SNSClient({});

const TABLE_NAME = process.env.TABLE_NAME || 'ContactMessagesTF';
const TOPIC_ARN = process.env.TOPIC_ARN || 'arn:aws:sns:us-east-1:014181419088:EbookRequestsTF';

export const handler = async (event) => {
  console.log('Evento HTTP recibido:', JSON.stringify(event, null, 2));

  // Manejo de preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {});
  }

  try {
    const body = JSON.parse(event.body ?? '{}');
    const name = (body.name ?? body.nombre ?? '').trim();
    const email = (body.email ?? '').trim();
    const interest = (body.interest ?? body.evento ?? 'General').trim();

    // Requisito Bloque 10: Validación estricta de name, email e interest
    if (!name || !email || !interest) {
      return response(400, {
        success: false,
        error: 'Name, email e interest son obligatorios'
      });
    }

    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const phone = (body.phone ?? 'N/A');
    const message = (body.message ?? `Inscripción Torneo eSports - ${interest}`);

    // 1 · PERSISTIMOS en DynamoDB
    await ddb.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        id:        { S: id },
        name:      { S: name },
        email:     { S: email },
        interest:  { S: interest },
        phone:     { S: phone },
        message:   { S: message },
        timestamp: { S: timestamp }
      }
    }));

    console.log('Item guardado en DynamoDB con ID:', id);

    // 2 · PUBLICAMOS evento en SNS
    const snsResult = await sns.send(new PublishCommand({
      TopicArn: TOPIC_ARN,
      Subject: `Nueva solicitud EventPass (${interest}) - ${name}`,
      Message: JSON.stringify({
        id,
        name,
        email,
        interest,
        phone,
        message,
        timestamp
      }, null, 2)
    }));

    console.log('Mensaje SNS publicado con ID:', snsResult.MessageId);

    return response(200, {
      success: true,
      message: 'Solicitud guardada y notificada vía Terraform',
      id,
      interest
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return response(500, {
      success: false,
      error: 'Error al procesar la solicitud'
    });
  }
};

function response(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  };
}
