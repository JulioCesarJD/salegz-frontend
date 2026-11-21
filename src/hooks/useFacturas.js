// hooks/useFacturas.js
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as facturasService from '../services/facturasService';
import * as commonService from '../services/commonService';

/** Se conserva por compatibilidad; la API aún no maneja tipo de comprobante. */
export const TIPO_COMPROBANTE_MAP = {
  consumidorFinal: 0,
  fiscal: 1,
  regimenEspecial: 2,
  gubernamental: 3,
};

/**
 * Lista paginada de facturas.
 * filters: { search, estado, fechaDesde, fechaHasta, page, pageSize }
 * Devuelve { items, page, pageSize, totalCount, resumen }.
 */
export const useFacturas = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['facturas', filters],
    queryFn: () => facturasService.getFacturasPaged(filters),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
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
      qc.invalidateQueries({ queryKey: ['productos-search'] }); // el stock cambió
      toast.success('Factura creada');
      onSuccessCallback?.(res, variables);
    },

    onError: (e) =>
      toast.error(e.response?.data?.message || e.response?.data?.title || 'Error al crear factura'),
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
      onSuccessCallback?.();
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
      qc.invalidateQueries({ queryKey: ['factura'] });
      qc.invalidateQueries({ queryKey: ['productos-search'] }); // el stock se repone
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

export const useActualizarFactura = (onSuccessCallback) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ facturaId, data }) =>
      facturasService.actualizarFactura(facturaId, data),

    onSuccess: (res, variables) => {
      qc.invalidateQueries({ queryKey: ['facturas'] });
      qc.invalidateQueries({ queryKey: ['factura', variables.facturaId] });
      qc.invalidateQueries({ queryKey: ['productos-search'] }); // el stock pudo cambiar
      toast.success('Factura actualizada');
      onSuccessCallback?.(res, variables);
    },

    onError: (e) =>
      toast.error(
        e.response?.data?.message ||
        e.response?.data?.title ||
        'Error al actualizar factura'
      ),
  });
};