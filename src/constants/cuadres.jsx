import React from 'react';

export const ESTADO_CUADRE = {
  0: <span className="badge badge-yellow">Pendiente</span>,
  1: <span className="badge badge-green">Aprobado</span>,
  2: <span className="badge badge-red">Con diferencia</span>,
};

export const DENOM = [
  { key: 'p1',    label: 'RD$1',     val: 1    },
  { key: 'p5',    label: 'RD$5',     val: 5    },
  { key: 'p10',   label: 'RD$10',    val: 10   },
  { key: 'p20',   label: 'RD$20',    val: 20   },
  { key: 'p25',   label: 'RD$25',    val: 25   },
  { key: 'p50',   label: 'RD$50',    val: 50   },
  { key: 'p100',  label: 'RD$100',   val: 100  },
  { key: 'p200',  label: 'RD$200',   val: 200  },
  { key: 'p500',  label: 'RD$500',   val: 500  },
  { key: 'p1000', label: 'RD$1,000', val: 1000 },
  { key: 'p2000', label: 'RD$2,000', val: 2000 },
];
