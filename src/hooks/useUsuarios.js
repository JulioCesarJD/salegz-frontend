import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as usuariosService from '../services/usuariosService';
import * as authService from '../services/authService';

export const useUsuarios = (params) => {
  return useQuery({
    queryKey: ['usuarios', params],
    queryFn: () => usuariosService.getUsuarios(params),
  });
};

export const useUsuario = (usuarioId) => {
  return useQuery({
    queryKey: ['usuario', usuarioId],
    queryFn: () => usuariosService.getUsuarioById(usuarioId),
    enabled: !!usuarioId,
  });
};

export const useCreateUsuario = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usuariosService.createUsuario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario creado');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear usuario'),
  });
};

export const useUpdateUsuario = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usuariosService.updateUsuario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] });
      qc.invalidateQueries({ queryKey: ['usuario'] });
      toast.success('Usuario actualizado');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar usuario'),
  });
};

export const useDeleteUsuario = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usuariosService.deleteUsuario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario eliminado');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al eliminar usuario'),
  });
};

/** Cambio de contraseña del propio usuario (POST /api/auth/change-password). */
export const useChangePassword = (onSuccess) => {
  return useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Contraseña actualizada');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.title || e.response?.data?.message || 'Error al cambiar contraseña'),
  });
};

/** Cambio de PIN del propio usuario (POST /api/auth/change-pin). */
export const useChangePin = (onSuccess) => {
  return useMutation({
    mutationFn: authService.changePin,
    onSuccess: () => {
      toast.success('PIN actualizado');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.title || e.response?.data?.message || 'Error al cambiar PIN'),
  });
};
