export const handler = async (event) => {
  console.log('EVENT POST:', JSON.stringify(event));
  const body = JSON.parse(event.body ?? '{}');
  console.log('BODY recibido:', body);
  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      operation: 'POST',
      received: body,
      message: 'Recurso recibido para crear'
    })
  };
};