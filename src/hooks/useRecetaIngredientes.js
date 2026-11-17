import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as recetaIngredientesService from '../services/recetaIngredientesService';
import { getErrorMessage } from '../lib/apiErrors';

export const useRecetaIngredientes = (params, options = {}) => {
  return useQuery({
    queryKey: ['receta-ingredientes', params],
    queryFn: () => recetaIngredientesService.getRecetaIngredientes(params),
    enabled: options.enabled ?? true,
  });
};

export const useCreateRecetaIngrediente = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recetaId, data }) =>
      recetaIngredientesService.createRecetaIngrediente(recetaId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receta-ingredientes'] });
      qc.invalidateQueries({ queryKey: ['recetas'] });
      qc.invalidateQueries({ queryKey: ['receta'] });
      toast.success('Ingrediente agregado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al agregar ingrediente')),
  });
};

export const useUpdateRecetaIngrediente = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      recetaIngredientesService.updateRecetaIngrediente(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receta-ingredientes'] });
      qc.invalidateQueries({ queryKey: ['recetas'] });
      qc.invalidateQueries({ queryKey: ['receta'] });
      toast.success('Ingrediente actualizado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al actualizar ingrediente')),
  });
};

export const useDeleteRecetaIngrediente = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: recetaIngredientesService.deleteRecetaIngrediente,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receta-ingredientes'] });
      qc.invalidateQueries({ queryKey: ['recetas'] });
      qc.invalidateQueries({ queryKey: ['receta'] });
      toast.success('Ingrediente eliminado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al eliminar ingrediente')),
  });
};
