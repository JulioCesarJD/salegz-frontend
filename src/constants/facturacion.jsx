import React from 'react';

export const ESTADO_FACTURA = {
  0: <span className="badge badge-red">Cancelada</span>,
  1: <span className="badge badge-blue">Activa</span>,
  2: <span className="badge badge-green">Saldada</span>,
  3: <span className="badge badge-yellow">Cuenta abierta</span>,
};

export const TIPO_COMPROBANTE = [
  { value: 0, label: 'Fiscal (B01)' },
  { value: 1, label: 'Consumidor Final (B02)' },
  { value: 2, label: 'Régimen Especial (B14)' },
  { value: 3, label: 'Gubernamental (B15)' },
];

export const METODOS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia', 'Cheque', 'Crédito'];
