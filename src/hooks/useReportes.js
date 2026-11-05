import { useQuery } from '@tanstack/react-query';
import * as reportesService from '../services/reportesService';

export const useVentasRango = (desde, hasta) => {
  return useQuery({
    queryKey: ['reporte-ventas', desde, hasta],
    queryFn: () => reportesService.getVentasRango(desde, hasta),
    enabled: !!desde && !!hasta,
  });
};

export const useProductosMasVendidos = (desde, hasta) => {
  return useQuery({
    queryKey: ['reporte-productos', desde, hasta],
    queryFn: () => reportesService.getProductosMasVendidos(desde, hasta),
    enabled: !!desde && !!hasta,
  });
};

export const useInventarioBajoMinimo = () => {
  return useQuery({
    queryKey: ['reporte-inventario-bajo'],
    queryFn: reportesService.getInventarioBajoMinimo,
  });
};

export const useCxCPendientes = () => {
  return useQuery({
    queryKey: ['reporte-cxc'],
    queryFn: reportesService.getCxCPendientes,
  });
};

export const useGastosPeriodo = (desde, hasta) => {
  return useQuery({
    queryKey: ['reporte-gastos', desde, hasta],
    queryFn: () => reportesService.getGastosPeriodo(desde, hasta),
    enabled: !!desde && !!hasta,
  });
};
