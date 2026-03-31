import api from '../lib/api';

// --- Clientes ---
export const searchClientes = async (query) => {
  if (!query || query.length < 2) return [];
  const response = await api.get(`/api/clientes/search?q=${query}`);
  return response.data;
};

// --- Productos ---
export const searchProductos = async (query) => {
  if (!query || query.length < 1) return [];
  const response = await api.get(`/api/productos/search?q=${query}`);
  return response.data;
};

// --- Empresa/Controles ---
export const getEmpresa = async () => {
  const response = await api.get('/api/empresa');
  return response.data;
};

export const getControlesEmpresa = async () => {
  // Nota: original code usaba /api/empresa/control en unos lados y /api/Empresa/control en otros.
  const response = await api.get('/api/empresa/control');
  return response.data;
};
