import { useQuery } from '@tanstack/react-query';
import * as reportesService from '../services/reportesService';

/**
 * Todos los hooks aceptan `options.enabled` para no disparar la petición
 * cuando el usuario no tiene el permiso (evita los 403 innecesarios).
 */

export const useVentasRango = (desde, hasta, options = {}) => {
  return useQuery({
    queryKey: ['reporte-ventas', desde, hasta],
    queryFn: () => reportesService.getVentasRango(desde, hasta),
    enabled: (options.enabled ?? true) && !!desde && !!hasta,
  });
};

export const useProductosMasVendidos = (desde, hasta, options = {}) => {
  return useQuery({
    queryKey: ['reporte-productos', desde, hasta],
    queryFn: () => reportesService.getProductosMasVendidos(desde, hasta),
    enabled: (options.enabled ?? true) && !!desde && !!hasta,
  });
};

export const useInventarioBajoMinimo = (options = {}) => {
  return useQuery({
    queryKey: ['reporte-inventario-bajo'],
    queryFn: reportesService.getInventarioBajoMinimo,
    enabled: options.enabled ?? true,
  });
};

export const useCxCPendientes = (options = {}) => {
  return useQuery({
    queryKey: ['reporte-cxc'],
    queryFn: reportesService.getCxCPendientes,
    enabled: options.enabled ?? true,
  });
};

export const useGastosPeriodo = (desde, hasta, options = {}) => {
  return useQuery({
    queryKey: ['reporte-gastos', desde, hasta],
    queryFn: () => reportesService.getGastosPeriodo(desde, hasta),
    enabled: (options.enabled ?? true) && !!desde && !!hasta,
  });
};
