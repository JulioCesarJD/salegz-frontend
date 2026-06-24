import api from '../lib/api';

export const getAuditoriaLogs = async (desde, hasta, tipo, usuarioId) => {
  const params = new URLSearchParams();
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);
  if (tipo) params.append('tipo', tipo);
  if (usuarioId) params.append('usuarioId', usuarioId);
  const qs = params.toString();
  const res = await api.get(`/api/auditoria${qs ? `?${qs}` : ''}`);
  return res.data;
};
