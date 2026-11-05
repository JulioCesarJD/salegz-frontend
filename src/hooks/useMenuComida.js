import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as menuComidaService from '../services/menuComidaService';

export const useMenuComida = () => {
  return useQuery({
    queryKey: ['menu-comida'],
    queryFn: menuComidaService.getMenuComida,
  });
};

export const useCreateMenuComida = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: menuComidaService.createMenuComida,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-comida'] });
      toast.success('Menú registrado');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al registrar menú'),
  });
};
