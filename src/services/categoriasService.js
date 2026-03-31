import api from '../lib/api';

export const getCategorias = async () => {
  const response = await api.get('/api/categorias');
  return response.data;
};

export const createCategoria = async (data) => {
  const response = await api.post('/api/categorias', { ...data, empresaId: 1 });
  return response.data;
};

export const updateCategoria = async (data) => {
  const response = await api.put(`/api/categorias/${data.categoriaId}`, data);
  return response.data;
};

export const deleteCategoria = async (id) => {
  const response = await api.delete(`/api/categorias/${id}`);
  return response.data;
};

export const toggleEstadoCategoria = async (id) => {
  const response = await api.patch(`/api/categorias/${id}/toggle-estado`);
  return response.data;
};
