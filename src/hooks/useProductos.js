import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as productosService from '../services/productosService';

export const useProductos = (params) => {
  return useQuery({
    queryKey: ['productos', params],
    queryFn: () => productosService.getProductos(params),
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

export const useDeleteProducto = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productosService.deleteProducto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto eliminado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al eliminar producto'),
  });
};

export const useAjustarInventario = (onSuccessCallback) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productoId, cantidad, motivo }) =>
      productosService.ajustarInventario(productoId, { cantidad, motivo }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Inventario ajustado');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al ajustar inventario'),
  });
};
