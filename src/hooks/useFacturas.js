// hooks/useFacturas.js - Actualizado
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as facturasService from '../services/facturasService';
import * as commonService from '../services/commonService'; 

// Mapeo de tipo de comprobante a valor numérico
export const TIPO_COMPROBANTE_MAP = {
  'consumidorFinal': 0,
  'fiscal': 1,
  'regimenEspecial': 2,
  'gubernamental': 3,
};

// --- Queries ---

export const useFacturas = (estado, desde, hasta, soloMios, usuarioId, tipoComprobante) => {
  return useQuery({
    queryKey: ['facturas', estado, desde, hasta, soloMios, tipoComprobante],
    queryFn: () => {
      // Convertir el tipo de comprobante de string a número
      let tipoComprobanteValue = null;
      if (tipoComprobante && TIPO_COMPROBANTE_MAP[tipoComprobante] !== undefined) {
        tipoComprobanteValue = TIPO_COMPROBANTE_MAP[tipoComprobante];
      }
      
      return facturasService.getFacturas(
        estado, 
        desde, 
        hasta, 
        soloMios ? usuarioId : null,
        tipoComprobanteValue
      );
    },
  });
};

export const useFactura = (facturaId) => {
  return useQuery({
    queryKey: ['factura', facturaId],
    queryFn: () => facturasService.getFacturaById(facturaId),
    enabled: !!facturaId,
  });
};

// --- Mutaciones (resto igual) ---

export const useCreateFactura = (onSuccessCallback) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: facturasService.createFactura,

    onSuccess: (res, variables) => {
      qc.invalidateQueries(['facturas']);

      toast.success('Factura creada');

      if (onSuccessCallback) {
        onSuccessCallback(res, variables);
      }
    },

    onError: (e) =>
      toast.error(
        e.response?.data?.message || 'Error al crear factura'
      ),
  });
};

export const useSaldarFactura = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: facturasService.saldarFactura,
    onSuccess: () => {
      qc.invalidateQueries(['facturas']);
      toast.success('¡Cobro realizado!');
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

// --- Common Queries ---

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

export const useActualizarFactura = (onSuccess) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ facturaId, data }) => facturasService.actualizarFactura(facturaId, data),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['factura'] });
      toast.success('Factura actualizada');
      onSuccess?.();
    },
    
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar factura'),
  });
};