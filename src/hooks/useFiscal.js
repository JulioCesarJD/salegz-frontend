import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as fiscalService from '../services/fiscalService';

export const useConteosFiscales = () => {
  return useQuery({ queryKey: ['conteos-fiscales'], queryFn: fiscalService.getConteosFiscales });
};

export const useRegistrarFiscal = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ facturaId, empresaId }) => fiscalService.registrarFiscal(facturaId, empresaId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['conteos-fiscales'] }); toast.success('Registro fiscal creado'); onSuccess?.(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al registrar fiscal'),
  });
};

export const useRegistrarConsumo = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ facturaId, empresaId }) => fiscalService.registrarConsumo(facturaId, empresaId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['conteos-fiscales'] }); toast.success('Registro de consumo creado'); onSuccess?.(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al registrar consumo'),
  });
};

export const useValidarLimitesFiscales = (empresaId) => {
  return useQuery({ queryKey: ['limites-fiscales', empresaId], queryFn: () => fiscalService.validarLimitesFiscales(empresaId), enabled: !!empresaId });
};
