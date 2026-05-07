/**
 * Genera una fecha con los valores numéricos correspondientes a la zona horaria de CDMX.
 * Se usa para insertar en columnas 'timestamp without time zone' evitando la
 * conversión automática a UTC de Prisma.
 */
export const getCDMXDate = (): Date => {
  const now = new Date();

  // Obtenemos el desfase en minutos y lo convertimos a milisegundos
  // getTimezoneOffset() devuelve 360 para CDMX (UTC-6)
  const offset = now.getTimezoneOffset() * 60 * 1000;

  // Creamos una nueva fecha restando ese desfase
  // Esto hace que la hora UTC del objeto sea igual a la hora local
  return new Date(now.getTime() - offset);
};


export const getStartOfDayCDMX = (): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
};