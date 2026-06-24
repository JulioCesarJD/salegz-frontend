import api from '../lib/api';

export const getNcfSeries = async () => {
  const res = await api.get('/api/ncf');
  return res.data;
};

export const getNcfSerie = async (id) => {
  const res = await api.get(`/api/ncf/${id}`);
  return res.data;
};

export const createNcfSerie = async (data) => {
  const res = await api.post('/api/ncf', data);
  return res.data;
};

export const updateNcfSerie = async (data) => {
  const res = await api.put(`/api/ncf/${data.ncfSerieId}`, data);
  return res.data;
};

export const deleteNcfSerie = async (id) => {
  const res = await api.delete(`/api/ncf/${id}`);
  return res.data;
};

export const generarNcf = async (tipoNcf, empresaId) => {
  const res = await api.post('/api/ncf/generar', { tipoNcf, empresaId });
  return res.data;
};

export const validarNcf = async (ncf) => {
  const res = await api.post('/api/ncf/validar', { ncf });
  return res.data;
};
