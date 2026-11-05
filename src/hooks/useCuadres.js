import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCuadres,
  getCuadreById,
  createCuadre,
  getVentasCuadre,
} from '../services/cuadresService';
import toast from 'react-hot-toast';

export const useCuadres = (desde, hasta) => {
  return useQuery({
    queryKey: ['cuadres', desde, hasta],
    queryFn: () => getCuadres({ desde, hasta }),
  });
};

export const useCuadre = (cuadreId) => {
  return useQuery({
    queryKey: ['cuadre', cuadreId],
    queryFn: () => getCuadreById(cuadreId),
    enabled: !!cuadreId,
  });
};

/** Ventas del período (GET /api/reportes/ventas-rango). */
export const useVentasCuadre = (desde, hasta, usuarioId) => {
  return useQuery({
    queryKey: ['ventas-cuadre-hoy', usuarioId, desde, hasta],
    queryFn: () => getVentasCuadre(desde, hasta),
  });
};

export const useCreateCuadre = (onSuccessCallback) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createCuadre,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cuadres'] });
      toast.success('Cuadre guardado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => {
      toast.error(e.response?.data?.message || 'Error al crear cuadre');
    },
  });
};
