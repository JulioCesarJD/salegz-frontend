import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as postresService from '../services/postresService';

export const usePostres = () => {
  return useQuery({
    queryKey: ['postres'],
    queryFn: postresService.getPostres,
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
    onError: (e) => toast.error(e.response?.data?.message || 'Error al registrar postre'),
  });
};
