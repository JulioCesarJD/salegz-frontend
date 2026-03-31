export const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v)) return 'RD$0.00'
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v)
}
