import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as menuComidaDetallesService from '../services/menuComidaDetallesService';
import { getErrorMessage } from '../lib/apiErrors';

export const useMenuComidaDetalles = (params, options = {}) => {
  return useQuery({
    queryKey: ['menu-comida-detalles', params],
    queryFn: () => menuComidaDetallesService.getMenuComidaDetalles(params),
    enabled: options.enabled ?? true,
  });
};

export const useCreateMenuComidaDetalle = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ menuComidaId, data }) =>
      menuComidaDetallesService.createMenuComidaDetalle(menuComidaId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-comida-detalles'] });
      qc.invalidateQueries({ queryKey: ['menu-comida'] });
      toast.success('Detalle agregado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al agregar detalle')),
  });
};

export const useUpdateMenuComidaDetalle = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      menuComidaDetallesService.updateMenuComidaDetalle(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-comida-detalles'] });
      qc.invalidateQueries({ queryKey: ['menu-comida'] });
      toast.success('Detalle actualizado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al actualizar detalle')),
  });
};

export const useDeleteMenuComidaDetalle = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: menuComidaDetallesService.deleteMenuComidaDetalle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-comida-detalles'] });
      qc.invalidateQueries({ queryKey: ['menu-comida'] });
      toast.success('Detalle eliminado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al eliminar detalle')),
  });
};
