import api from '../lib/api';

export const getNotasCredito = async () => {
  const res = await api.get('/api/notas-credito');
  return res.data;
};

export const getNotaCreditoById = async (id) => {
  const res = await api.get(`/api/notas-credito/${id}`);
  return res.data;
};

export const createNotaCredito = async (data) => {
  const res = await api.post('/api/notas-credito', data);
  return res.data;
};

export const cancelarNotaCredito = async (id) => {
  const res = await api.patch(`/api/notas-credito/${id}/cancelar`);
  return res.data;
};
