import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as escuelasService from '../services/escuelasService';

export const useEscuelas = () => {
  return useQuery({
    queryKey: ['escuelas'],
    queryFn: escuelasService.getEscuelas,
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
