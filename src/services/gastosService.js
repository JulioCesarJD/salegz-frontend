import api from '../lib/api';

export const getGastos = async () => {
  const response = await api.get('/api/gastos');
  return response.data;
};

export const getGastoById = async (gastoId) => {
  const response = await api.get(`/api/gastos/${gastoId}`);
  return response.data;
};

export const createGasto = async (data) => {
  const response = await api.post('/api/gastos', data);
  return response.data;
};

export const getConsumos = async () => {
  const response = await api.get('/api/gastos/consumos');
  return response.data;
};

export const createConsumo = async (data) => {
  const response = await api.post('/api/gastos/consumos', data);
  return response.data;
};

export const searchConsumos = async (q) => {
  if (!q) return [];
  const response = await api.get(`/api/gastos/consumos/search?q=${q}`);
  return response.data;
};
