// LAMBDA ejecutará esta función cada vez que se produzca una invocación.
// export = Lambda puede encontrarla · async = podremos usar await más adelante.
// event = objeto con los datos recibidos en ESTA invocación.
export const handler = async (event) => {
 
  // Dejamos una evidencia de los datos recibidos.
  // Este mensaje lo podremos localizar después en CloudWatch Logs.
  console.log('Evento recibido:', event);
 
  // Intentamos leer la propiedad nombre del event.
  // ?? significa: si nombre es null/undefined, utiliza 'usuario'.
  const nombre = event.nombre ?? 'usuario';
 
  // return devuelve el resultado de esta invocación.
  // statusCode 200 representa que la operación ha ido correctamente.
  return {
    statusCode: 200,
 
    // body será el contenido de la respuesta.
    // JSON.stringify convierte el objeto JavaScript en texto JSON.
    body: JSON.stringify({
      // Si event.nombre era María → Hola María. Tu Lambda funciona.
      message: 'Hola ' + nombre + '. Tu Lambda funciona.'
    })
  };
};