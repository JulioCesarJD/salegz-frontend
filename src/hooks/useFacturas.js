import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as facturasService from '../services/facturasService';
import * as commonService from '../services/commonService';

// --- Queries ---

export const useFacturas = (estado, desde, hasta, soloMios, usuarioId) => {
  return useQuery({
    queryKey: ['facturas', estado, desde, hasta, soloMios],
    queryFn: () => facturasService.getFacturas(estado, desde, hasta, soloMios ? usuarioId : null),
  });
};

export const useFactura = (facturaId) => {
  return useQuery({
    queryKey: ['factura', facturaId],
    queryFn: () => facturasService.getFacturaById(facturaId),
    enabled: !!facturaId,
  });
};

// --- Mutaciones ---

export const useCreateFactura = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: facturasService.createFactura,
    onSuccess: (res) => {
      qc.invalidateQueries(['facturas']);
      toast.success('Factura creada');
      if (onSuccessCallback) onSuccessCallback(res);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear factura'),
  });
};

export const useSaldarFactura = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: facturasService.saldarFactura,
    onSuccess: () => {
      qc.invalidateQueries(['facturas']);
      toast.success('¡Cobro registrado! 💰');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });
};

export const useCancelarFactura = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: facturasService.cancelarFactura,
    onSuccess: () => {
      qc.invalidateQueries(['facturas']);
      toast.success('Factura cancelada');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });
};

// --- Common Queries (Usadas en facturas y cotizaciones) ---

export const useSearchClientes = (queryParam) => {
  return useQuery({
    queryKey: ['clientes-search', queryParam],
    queryFn: () => commonService.searchClientes(queryParam),
    enabled: queryParam.length >= 2,
  });
};

export const useSearchProductos = (queryParam) => {
  return useQuery({
    queryKey: ['productos-search', queryParam],
    queryFn: () => commonService.searchProductos(queryParam),
    enabled: queryParam.length >= 1,
  });
};

export const useEmpresaInfo = () => {
  const em = useQuery({ queryKey: ['empresa'], queryFn: commonService.getEmpresa });
  const ct = useQuery({ queryKey: ['controles'], queryFn: commonService.getControlesEmpresa });
  return { empresa: em.data, control: ct.data, isLoading: em.isLoading || ct.isLoading };
};
