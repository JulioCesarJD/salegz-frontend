import api from '../lib/api'
import { cleanParams, notSupported, unwrapPaged } from './_helpers'
import { FACTURA_ENDPOINTS } from '../models/facturas'

export const getFacturas = async (params = {}) => {
  const { data } = await api.get(FACTURA_ENDPOINTS.base, { params: cleanParams(params) })
  return unwrapPaged(data)
}

export const getFacturasPaged = async (params = {}) => {
  const { data } = await api.get(FACTURA_ENDPOINTS.base, { params: cleanParams(params) })
  return data
}

export const getFacturaById = async (facturaId) => {
  const { data } = await api.get(`${FACTURA_ENDPOINTS.base}/${facturaId}`)
  return data
}

export const createFactura = async (data) => {
  const { data: created } = await api.post(FACTURA_ENDPOINTS.base, data)
  return created
}

export const cancelarFactura = async (facturaId) => {
  const { data } = await api.post(FACTURA_ENDPOINTS.cancelar(facturaId))
  return data
}

export const abonarFactura = async (facturaId, abono) => {
  const { data } = await api.post(FACTURA_ENDPOINTS.abonar(facturaId), abono)
  return data
}

export const getSaldoCliente = async (clienteId) => {
  const { data } = await api.get(FACTURA_ENDPOINTS.saldoCliente(clienteId))
  return data?.saldo ?? 0
}
 
export const saldarFactura = async (data) => {
  const { facturaId, monto, metodoPago, descripcionPago } = data
  const montoFinal = monto ?? (await getFacturaById(facturaId))?.saldoPendiente ?? 0
  return abonarFactura(facturaId, {
    monto: montoFinal,
    metodoPago: metodoPago ?? null,
    descripcionPago: descripcionPago ?? null,
  })
}

/** La API no expone PUT /api/facturas/{id}. */
export const actualizarFactura = () => notSupported('Editar una factura')

export { FACTURA_ENDPOINTS }