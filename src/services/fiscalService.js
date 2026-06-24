import api from '../lib/api';

export const getConteosFiscales = async () => {
  const res = await api.get('/api/fiscal/conteos');
  return res.data;
};

export const registrarFiscal = async (facturaId, empresaId) => {
  const res = await api.post('/api/fiscal/registrar-fiscal', { facturaId, empresaId });
  return res.data;
};

export const registrarConsumo = async (facturaId, empresaId) => {
  const res = await api.post('/api/fiscal/registrar-consumo', { facturaId, empresaId });
  return res.data;
};

export const validarLimitesFiscales = async (empresaId) => {
  const res = await api.get(`/api/fiscal/validar-limites?empresaId=${empresaId}`);
  return res.data;
};
