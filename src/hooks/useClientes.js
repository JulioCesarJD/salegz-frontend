import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as clientesService from '../services/clientesService';

export const useClientes = (params) => {
  return useQuery({
    queryKey: ['clientes', params],
    queryFn: () => clientesService.getClientes(params),
  });
};

export const useCreateCliente = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clientesService.createCliente,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente creado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear cliente'),
  });
};

export const useUpdateCliente = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clientesService.updateCliente,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente actualizado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar cliente'),
  });
};

export const useToggleEstadoCliente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clientesService.toggleEstadoCliente,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
    onError: (e) => toast.error(e.response?.data?.message || 'Error al cambiar estado'),
  });
};

export const useDeleteCliente = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clientesService.deleteCliente,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente eliminado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al eliminar cliente'),
  });
};
