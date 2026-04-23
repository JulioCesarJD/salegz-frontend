import api from '../lib/api';

export const getCotizaciones = async () => {
  const response = await api.get('/api/cotizaciones');
  return response.data;
};

export const getCotizacionById = async (cotizacionId) => {
  const response = await api.get(`/api/cotizaciones/${cotizacionId}`);
  return response.data;
};

export const createCotizacion = async (data) => {
  const response = await api.post('/api/cotizaciones', data);
  return response.data;
};

export const convertirCotizacion = async (data) => {
  const response = await api.post(`/api/cotizaciones/${data.cotizacionId}/convertir`, data);
  return response.data;
};

export const updateCotizacion = async (cotizacionId, data) => {
  const response = await api.put(`/api/cotizaciones/${cotizacionId}`, {
    cotizacionId,
    ...data
  });
  return response.data;
};
