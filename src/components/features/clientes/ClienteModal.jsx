import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { NumInput } from '../../common/NumInput';
import { useCreateCliente, useUpdateCliente } from '../../../hooks/useClientes';

export function ClienteModal({ cliente, onClose }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const isEdit = !!cliente?.clienteId;
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: cliente || { tipo: 0, tipoEntidad: 0, credito: 0, sexo: 'true' },
  });

  const createMutation = useCreateCliente(() => onClose());
  const updateMutation = useUpdateCliente(() => onClose());

  const busy = createMutation.isPending || updateMutation.isPending;

  const closeWithConfirm = () => {
    if (!isDirty && !isEdit) {
      onClose();
      return;
    }
    setConfirmCancel(true);
  };

  const cancelConfirmed = () => {
    setConfirmCancel(false);
    onClose();
  };

  const cancelDismiss = () => {
    setConfirmCancel(false);
  };

  const submit = (d) => {
    const payload = {
      ...d,
      empresaId:       1,
      tipo:            parseInt(d.tipo),
      tipoEntidad: parseInt(d.tipoEntidad),
      credito:         parseFloat(d.credito || 0),
      sexo:            d.sexo === 'true' || d.sexo === true,
      fechaNacimiento: d.fechaNacimiento || null,
    };

    if (isEdit) {
      updateMutation.mutate({ ...payload, clienteId: cliente.clienteId });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeWithConfirm()}>
      <div className="modal-box max-w-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {isEdit ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button onClick={closeWithConfirm} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Nombre *</label>
            <input className={`input ${errors.nombre ? 'input-error' : ''}`} placeholder="Juan Pérez"
              {...register('nombre', { required: 'Requerido', maxLength: 75 })} />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>

          <div>
            <label className="label">Teléfono</label>
            <input className="input" placeholder="809-000-0000" {...register('telefono')} />
          </div>

          <div>
            <label className="label">Correo</label>
            <input type="email" className="input" placeholder="cliente@mail.com"
              {...register('email', { pattern: { value: /\S+@\S+\.\S+/, message: 'Inválido' } })} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Cédula / RNC</label>
            <input className="input" placeholder="000-0000000-0" {...register('cedula')} />
          </div>

          <div>
            <label className="label">Tipo</label>
            <select className="input" {...register('tipo')}>
              <option value={0}>Regular</option>
              <option value={1}>Crédito</option>
              <option value={2}>Mayorista</option>
            </select>
          </div>

          <div>
            <label className="label">Entidad</label>

            <select
              className="input"
              {...register('tipoEntidad')}
            >
              <option value={0}>Cliente</option>
              <option value={1}>Proveedor</option>
              <option value={2}>Ambos</option>
            </select>
          </div>

          <div>
            <label className="label">Límite crédito (RD$)</label>
            <NumInput className="input" placeholder="0.00" {...register('credito')} />
          </div>

          {/* <div>
            <label className="label">Sexo</label>
            <select className="input" {...register('sexo')}>
              <option value="true">Masculino</option>
              <option value="false">Femenino</option>
            </select>
          </div> */}

          {/* <div>
            <label className="label">Fecha nacimiento</label>
            <input type="date" className="input" {...register('fechaNacimiento')} />
          </div> */}

          <div className="col-span-2">
            <label className="label">Dirección</label>
            <input className="input" placeholder="Calle Principal #1" {...register('direccion')} />
          </div>

          <div className="col-span-2 flex gap-3 pt-1">
            <button type="button" onClick={closeWithConfirm} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>

      {confirmCancel && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && cancelDismiss()}>
          <div className="modal-box max-w-md">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>¿Deseas cancelar el registro?</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Se perderán los cambios no guardados.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={cancelDismiss}>No</button>
              <button className="btn-primary" onClick={cancelConfirmed}>Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
