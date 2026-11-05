/**
 * @typedef {Object} Categoria
 * @property {number} categoriaId
 * @property {string} descripcion
 * @property {string|null} fechaRegistro
 * @property {number|null} estado
 */

/**
 * @typedef {Object} Cliente
 * @property {number} clienteId
 * @property {string} nombre
 * @property {string|null} telefono
 * @property {string|null} email
 * @property {string|null} cedula
 * @property {string|null} direccion
 * @property {number|null} montoCredito
 * @property {number|null} estado
 * @property {boolean|null} sexo
 * @property {string|null} fechaNacimiento
 * @property {string|null} provincia
 * @property {string|null} municipio
 */

/**
 * Nota: `exento === true` significa **Gravado** (semántica invertida de la API).
 * `itbis` es un porcentaje (por defecto 18).
 * @typedef {Object} Producto
 * @property {number} productoId
 * @property {string} descripcion
 * @property {string|null} referencia
 * @property {number} cantidad
 * @property {number} costo
 * @property {number} itbis
 * @property {number} minimo
 * @property {number} precio1
 * @property {number} precio2
 * @property {number} precio3
 * @property {boolean} exento
 * @property {string|null} codigoBarra
 * @property {boolean} servicios
 * @property {number|null} categoriaId
 * @property {string|null} categoriaDescripcion
 * @property {'Gravado'|'Exento'} exentoNombre
 */

/**
 * @typedef {Object} ListFilter
 * @property {string} [search]
 * @property {number} [page]
 * @property {number} [pageSize]
 */

export const ENTIDADES = Object.freeze({
  categorias: 'categorias',
  clientes: 'clientes',
  productos: 'productos',
})
