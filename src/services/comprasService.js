import api from '../lib/api';

export const getCompras = async (estado) => {
  const query = estado !== '' && estado !== undefined && estado !== null ? `?estado=${estado}` : '';
  const response = await api.get(`/api/compras${query}`);
  return response.data;
};

export const getCompraById = async (compraId) => {
  const response = await api.get(`/api/compras/${compraId}`);
  return response.data;
};

export const createCompra = async (data) => {
  const response = await api.post('/api/compras', data);
  return response.data;
};

export const saldarCompra = async (data) => {
  const response = await api.patch(`/api/compras/${data.compraId}/saldar`, data);
  return response.data;
};

export const cancelarCompra = async (compraId) => {
  const response = await api.patch(`/api/compras/${compraId}/cancelar`);
  return response.data;
};
