import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as cuentasCobrarService from '../services/cuentasCobrarService';

export const useCuentasCobrar = (estado) => {
  return useQuery({ queryKey: ['cuentas-cobrar', estado], queryFn: () => cuentasCobrarService.getCuentasCobrar(estado) });
};

export const useCuentaCobrar = (id) => {
  return useQuery({ queryKey: ['cuenta-cobrar', id], queryFn: () => cuentasCobrarService.getCuentaCobrarById(id), enabled: !!id });
};

export const useAplicarAbono = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cuentasCobrarService.aplicarAbono,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cuentas-cobrar'] }); qc.invalidateQueries({ queryKey: ['facturas'] }); toast.success('Abono aplicado'); onSuccess?.(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al aplicar abono'),
  });
};

export const useAbonosByFactura = (facturaId) => {
  return useQuery({ queryKey: ['abonos', facturaId], queryFn: () => cuentasCobrarService.getAbonosByFactura(facturaId), enabled: !!facturaId });
};

export const useMovimientosCxC = (cuentaCobrarId) => {
  return useQuery({ queryKey: ['movimientos-cxc', cuentaCobrarId], queryFn: () => cuentasCobrarService.getMovimientosCxC(cuentaCobrarId), enabled: !!cuentaCobrarId });
};
