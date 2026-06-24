import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as categoriasService from '../services/categoriasService';

export const useCategorias = () => {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasService.getCategorias,
  });
};

export const useCreateCategoria = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriasService.createCategoria,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoría creada');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear categoría'),
  });
};

export const useUpdateCategoria = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriasService.updateCategoria,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoría actualizada');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar categoría'),
  });
};

export const useDeleteCategoria = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriasService.deleteCategoria,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoría eliminada');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al eliminar categoría'),
  });
};

export const useToggleEstadoCategoria = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriasService.toggleEstadoCategoria,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
    onError: (e) => toast.error(e.response?.data?.message || 'Error al cambiar estado'),
  });
};
