import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as menuSemanalDetallesService from '../services/menuSemanalDetallesService';
import { getErrorMessage } from '../lib/apiErrors';

export const useMenuSemanalDetalles = (params, options = {}) => {
  return useQuery({
    queryKey: ['menu-semanal-detalles', params],
    queryFn: () => menuSemanalDetallesService.getMenuSemanalDetalles(params),
    enabled: options.enabled ?? true,
  });
};

export const useCreateMenuSemanalDetalle = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ menuSemanalId, data }) =>
      menuSemanalDetallesService.createMenuSemanalDetalle(menuSemanalId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-semanal-detalles'] });
      qc.invalidateQueries({ queryKey: ['menu-semanal'] });
      toast.success('Detalle agregado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al agregar detalle')),
  });
};

export const useUpdateMenuSemanalDetalle = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      menuSemanalDetallesService.updateMenuSemanalDetalle(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-semanal-detalles'] });
      qc.invalidateQueries({ queryKey: ['menu-semanal'] });
      toast.success('Detalle actualizado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al actualizar detalle')),
  });
};

export const useDeleteMenuSemanalDetalle = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: menuSemanalDetallesService.deleteMenuSemanalDetalle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-semanal-detalles'] });
      qc.invalidateQueries({ queryKey: ['menu-semanal'] });
      toast.success('Detalle eliminado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al eliminar detalle')),
  });
};
