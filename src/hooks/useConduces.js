import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as conducesService from '../services/conducesService';

export const useConduces = (params, options = {}) => {
  return useQuery({
    queryKey: ['conduces', params],
    queryFn: () => conducesService.getConduces(params),
    enabled: options.enabled ?? true,
  });
};

export const useConduce = (conduceId) => {
  return useQuery({
    queryKey: ['conduce', conduceId],
    queryFn: () => conducesService.getConduceById(conduceId),
    enabled: !!conduceId,
  });
};

export const useCreateConduce = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: conducesService.createConduce,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conduces'] });
      toast.success('Conduce creado');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear conduce'),
  });
};

export const useUpdateConduce = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conduceId, data }) => conducesService.updateConduce(conduceId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conduces'] });
      qc.invalidateQueries({ queryKey: ['conduce'] });
      toast.success('Conduce actualizado');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar conduce'),
  });
};

export const useDeleteConduce = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: conducesService.deleteConduce,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conduces'] });
      toast.success('Conduce eliminado');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al eliminar conduce'),
  });
};

export const useGenerarJornada = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: conducesService.generarJornada,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['conduces'] });
      toast.success('Jornada generada');
      onSuccess?.(data);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al generar jornada'),
  });
};
