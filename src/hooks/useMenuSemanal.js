import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as menuSemanalService from '../services/menuSemanalService';
import { getErrorMessage } from '../lib/apiErrors';

export const useMenuSemanal = (params, options = {}) => {
  return useQuery({
    queryKey: ['menu-semanal', params],
    queryFn: () => menuSemanalService.getMenuSemanal(params),
    enabled: options.enabled ?? true,
  });
};

export const useMenuSemanalById = (menuSemanalId) => {
  return useQuery({
    queryKey: ['menu-semanal-item', menuSemanalId],
    queryFn: () => menuSemanalService.getMenuSemanalById(menuSemanalId),
    enabled: !!menuSemanalId,
  });
};

export const useCreateMenuSemanal = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: menuSemanalService.createMenuSemanal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-semanal'] });
      toast.success('Menú semanal creado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al crear menú semanal')),
  });
};

export const useUpdateMenuSemanal = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ menuSemanalId, data }) =>
      menuSemanalService.updateMenuSemanal(menuSemanalId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-semanal'] });
      qc.invalidateQueries({ queryKey: ['menu-semanal-item'] });
      qc.invalidateQueries({ queryKey: ['menu-semanal-detalles'] });
      toast.success('Menú semanal actualizado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al actualizar menú semanal')),
  });
};

export const useDeleteMenuSemanal = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: menuSemanalService.deleteMenuSemanal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-semanal'] });
      qc.invalidateQueries({ queryKey: ['menu-semanal-detalles'] });
      toast.success('Menú semanal eliminado');
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Error al eliminar menú semanal')),
  });
};
