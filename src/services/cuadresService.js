import api from '../lib/api';

export const getCuadres = async (desde, hasta) => {
  const params = new URLSearchParams();
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);
  const qs = params.toString();
  const response = await api.get(`/api/cuadres${qs ? `?${qs}` : ''}`);
  return response.data;
};

export const getCuadreById = async (cuadreId) => {
  const response = await api.get(`/api/cuadres/${cuadreId}`);
  return response.data;
};

export const createCuadre = async (data) => {
  const response = await api.post('/api/cuadres', data);
  return response.data;
};

// Necesario en NuevoCuadreModal
export const getVentasCuadre = async (desde, hasta) => {
  const response = await api.get(`/api/Reportes/ventas?desde=${desde}&hasta=${hasta}`);
  return response.data;
};
