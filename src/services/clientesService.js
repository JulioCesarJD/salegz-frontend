import api from '../lib/api';

export const getClientes = async () => {
  const response = await api.get('/api/clientes');
  return response.data;
};

export const createCliente = async (data) => {
  const response = await api.post('/api/clientes', data);
  return response.data;
};

export const updateCliente = async (data) => {
  const response = await api.put(`/api/clientes/${data.clienteId}`, data);
  return response.data;
};

export const toggleEstadoCliente = async (id) => {
  const response = await api.patch(`/api/clientes/${id}/toggle-estado`);
  return response.data;
};
