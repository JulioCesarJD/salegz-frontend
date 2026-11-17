import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as recetasService from '../services/recetasService';
import { getErrorMessage } from '../lib/apiErrors';

export const useRecetas = (params, options = {}) => {
  return useQuery({
    queryKey: ['recetas', params],
    queryFn: () => recetasService.getRecetas(params),
    enabled: options.enabled ?? true,
  });
};

export const useReceta = (recetaId) => {
  return useQuery({
    queryKey: ['receta', recetaId],
    queryFn: () => recetasService.getRecetaById(recetaId),
    enabled: !!recetaId,
  });
};

export const useCreateReceta = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: recetasService.createReceta,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recetas'] });
      toast.success('Receta creada');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al crear receta')),
  });
};

export const useUpdateReceta = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recetaId, data }) => recetasService.updateReceta(recetaId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recetas'] });
      qc.invalidateQueries({ queryKey: ['receta'] });
      toast.success('Receta actualizada');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al actualizar receta')),
  });
};

export const useDeleteReceta = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: recetasService.deleteReceta,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recetas'] });
      toast.success('Receta eliminada');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al eliminar receta')),
  });
};
