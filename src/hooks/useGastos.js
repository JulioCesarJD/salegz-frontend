import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as gastosService from '../services/gastosService';

// --- Queries ---
export const useGastos = (params) => {
  return useQuery({
    queryKey: ['gastos', params],
    queryFn: () => gastosService.getGastos(params),
  });
};

export const useGasto = (gastoId) => {
  return useQuery({
    queryKey: ['gasto', gastoId],
    queryFn: () => gastosService.getGastoById(gastoId),
    enabled: !!gastoId,
  });
};

// --- Mutations ---
export const useCreateGasto = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: gastosService.createGasto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gastos'] });
      toast.success('Gasto registrado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al guardar gasto'),
  });
};

export const useDeleteGasto = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: gastosService.deleteGasto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gastos'] });
      toast.success('Gasto eliminado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al eliminar gasto'),
  });
};

export const useActualizarGasto = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ gastosId, data }) => gastosService.updateGasto(gastosId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gastos'] });
      qc.invalidateQueries({ queryKey: ['gasto'] });
      toast.success('Gasto actualizado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar gasto'),
  });
};
