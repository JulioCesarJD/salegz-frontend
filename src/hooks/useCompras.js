import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as comprasService from '../services/comprasService';

export const useCompras = (params) => {
  const filters = typeof params === 'object' && params !== null ? params : { estado: params };
  return useQuery({
    queryKey: ['compras', filters],
    queryFn: () => comprasService.getCompras(filters),
  });
};

export const useCompra = (compraId) => {
  return useQuery({
    queryKey: ['compra', compraId],
    queryFn: () => comprasService.getCompraById(compraId),
    enabled: !!compraId,
  });
};

export const useCreateCompra = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: comprasService.createCompra,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra registrada');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear compra'),
  });
};

/**
 * @deprecated La API no expone pago de compras; se conserva el export
 * para no romper el modal existente hasta la Fase 4.
 */
export const useSaldarCompra = (onSuccessCallback) => {
  return useMutation({
    mutationFn: comprasService.saldarCompra,
    onSuccess: () => {
      toast.success('Pago registrado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || e.message || 'Error al procesar pago'),
  });
};

export const useCancelarCompra = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: comprasService.cancelarCompra,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra cancelada');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al cancelar'),
  });
};
