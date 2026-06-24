import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as cuentasPagarService from '../services/cuentasPagarService';

export const useCuentasPagar = (estado) => {
  return useQuery({ queryKey: ['cuentas-pagar', estado], queryFn: () => cuentasPagarService.getCuentasPagar(estado) });
};

export const useCuentaPagar = (id) => {
  return useQuery({ queryKey: ['cuenta-pagar', id], queryFn: () => cuentasPagarService.getCuentaPagarById(id), enabled: !!id });
};

export const useRegistrarPagoProveedor = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cuentasPagarService.registrarPagoProveedor,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cuentas-pagar'] }); qc.invalidateQueries({ queryKey: ['compras'] }); toast.success('Pago registrado'); onSuccess?.(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al registrar pago'),
  });
};

export const usePagosByCompra = (compraId) => {
  return useQuery({ queryKey: ['pagos-compra', compraId], queryFn: () => cuentasPagarService.getPagosByCompra(compraId), enabled: !!compraId });
};
