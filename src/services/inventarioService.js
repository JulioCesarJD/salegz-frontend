import api from '../lib/api';

// 🔹 Helper para construir query params limpio
const buildQuery = (paramsObj = {}) => {
  const params = new URLSearchParams();

  Object.entries(paramsObj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  return params.toString() ? `?${params.toString()}` : '';
};

// 🔹 Obtener movimientos con filtros
export const getMovimientosInventario = async (filters = {}) => {
  const query = buildQuery(filters);
  const { data } = await api.get(`/api/inventario/movimientos${query}`);
  return data;
};

// 🔹 Obtener un movimiento por ID
export const getMovimientoInventarioById = async (movimientoId) => {
  const { data } = await api.get(`/api/inventario/movimientos/${movimientoId}`);
  return data;
};

// 🔹 Historial por producto
export const getHistorialProducto = async (productoId, limit = 50) => {
  const query = buildQuery({ limit });
  const { data } = await api.get(`/api/inventario/producto/${productoId}/historial${query}`);
  return data;
};

// 🔹 Crear movimiento (EL BACKEND calcula stock)
export const createMovimientoInventario = async (payload) => {
  /*
    payload esperado:
    {
      productoId,
      tipo,        // 0 entrada, 1 salida, 2 ajuste
      cantidad,
      referencia?,
      nota?
    }
  */
  const { data } = await api.post('/api/inventario/movimientos', payload);
  return data;
};

// ⚠️ OPCIONAL (solo si decides permitirlo en backend)
export const deleteMovimientoInventario = async (movimientoId) => {
  const { data } = await api.delete(`/api/inventario/movimientos/${movimientoId}`);
  return data;
};