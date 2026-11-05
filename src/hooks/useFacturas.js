// hooks/useFacturas.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as facturasService from '../services/facturasService';
import * as commonService from '../services/commonService';

/**
 * La API no filtra por tipo de comprobante; se conserva el mapa para no
 * romper los componentes existentes hasta la Fase 4.
 */
export const TIPO_COMPROBANTE_MAP = {
  consumidorFinal: 0,
  fiscal: 1,
  regimenEspecial: 2,
  gubernamental: 3,
};

/**
 * Firma conservada por compatibilidad con las pantallas actuales.
 * Filtros reales enviados: estado, fechaDesde, fechaHasta, search.
 * `soloMios`, `usuarioId` y `tipoComprobante` no existen en la API.
 */
export const useFacturas = (estado, desde, hasta, soloMios, usuarioId, tipoComprobante) => {
  return useQuery({
    queryKey: ['facturas', estado, desde, hasta, soloMios, usuarioId, tipoComprobante],
    queryFn: () =>
      facturasService.getFacturas({
        estado,
        fechaDesde: desde,
        fechaHasta: hasta,
      }),
  });
};

export const useFactura = (facturaId) => {
  return useQuery({
    queryKey: ['factura', facturaId],
    queryFn: () => facturasService.getFacturaById(facturaId),
    enabled: !!facturaId,
  });
};

export const useCreateFactura = (onSuccessCallback) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: facturasService.createFactura,

    onSuccess: (res, variables) => {
      qc.invalidateQueries({ queryKey: ['facturas'] });
      toast.success('Factura creada');

      if (onSuccessCallback) {
        onSuccessCallback(res, variables);
      }
    },

    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear factura'),
  });
};

/** Registra un abono por el saldo pendiente (POST /abonar). */
export const useSaldarFactura = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: facturasService.saldarFactura,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['facturas'] });
      qc.invalidateQueries({ queryKey: ['factura'] });
      toast.success('Cobro realizado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al cobrar'),
  });
};

export const useCancelarFactura = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: facturasService.cancelarFactura,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['facturas'] });
      toast.success('Factura cancelada');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al cancelar'),
  });
};

// --- Common Queries ---

export const useSearchClientes = (queryParam = '') => {
  return useQuery({
    queryKey: ['clientes-search', queryParam],
    queryFn: () => commonService.searchClientes(queryParam),
    enabled: queryParam.length >= 2,
  });
};

export const useSearchProductos = (queryParam = '') => {
  return useQuery({
    queryKey: ['productos-search', queryParam],
    queryFn: () => commonService.searchProductos(queryParam),
    enabled: queryParam.length >= 1,
  });
};

export const useEmpresaInfo = () => {
  const em = useQuery({ queryKey: ['empresa'], queryFn: () => commonService.getEmpresa() });
  const ct = useQuery({ queryKey: ['controles'], queryFn: () => commonService.getControlesEmpresa() });
  return { empresa: em.data, control: ct.data, isLoading: em.isLoading || ct.isLoading };
};

/** @deprecated La API no expone PUT /api/facturas/{id}. */
export const useActualizarFactura = (onSuccess) => {
  return useMutation({
    mutationFn: facturasService.actualizarFactura,
    onSuccess: () => {
      toast.success('Factura actualizada');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || e.message || 'Error al actualizar factura'),
  });
};
