import api from '../lib/api';

export const getMovimientosInventario = async ({ productoId, tipo, fechaInicio, fechaFin } = {}) => {
  const params = [];
  if (productoId !== undefined && productoId !== null && productoId !== '') params.push(`productoId=${productoId}`);
  if (tipo !== undefined && tipo !== null && tipo !== '') params.push(`tipo=${tipo}`);
  if (fechaInicio) params.push(`fechaInicio=${encodeURIComponent(fechaInicio)}`);
  if (fechaFin) params.push(`fechaFin=${encodeURIComponent(fechaFin)}`);
  const query = params.length ? `?${params.join('&')}` : '';
  const response = await api.get(`/api/inventario/movimientos${query}`);
  return response.data;
};

export const getMovimientoInventarioById = async (movimientoId) => {
  const response = await api.get(`/api/inventario/movimientos/${movimientoId}`);
  return response.data;
};

export const getHistorialProducto = async (productoId, limit) => {
  const query = limit ? `?limit=${limit}` : '';
  const response = await api.get(`/api/inventario/producto/${productoId}/historial${query}`);
  return response.data;
};

export const createMovimientoInventario = async (data) => {
  const response = await api.post('/api/inventario/movimientos', data);
  return response.data;
};

export const updateMovimientoInventario = async ({ movimientoId, data }) => {
  const response = await api.put(`/api/inventario/movimientos/${movimientoId}`, data);
  return response.data;
};

export const deleteMovimientoInventario = async (movimientoId) => {
  const response = await api.delete(`/api/inventario/movimientos/${movimientoId}`);
  return response.data;
};
