import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as cotizService from '../services/cotizacionesService';

export const useCotizaciones = (params, options = {}) => {
  return useQuery({
    queryKey: ['cotizaciones', params],
    queryFn: () => cotizService.getCotizaciones(params),
    enabled: options.enabled ?? true,
  });
};

export const useCotizacion = (cotizacionId) => {
  return useQuery({
    queryKey: ['cotizacion', cotizacionId],
    queryFn: () => cotizService.getCotizacionById(cotizacionId),
    enabled: !!cotizacionId,
  });
};

export const useCreateCotizacion = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cotizService.createCotizacion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cotizaciones'] });
      toast.success('Cotización creada');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear cotización'),
  });
};

export const useActualizarCotizacion = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cotizacionId, data }) => cotizService.updateCotizacion(cotizacionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cotizaciones'] });
      qc.invalidateQueries({ queryKey: ['cotizacion'] });
      toast.success('Cotización actualizada');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar cotización'),
  });
};

export const useDeleteCotizacion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cotizService.deleteCotizacion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cotizaciones'] });
      toast.success('Cotización eliminada');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al eliminar cotización'),
  });
};

/** POST /api/cotizaciones/{id}/facturar */
export const useConvertirCotizacion = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cotizacionId) => cotizService.facturarCotizacion(cotizacionId),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['cotizaciones'] });
      qc.invalidateQueries({ queryKey: ['facturas'] });
      toast.success(res?.facturaId ? `Factura #${res.facturaId} creada` : 'Cotización facturada');
      if (onSuccessCallback) onSuccessCallback(res);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al facturar'),
  });
};
