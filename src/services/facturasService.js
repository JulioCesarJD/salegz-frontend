import api from '../lib/api';

export const getFacturas = async (estado, desde, hasta, usuarioId) => {
  const params = new URLSearchParams();
  if (estado) params.append('estado', estado);
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);
  if (usuarioId) params.append('usuarioId', usuarioId);
  const qs = params.toString();
  const res = await api.get(`/api/facturas${qs ? `?${qs}` : ''}`);
  return res.data;
};

export const getFacturaById = async (facturaId) => {
  const res = await api.get(`/api/facturas/${facturaId}`);
  return res.data;
};

export const createFactura = async (data) => {
  const res = await api.post('/api/facturas', data);
  return res.data; // Devuelve los datos de la respuesta incluyendo los ID creados.
};

export const saldarFactura = async (data) => {
  const res = await api.patch(`/api/facturas/${data.facturaId}/saldar`, data);
  return res.data;
};

export const cancelarFactura = async (facturaId) => {
  const res = await api.patch(`/api/facturas/${facturaId}/cancelar`);
  return res.data;
};

export const actualizarFactura = async (facturaId, data) => {
  const res = await api.put(`/api/facturas/${facturaId}`, { 
    facturaId,        // ← esto es lo que el controller compara con el {id} de la URL
    tipoPago: data.tipoPago,
    detalles: data.detalles,
  });
  return res.data;
};
