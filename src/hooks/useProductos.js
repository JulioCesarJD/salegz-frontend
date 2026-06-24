import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as productosService from '../services/productosService';

export const useProductos = () => {
  return useQuery({
    queryKey: ['productos'],
    queryFn: productosService.getProductos,
  });
};

export const useCreateProducto = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productosService.createProducto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto creado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear producto'),
  });
};

export const useUpdateProducto = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productosService.updateProducto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto actualizado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar producto'),
  });
};
