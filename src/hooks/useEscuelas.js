import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as escuelasService from '../services/escuelasService';

export const useEscuelas = (params, options = {}) => {
  return useQuery({
    queryKey: ['escuelas', params],
    queryFn: () => escuelasService.getEscuelas(params),
    enabled: options.enabled ?? true,
  });
};

export const useEscuela = (escuelaId) => {
  return useQuery({
    queryKey: ['escuela', escuelaId],
    queryFn: () => escuelasService.getEscuelaById(escuelaId),
    enabled: !!escuelaId,
  });
};

export const useCreateEscuela = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: escuelasService.createEscuela,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['escuelas'] });
      toast.success('Escuela creada');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear escuela'),
  });
};

export const useUpdateEscuela = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ escuelaId, data }) => escuelasService.updateEscuela(escuelaId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['escuelas'] });
      toast.success('Escuela actualizada');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar escuela'),
  });
};

export const useDeleteEscuela = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: escuelasService.deleteEscuela,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['escuelas'] });
      toast.success('Escuela eliminada');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al eliminar escuela'),
  });
};
