import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
import { FACTURA_ENDPOINTS } from '../models/facturas'

/** Devuelve solo los items (compatibilidad con pantallas que no paginan). */
export const getFacturas = async (params = {}) => {
  const { data } = await api.get(FACTURA_ENDPOINTS.base, { params: cleanParams(params) })
  return unwrapPaged(data)
}

/**
 * Devuelve el objeto completo de la API:
 * { items, page, pageSize, totalCount, resumen }
 * Filtros soportados: page, pageSize (1-200), search, estado, tipo, fechaDesde, fechaHasta.
 */
export const getFacturasPaged = async (params = {}) => {
  const { data } = await api.get(FACTURA_ENDPOINTS.base, { params: cleanParams(params) })
  return data
}

export const getFacturaById = async (facturaId) => {
  const { data } = await api.get(`${FACTURA_ENDPOINTS.base}/${facturaId}`)
  return data
}

// export const createFactura = async (data) => {
//   const { data: created } = await api.post(FACTURA_ENDPOINTS.base, data)
//   return created
// }



export const createFactura = async (payload) => {
  try {
    const { data } = await api.post(
      FACTURA_ENDPOINTS.base,
      payload
    );

    return data;
  } catch (error) {
    console.error("Error al crear factura:", {
      status: error.response?.status,
      message: error.response?.data?.message,
      detail: error.response?.data,
      payload,
    });

    throw error;
  }
};


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

/**
 * Cobra el saldo pendiente. La API no devuelve `saldoPendiente`,
 * se calcula como total - montoPagado.
 */
export const saldarFactura = async (data) => {
  const { facturaId, monto, metodoPago, descripcionPago } = data
  let montoFinal = monto
  if (montoFinal == null) {
    const f = await getFacturaById(facturaId)
    montoFinal = Math.max((f?.total ?? 0) - (f?.montoPagado ?? 0), 0)
  }
  return abonarFactura(facturaId, {
    monto: montoFinal,
    metodoPago: metodoPago ?? null,
    descripcionPago: descripcionPago ?? null,
  })
}


export const actualizarFactura = async (facturaId, data) => {
  const { data: updated } = await api.put(
    `${FACTURA_ENDPOINTS.base}/${facturaId}`,
    data
  )
  return updated
}


export { FACTURA_ENDPOINTS }


