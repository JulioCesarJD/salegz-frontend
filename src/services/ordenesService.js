import api from '../lib/api';

export const getOrdenes = async (estado) => {
  const query = estado !== undefined && estado !== null && estado !== '' ? `?estado=${estado}` : '';
  const res = await api.get(`/api/ordenes${query}`);
  return res.data;
};

export const getOrdenById = async (id) => {
  const res = await api.get(`/api/ordenes/${id}`);
  return res.data;
};

export const createOrden = async (data) => {
  const res = await api.post('/api/ordenes', data);
  return res.data;
};

export const procesarOrden = async (id) => {
  const res = await api.patch(`/api/ordenes/${id}/procesar`);
  return res.data;
};

export const cancelarOrden = async (id) => {
  const res = await api.patch(`/api/ordenes/${id}/cancelar`);
  return res.data;
};

export const convertirOrdenAFactura = async (id) => {
  const res = await api.post(`/api/ordenes/${id}/convertir-factura`);
  return res.data;
};
