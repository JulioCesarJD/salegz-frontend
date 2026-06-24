import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as ordenesService from '../services/ordenesService';

export const useOrdenes = (estado) => {
  return useQuery({ queryKey: ['ordenes', estado], queryFn: () => ordenesService.getOrdenes(estado) });
};

export const useOrden = (id) => {
  return useQuery({ queryKey: ['orden', id], queryFn: () => ordenesService.getOrdenById(id), enabled: !!id });
};

export const useCreateOrden = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordenesService.createOrden,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ordenes'] }); toast.success('Orden creada'); onSuccess?.(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear orden'),
  });
};

export const useProcesarOrden = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordenesService.procesarOrden,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ordenes'] }); qc.invalidateQueries({ queryKey: ['inventario'] }); toast.success('Orden procesada'); onSuccess?.(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al procesar orden'),
  });
};

export const useCancelarOrden = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordenesService.cancelarOrden,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ordenes'] }); qc.invalidateQueries({ queryKey: ['inventario'] }); toast.success('Orden cancelada'); onSuccess?.(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al cancelar orden'),
  });
};

export const useConvertirOrdenAFactura = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordenesService.convertirOrdenAFactura,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ordenes'] }); qc.invalidateQueries({ queryKey: ['facturas'] }); toast.success('Orden convertida a factura'); onSuccess?.(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al convertir orden'),
  });
};
