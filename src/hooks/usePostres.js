import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as postresService from '../services/postresService';
import { getErrorMessage } from '../lib/apiErrors';

export const usePostres = (params, options = {}) => {
  return useQuery({
    queryKey: ['postres', params],
    queryFn: () => postresService.getPostres(params),
    enabled: options.enabled ?? true,
  });
};

export const usePostre = (postreId) => {
  return useQuery({
    queryKey: ['postre', postreId],
    queryFn: () => postresService.getPostreById(postreId),
    enabled: !!postreId,
  });
};

export const useCreatePostre = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postresService.createPostre,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['postres'] });
      toast.success('Postre registrado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al registrar postre')),
  });
};

export const useUpdatePostre = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postreId, data }) => postresService.updatePostre(postreId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['postres'] });
      qc.invalidateQueries({ queryKey: ['postre'] });
      toast.success('Postre actualizado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al actualizar postre')),
  });
};

export const useDeletePostre = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postresService.deletePostre,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['postres'] });
      toast.success('Postre eliminado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al eliminar postre')),
  });
};
