import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as menuComidaService from '../services/menuComidaService';

export const useMenuComida = (params) => {
  return useQuery({
    queryKey: ['menu-comida', params],
    queryFn: () => menuComidaService.getMenuComida(params),
  });
};

export const useMenuComidaItem = (menuComidaId) => {
  return useQuery({
    queryKey: ['menu-comida-item', menuComidaId],
    queryFn: () => menuComidaService.getMenuComidaById(menuComidaId),
    enabled: !!menuComidaId,
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

export const useUpdateMenuComida = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ menuComidaId, data }) => menuComidaService.updateMenuComida(menuComidaId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-comida'] });
      toast.success('Menú actualizado');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar menú'),
  });
};

export const useDeleteMenuComida = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: menuComidaService.deleteMenuComida,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-comida'] });
      toast.success('Menú eliminado');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al eliminar menú'),
  });
};
