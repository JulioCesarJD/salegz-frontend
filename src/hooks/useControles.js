import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as controlesService from '../services/controlesService';

export const useControles = (empresaId) => {
  return useQuery({
    queryKey: ['controles', empresaId],
    queryFn: () => controlesService.getControles(empresaId),
    enabled: !!empresaId,
  });
};

export const useUpdateControles = (empresaId, onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => controlesService.updateControles(empresaId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['controles', empresaId] });
      toast.success('Configuración guardada');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al guardar configuración'),
  });
};
