/**
 * Retorna fecha en formato YYYY-MM-DD (para inputs de tipo date)
 */
export const localDate = (d = new Date()) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
