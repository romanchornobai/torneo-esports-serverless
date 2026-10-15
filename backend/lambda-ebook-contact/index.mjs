// SDK v3: cliente DynamoDB + operación PutItem.
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
 
// crypto forma parte de Node.js y nos permite generar un UUID único.
import crypto from 'crypto';
 
// Lambda ya conoce su región mediante el entorno AWS.
const ddb = new DynamoDBClient({});
const TABLE_NAME = 'ContactMessages';
 
export const handler = async (event) => {
  console.log('Evento HTTP recibido:', JSON.stringify(event, null, 2));

  if (event.httpMethod === 'OPTIONS') {
    return response(200, {});
  }
 
  try {
    // API Gateway entrega body como texto JSON.
    const body = JSON.parse(event.body ?? '{}');
    const name = (body.name ?? body.nombre ?? '').trim();
    const email = (body.email ?? '').trim();
 
    if (!name || !email) {
      return response(400, { success: false, error: 'Name y email son obligatorios' });
    }
 
    // Cada solicitud necesita una partition key única.
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
 
    // Item en formato DynamoDB de bajo nivel.
    // S significa String.
    const item = {
      id:        { S: id },
      name:      { S: name },
      email:     { S: email },
      phone:     { S: (body.phone ?? 'N/A') },
      message:   { S: (body.message ?? 'Inscripción Torneo eSports NEXUS ARENA') },
      timestamp: { S: timestamp }
    };
 
    // Esperamos a que DynamoDB confirme la escritura.
    await ddb.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: item
    }));
 
    console.log('Item guardado en DynamoDB:', id);
 
    return response(200, {
      success: true,
      message: 'Solicitud guardada correctamente',
      id
    });
  } catch (error) {
    // CloudWatch conservará el error real para diagnosticarlo.
    console.error('Error al procesar la solicitud:', error);
    return response(500, {
      success: false,
      error: 'Error al procesar la solicitud'
    });
  }
};
 
// Evitamos repetir statusCode, CORS y JSON.stringify.
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