import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as permisosService from '../services/permisosService';

export const useCatalogoPermisos = () => {
  return useQuery({
    queryKey: ['permisos-catalogo'],
    queryFn: permisosService.getCatalogo,
  });
};

export const useUsuarioPermisos = (usuarioId) => {
  return useQuery({
    queryKey: ['usuario-permisos', usuarioId],
    queryFn: () => permisosService.getUsuarioPermisos(usuarioId),
    enabled: !!usuarioId,
  });
};

export const useReemplazarPermisos = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ usuarioId, permisoIds }) =>
      permisosService.reemplazarPermisos(usuarioId, permisoIds),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['usuario-permisos', variables.usuarioId] });
      qc.invalidateQueries({ queryKey: ['permisos-auditoria'] });
      toast.success('Permisos actualizados');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar permisos'),
  });
};

export const useOtorgarPermiso = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ usuarioId, permisoId }) =>
      permisosService.otorgarPermiso(usuarioId, permisoId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['usuario-permisos', variables.usuarioId] });
      toast.success('Permiso otorgado');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al otorgar permiso'),
  });
};

export const useRevocarPermiso = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ usuarioId, permisoId }) =>
      permisosService.revocarPermiso(usuarioId, permisoId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['usuario-permisos', variables.usuarioId] });
      toast.success('Permiso revocado');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al revocar permiso'),
  });
};

export const useAuditoriaPermisos = (params) => {
  return useQuery({
    queryKey: ['permisos-auditoria', params],
    queryFn: () => permisosService.getAuditoria(params),
  });
};
