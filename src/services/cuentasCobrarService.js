import api from '../lib/api';

export const getCuentasCobrar = async (estado) => {
  const query = estado !== undefined && estado !== null && estado !== '' ? `?estado=${estado}` : '';
  const res = await api.get(`/api/cuentascobrar${query}`);
  return res.data;
};

export const getCuentaCobrarById = async (id) => {
  const res = await api.get(`/api/cuentascobrar/${id}`);
  return res.data;
};

export const aplicarAbono = async (data) => {
  const res = await api.post('/api/abonos', data);
  return res.data;
};

export const getAbonosByFactura = async (facturaId) => {
  const res = await api.get(`/api/abonos/factura/${facturaId}`);
  return res.data;
};

export const getMovimientosCxC = async (cuentaCobrarId) => {
  const res = await api.get(`/api/cuentascobrar/${cuentaCobrarId}/movimientos`);
  return res.data;
};
