import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ShieldAlert, X, Loader2 } from 'lucide-react';
import api from '../../../lib/api';
import axios from 'axios';

const PIN_LENGTH = 6;

interface AdminPinModalProps {
  onConfirm: () => void;
  onClose: () => void;
  titulo?: string;
  descripcion?: string;
}

export function AdminPinModal({
  onConfirm,
  onClose,
  titulo = 'Autorización requerida',
  descripcion = 'Ingresa el PIN de un administrador para continuar.',
}: AdminPinModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { setTimeout(() => inputsRef.current[0]?.focus(), 80); }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler as any);
    return () => window.removeEventListener('keydown', handler as any);
  }, [onClose]);

  const handleChange = (value: string, idx: number) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[idx] = value;
    setDigits(next);
    setError('');
    if (value && idx < PIN_LENGTH - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(PIN_LENGTH).fill('');
    pasted.split('').forEach((c, i) => { next[i] = c; });
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, PIN_LENGTH - 1)]?.focus();
  };

  const pin = digits.join('');
  const isComplete = pin.length === PIN_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/verify-pin', { pin: parseInt(pin, 10) });
      onConfirm();
    } catch (err) {
      let msg = 'PIN incorrecto. Intenta de nuevo.';
      if (axios.isAxiosError(err)) msg = err.response?.data?.message ?? msg;
      setError(msg);
      setDigits(Array(PIN_LENGTH).fill(''));
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-5"
           style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)' }}>

        <button onClick={onClose} className="absolute top-4 right-4 btn-ghost btn-icon btn-sm" aria-label="Cerrar">
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-red-50">
            <ShieldAlert size={28} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>{titulo}</h2>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{descripcion}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cajas de PIN */}
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputsRef.current[i] = el; }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(e.target.value, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                disabled={loading}
                className={`w-11 h-13 text-center text-xl font-bold rounded-xl border-2 transition-colors outline-none
                  ${error ? 'border-red-400' : d ? 'border-blue-400' : 'border-gray-200'}
                  focus:border-blue-500`}
                style={{ height: '52px', caretColor: 'transparent' }}
              />
            ))}
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={loading || !isComplete}
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Verificando…</>
                : 'Confirmar'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}