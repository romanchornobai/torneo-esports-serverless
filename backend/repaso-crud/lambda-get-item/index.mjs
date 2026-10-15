export const handler = async (event) => {
  console.log('EVENT GET:', JSON.stringify(event));
  const id = event.pathParameters?.id ?? 'sin-id';
  console.log('ID recibido:', id);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      operation: 'GET',
      id,
      message: 'Consultando el recurso ' + id
    })
  };
};