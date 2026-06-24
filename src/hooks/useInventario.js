import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as inventarioService from '../services/inventarioService';

export const useMovimientosInventario = (filters) => {
  return useQuery({
    queryKey: ['movimientosInventario', filters],
    queryFn: () => inventarioService.getMovimientosInventario(filters),
  });
};

export const useMovimientoInventario = (movimientoId) => {
  return useQuery({
    queryKey: ['movimientoInventario', movimientoId],
    queryFn: () => inventarioService.getMovimientoInventarioById(movimientoId),
    enabled: !!movimientoId,
  });
};

export const useCreateMovimientoInventario = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventarioService.createMovimientoInventario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimientosInventario'] });
      toast.success('Movimiento de inventario registrado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear movimiento'),
  });
};

export const useDeleteMovimientoInventario = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventarioService.deleteMovimientoInventario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimientosInventario'] });
      toast.success('Movimiento de inventario eliminado');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al eliminar movimiento'),
  });
};

export const useHistorialProductoInventario = (productoId, limit = 50) => {
  return useQuery({
    queryKey: ['movimientosInventarioHistorial', productoId, limit],
    queryFn: () => inventarioService.getHistorialProducto(productoId, limit),
    enabled: !!productoId,
  });
};
