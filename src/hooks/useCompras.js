import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as comprasService from '../services/comprasService';

export const useCompras = (estado) => {
  return useQuery({
    queryKey: ['compras', estado],
    queryFn: () => comprasService.getCompras(estado),
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
      qc.invalidateQueries(['compras']);
      toast.success('Compra registrada');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear compra'),
  });
};

export const useSaldarCompra = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: comprasService.saldarCompra,
    onSuccess: () => {
      qc.invalidateQueries(['compras']);
      toast.success('Pago registrado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al procesar pago'),
  });
};

export const useCancelarCompra = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: comprasService.cancelarCompra,
    onSuccess: () => {
      qc.invalidateQueries(['compras']);
      toast.success('Compra cancelada');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al cancelar'),
  });
};
