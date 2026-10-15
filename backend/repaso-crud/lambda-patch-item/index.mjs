export const handler = async (event) => {
  console.log('EVENT PATCH:', JSON.stringify(event));
  const id = event.pathParameters?.id ?? 'sin-id';
  const changes = JSON.parse(event.body ?? '{}');
  console.log('ID a modificar:', id);
  console.log('Cambios parciales:', changes);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      operation: 'PATCH',
      id,
      changes,
      message: 'Actualización parcial simulada'
    })
  };
};