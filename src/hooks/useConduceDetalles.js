import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as conduceDetallesService from '../services/conduceDetallesService';
import { getErrorMessage } from '../lib/apiErrors';

export const useConduceDetalles = (params, options = {}) => {
  return useQuery({
    queryKey: ['conduce-detalles', params],
    queryFn: () => conduceDetallesService.getConduceDetalles(params),
    enabled: options.enabled ?? true,
  });
};

export const useCreateConduceDetalle = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conduceId, data }) =>
      conduceDetallesService.createConduceDetalle(conduceId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conduce-detalles'] });
      qc.invalidateQueries({ queryKey: ['conduces'] });
      qc.invalidateQueries({ queryKey: ['conduce'] });
      toast.success('Detalle agregado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al agregar detalle')),
  });
};

export const useUpdateConduceDetalle = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      conduceDetallesService.updateConduceDetalle(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conduce-detalles'] });
      qc.invalidateQueries({ queryKey: ['conduces'] });
      qc.invalidateQueries({ queryKey: ['conduce'] });
      toast.success('Detalle actualizado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al actualizar detalle')),
  });
};

export const useDeleteConduceDetalle = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: conduceDetallesService.deleteConduceDetalle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conduce-detalles'] });
      qc.invalidateQueries({ queryKey: ['conduces'] });
      qc.invalidateQueries({ queryKey: ['conduce'] });
      toast.success('Detalle eliminado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al eliminar detalle')),
  });
};
