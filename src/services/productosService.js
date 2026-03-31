import api from '../lib/api';

export const getProductos = async () => {
  const response = await api.get('/api/productos');
  return response.data;
};

export const createProducto = async (data) => {
  const response = await api.post('/api/productos', data);
  return response.data;
};

export const updateProducto = async (data) => {
  const response = await api.put(`/api/productos/${data.productoId}`, data);
  return response.data;
};
