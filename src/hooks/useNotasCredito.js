import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as notasCreditoService from '../services/notasCreditoService';

export const useNotasCredito = () => {
  return useQuery({
    queryKey: ['notas-credito'],
    queryFn: notasCreditoService.getNotasCredito,
  });
};

export const useNotaCredito = (id) => {
  return useQuery({
    queryKey: ['nota-credito', id],
    queryFn: () => notasCreditoService.getNotaCreditoById(id),
    enabled: !!id,
  });
};

export const useCreateNotaCredito = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notasCreditoService.createNotaCredito,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notas-credito'] });
      qc.invalidateQueries({ queryKey: ['facturas'] });
      toast.success('Nota de crédito creada');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear nota de crédito'),
  });
};

/** @deprecated La API no expone cancelación de notas de crédito. */
export const useCancelarNotaCredito = (onSuccess) => {
  return useMutation({
    mutationFn: notasCreditoService.cancelarNotaCredito,
    onSuccess: () => {
      toast.success('Nota de crédito cancelada');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.message || 'Error al cancelar nota de crédito'),
  });
};
