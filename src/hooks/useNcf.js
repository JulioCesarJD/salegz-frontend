import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as ncfService from '../services/ncfService';

export const useNcfSeries = () => {
  return useQuery({ queryKey: ['ncf-series'], queryFn: ncfService.getNcfSeries });
};

export const useNcfSerie = (id) => {
  return useQuery({ queryKey: ['ncf-serie', id], queryFn: () => ncfService.getNcfSerie(id), enabled: !!id });
};

export const useCreateNcfSerie = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ncfService.createNcfSerie,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ncf-series'] }); toast.success('Serie NCF creada'); onSuccess?.(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear serie NCF'),
  });
};

export const useUpdateNcfSerie = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ncfService.updateNcfSerie,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ncf-series'] }); toast.success('Serie NCF actualizada'); onSuccess?.(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar serie NCF'),
  });
};

export const useDeleteNcfSerie = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ncfService.deleteNcfSerie,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ncf-series'] }); toast.success('Serie NCF eliminada'); onSuccess?.(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al eliminar serie NCF'),
  });
};

export const useGenerarNcf = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tipoNcf, empresaId }) => ncfService.generarNcf(tipoNcf, empresaId),
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['ncf'] }); toast.success(`NCF generado: ${data.ncf}`); onSuccess?.(data); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al generar NCF'),
  });
};
