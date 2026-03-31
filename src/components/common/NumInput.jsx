import React from 'react'

/**
 * NumInput - Componente de input que restringe caracteres a solo números (y puntos decimales si aplica).
 * Internamente usa type="text" con inputMode="decimal" o "numeric", resolviendo problemas de
 * compatibilidad en distintos navegadores, y evitando que el input muestre '0' de manera predeterminada.
 */
export function NumInput({ className, decimals = true, value, onChange, ...props }) {
  const handleKeyDown = (e) => {
    const allowed = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'
    ];
    if (allowed.includes(e.key)) return;
    
    // Permitir ctrl/cmd + A, C, V, X, Z
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
        return;
    }

    // Permitir punto o coma si aplican decimales
    if (decimals && (e.key === '.' || e.key === ',')) {
      // Evitar múltiples separadores
      const valStr = String(value || e.target.value);
      if (valStr.includes('.') || valStr.includes(',')) {
        e.preventDefault();
      }
      return;
    }
    
    // Si no es un dígito, bloquear
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text');
    const pattern = decimals ? /^\d*[\.,]?\d*$/ : /^\d+$/;
    if (!pattern.test(text)) {
        e.preventDefault();
    }
  }

  return (
    <input
      type="text"
      inputMode={decimals ? 'decimal' : 'numeric'}
      autoComplete="off"
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className={className}
      value={value}
      onChange={onChange}
      {...props}
    />
  )
}
