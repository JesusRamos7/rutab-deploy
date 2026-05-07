/**
 * Formatea la hora ignorando la conversión a UTC del navegador.
 * Ideal para columnas 'timestamp without time zone'.
 */
export const formatTimeLiteral = (dateInput: string | Date): string => {
  if (!dateInput) return "";

  // Si es un objeto Date, lo pasamos a string ISO primero
  const dateStr =
    typeof dateInput === "string" ? dateInput : dateInput.toISOString();

  // Quitamos la 'Z' para que el navegador lo trate como hora local "tal cual"
  const cleanDate = new Date(dateStr.replace("Z", ""));

  return cleanDate.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Esto te dará el formato 11:23 PM
  });
};
