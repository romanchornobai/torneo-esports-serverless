import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import crypto from 'crypto';

const ddb = new DynamoDBClient({});
const sns = new SNSClient({});

// Terraform inyecta estos valores al crear Lambda.
const TABLE_NAME = process.env.TABLE_NAME;
const TOPIC_ARN = process.env.TOPIC_ARN;

export const handler = async (event) => {
  console.log('Evento recibido:', JSON.stringify(event, null, 2));

  if (event.httpMethod === 'OPTIONS') {
    return response(200, {});
  }

  try {
    const body = JSON.parse(event.body ?? '{}');
    const name = (body.name ?? body.nombre ?? '').trim();
    const email = (body.email ?? '').trim();

    if (!name || !email) {
      return response(400, { error: 'Name y email son obligatorios' });
    }

    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const phone = (body.phone ?? 'N/A');
    const message = (body.message ?? 'Inscripción Torneo eSports Terraform');

    await ddb.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        id:        { S: id },
        name:      { S: name },
        email:     { S: email },
        phone:     { S: phone },
        message:   { S: message },
        timestamp: { S: timestamp }
      }
    }));

    await sns.send(new PublishCommand({
      TopicArn: TOPIC_ARN,
      Subject: 'Nueva solicitud Torneo eSports - ' + name,
      Message: JSON.stringify({ id, name, email, phone, message, timestamp }, null, 2)
    }));

    return response(200, { success: true, message: 'Solicitud guardada y notificada vía Terraform', id });
  } catch (error) {
    console.error('Error al procesar:', error);
    return response(500, { error: 'Error al procesar' });
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
