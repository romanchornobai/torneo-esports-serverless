export const handler = async (event) => {
  console.log('EVENT DELETE:', JSON.stringify(event));
  const id = event.pathParameters?.id ?? 'sin-id';
  console.log('ID a eliminar:', id);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      operation: 'DELETE',
      id,
      message: 'Eliminación simulada del recurso ' + id
    })
  };
};