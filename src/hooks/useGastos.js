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
      qc.invalidateQueries(['gastos']);
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
      qc.invalidateQueries(['consumos-gastos']);
      qc.invalidateQueries(['consumos-search']);
      toast.success('Concepto creado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al guardar concepto'),
  });
};
