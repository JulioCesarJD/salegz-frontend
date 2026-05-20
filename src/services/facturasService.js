// services/facturasService.js
import api from '../lib/api';

export const getFacturas = async (estado, desde, hasta, usuarioId, tipoComprobante) => {
  const params = new URLSearchParams();
  
  if (estado && estado !== '') params.append('estado', estado);
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);
  if (usuarioId) params.append('usuarioId', usuarioId);
  if (tipoComprobante !== undefined && tipoComprobante !== null && tipoComprobante !== '') {
    params.append('tipoComprobante', tipoComprobante);
  }
  
  const qs = params.toString();
  const res = await api.get(`/api/facturas${qs ? `?${qs}` : ''}`);
  return res.data;
};

export const getFacturaById = async (facturaId) => {
  const res = await api.get(`/api/facturas/${facturaId}`);
  return res.data;
};

export const createFactura = async (data) => {
  const res = await api.post('/api/facturas', data);
  return res.data;
};

export const saldarFactura = async (data) => {
  const res = await api.patch(`/api/facturas/${data.facturaId}/saldar`, data);
  return res.data;
};

export const cancelarFactura = async (facturaId) => {
  const res = await api.patch(`/api/facturas/${facturaId}/cancelar`);
  return res.data;
};

export const actualizarFactura = async (facturaId, data) => {
  const res = await api.put(`/api/facturas/${facturaId}`, { 
    facturaId,
    tipoPago: data.tipoPago,
    tipoFactura: data.tipoFactura,
    detalles: data.detalles,
  });
  return res.data;
};