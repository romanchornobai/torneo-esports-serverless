export const handler = async (event) => {
  console.log('EVENT PUT:', JSON.stringify(event));
  const id = event.pathParameters?.id ?? 'sin-id';
  const body = JSON.parse(event.body ?? '{}');
  console.log('ID a actualizar:', id);
  console.log('Nuevos datos:', body);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      operation: 'PUT',
      id,
      newData: body,
      message: 'Actualización completa simulada'
    })
  };
};