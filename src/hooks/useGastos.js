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

/**
 * @deprecated La API no tiene catálogo de conceptos de gasto.
 * Se conserva el export hasta la Fase 4.
 */
export const useConsumosGastos = () => {
  return useQuery({
    queryKey: ['consumos-gastos'],
    queryFn: gastosService.getConsumos,
    retry: false,
  });
};

export const useSearchConsumos = (queryParam = '') => {
  return useQuery({
    queryKey: ['consumos-search', queryParam],
    queryFn: () => gastosService.searchConsumos(queryParam),
    enabled: queryParam.length >= 1,
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

/** @deprecated La API no expone conceptos de gasto. */
export const useCreateConsumo = (onSuccessCallback) => {
  return useMutation({
    mutationFn: gastosService.createConsumo,
    onSuccess: () => {
      toast.success('Concepto creado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.message || 'Error al guardar concepto'),
  });
};

/** @deprecated La API no expone conceptos de gasto. */
export const useActualizarConsumo = (onSuccessCallback) => {
  return useMutation({
    mutationFn: gastosService.updateConsumo,
    onSuccess: () => {
      toast.success('Concepto actualizado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.message || 'Error al actualizar concepto'),
  });
};

/** @deprecated La API no expone edición de gastos. */
export const useActualizarGasto = (onSuccessCallback) => {
  return useMutation({
    mutationFn: gastosService.updateGasto,
    onSuccess: () => {
      toast.success('Gasto actualizado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.message || 'Error al actualizar gasto'),
  });
};
