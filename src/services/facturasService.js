import api from '../lib/api'
import { cleanParams, notSupported, unwrapPaged } from './_helpers'
import { FACTURA_ENDPOINTS } from '../models/facturas'

/**
 * GET /api/facturas
 * Filtros reales: search, estado, tipo, fechaDesde, fechaHasta, page, pageSize.
 */
export const getFacturas = async (params = {}) => {
  const { data } = await api.get(FACTURA_ENDPOINTS.base, {
    params: cleanParams(params),
  })
  return unwrapPaged(data)
}

export const getFacturasPaged = async (params = {}) => {
  const { data } = await api.get(FACTURA_ENDPOINTS.base, {
    params: cleanParams(params),
  })
  return data
}

export const getFacturaById = async (facturaId) => {
  const { data } = await api.get(`${FACTURA_ENDPOINTS.base}/${facturaId}`)
  return data
}

/** POST /api/facturas */
export const createFactura = async (data) => {
  const { data: created } = await api.post(FACTURA_ENDPOINTS.base, data)
  return created
}

/** POST /api/facturas/{id}/cancelar */
export const cancelarFactura = async (facturaId) => {
  const { data } = await api.post(FACTURA_ENDPOINTS.cancelar(facturaId))
  return data
}

/** POST /api/facturas/{id}/abonar */
export const abonarFactura = async (facturaId, abono) => {
  const { data } = await api.post(FACTURA_ENDPOINTS.abonar(facturaId), abono)
  return data
}

/** GET /api/facturas/cliente/{clienteId}/saldo */
export const getSaldoCliente = async (clienteId) => {
  const { data } = await api.get(FACTURA_ENDPOINTS.saldoCliente(clienteId))
  return data?.saldo ?? 0
}

/**
 * Compatibilidad: antes se llamaba a un endpoint /saldar inexistente.
 * Ahora se registra un abono por el saldo pendiente (o el monto indicado).
 * @param {{facturaId:number, monto?:number, metodoPago?:number, descripcionPago?:string}} data
 */
export const saldarFactura = async (data) => {
  const { facturaId } = data
  const monto = data.monto ?? (await getFacturaById(facturaId))?.saldoPendiente ?? 0
  return abonarFactura(facturaId, {
    monto,
    metodoPago: data.metodoPago ?? null,
    descripcionPago: data.descripcionPago ?? null,
  })
}

/** La API no expone PUT /api/facturas/{id}. */
export const actualizarFactura = () =>
  notSupported('Editar una factura')

export { FACTURA_ENDPOINTS }
