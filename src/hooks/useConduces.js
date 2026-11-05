import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as conducesService from '../services/conducesService';

export const useConduces = (params) => {
  return useQuery({
    queryKey: ['conduces', params],
    queryFn: () => conducesService.getConduces(params),
  });
};

export const useConduce = (conduceId) => {
  return useQuery({
    queryKey: ['conduce', conduceId],
    queryFn: () => conducesService.getConduceById(conduceId),
    enabled: !!conduceId,
  });
};

export const useGenerarJornada = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: conducesService.generarJornada,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['conduces'] });
      toast.success('Jornada generada');
      onSuccess?.(data);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al generar jornada'),
  });
};
