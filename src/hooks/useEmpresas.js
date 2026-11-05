import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as empresasService from '../services/empresasService';

export const useEmpresas = (params, options = {}) => {
  return useQuery({
    queryKey: ['empresas', params],
    queryFn: () => empresasService.getEmpresas(params),
    ...options,
  });
};

export const useEmpresa = (empresaId) => {
  return useQuery({
    queryKey: ['empresa', empresaId],
    queryFn: () => empresasService.getEmpresaById(empresaId),
    enabled: !!empresaId,
  });
};

export const useCreateEmpresa = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: empresasService.createEmpresa,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['empresas'] });
      toast.success('Empresa creada');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear empresa'),
  });
};

export const useUpdateEmpresa = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ empresaId, data }) => empresasService.updateEmpresa(empresaId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['empresas'] });
      qc.invalidateQueries({ queryKey: ['empresa'] });
      toast.success('Empresa actualizada');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar empresa'),
  });
};
