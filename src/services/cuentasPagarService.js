import api from '../lib/api';

export const getCuentasPagar = async (estado) => {
  const query = estado !== undefined && estado !== null && estado !== '' ? `?estado=${estado}` : '';
  const res = await api.get(`/api/cuentaspagar${query}`);
  return res.data;
};

export const getCuentaPagarById = async (id) => {
  const res = await api.get(`/api/cuentaspagar/${id}`);
  return res.data;
};

export const registrarPagoProveedor = async (data) => {
  const res = await api.post('/api/cuentaspagar/pagar', data);
  return res.data;
};

export const getPagosByCompra = async (compraId) => {
  const res = await api.get(`/api/cuentaspagar/${compraId}/pagos`);
  return res.data;
};
