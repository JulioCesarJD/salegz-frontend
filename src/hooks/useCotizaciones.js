import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as cotizService from '../services/cotizacionesService';

export const useCotizaciones = () => {
  return useQuery({
    queryKey: ['cotizaciones'],
    queryFn: cotizService.getCotizaciones,
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
      qc.invalidateQueries(['cotizaciones']);
      toast.success('Cotización creada');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });
};

export const useConvertirCotizacion = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cotizService.convertirCotizacion,
    onSuccess: (res) => {
      qc.invalidateQueries(['cotizaciones']);
      qc.invalidateQueries(['facturas']);
      toast.success(`¡Factura #${res.data?.facturaId} creada exitosamente! 🎉`);
      if (onSuccessCallback) onSuccessCallback(res);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al convertir'),
  });
};


export const useActualizarCotizacion = (onSuccessCallback) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ cotizacionId, data }) =>
      cotizService.updateCotizacion(cotizacionId, data),

    onSuccess: () => {
      qc.invalidateQueries(['cotizaciones']);
      qc.invalidateQueries(['cotizacion']);  
      toast.success('Cotización actualizada');
      if (onSuccessCallback) onSuccessCallback();
    },

    onError: (e) =>
      toast.error(e.response?.data?.message || 'Error al actualizar'),
  });
};