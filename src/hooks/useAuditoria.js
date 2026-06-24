import { useQuery } from '@tanstack/react-query';
import * as auditoriaService from '../services/auditoriaService';

export const useAuditoriaLogs = (desde, hasta, tipo, usuarioId) => {
  return useQuery({
    queryKey: ['auditoria', desde, hasta, tipo, usuarioId],
    queryFn: () => auditoriaService.getAuditoriaLogs(desde, hasta, tipo, usuarioId),
  });
};
