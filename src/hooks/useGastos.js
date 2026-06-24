import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as gastosService from '../services/gastosService';

// --- Queries ---
export const useGastos = () => {
  return useQuery({
    queryKey: ['gastos'],
    queryFn: gastosService.getGastos,
  });
};

export const useGasto = (gastoId) => {
  return useQuery({
    queryKey: ['gasto', gastoId],
    queryFn: () => gastosService.getGastoById(gastoId),
    enabled: !!gastoId,
  });
};

export const useConsumosGastos = () => {
  return useQuery({
    queryKey: ['consumos-gastos'],
    queryFn: gastosService.getConsumos,
  });
};

export const useSearchConsumos = (queryParam) => {
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

export const useCreateConsumo = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: gastosService.createConsumo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consumos-gastos'] });
      qc.invalidateQueries({ queryKey: ['consumos-search'] });
      toast.success('Concepto creado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al guardar concepto'),
  });
};

export const useActualizarConsumo = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ consumosGastosId, data }) => gastosService.updateConsumo(consumosGastosId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consumos-gastos'] });
      qc.invalidateQueries({ queryKey: ['consumos-search'] });
      toast.success('Concepto actualizado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar concepto'),
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