import React from 'react';
import { X } from 'lucide-react';
import { C } from '../constants/colors';


export const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100% !important; height: 100% !important; min-height: 100vh; overflow: hidden; }
    body { font-family: 'Georgia', serif; }
  `}</style>
);

export function EmptyState({ icon, titulo, desc }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: C.gray, textAlign: 'center' }}>
      <div style={{ color: '#cbd5e1', marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 'bold', color: '#64748b', marginBottom: 6 }}>{titulo}</div>
      <div style={{ fontSize: 13 }}>{desc}</div>
    </div>
  );
}

export function FormModal({ titulo, onClose, onGuardar, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 28, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: C.navy, fontSize: 16, fontWeight: 'bold' }}>{titulo}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', border: '1px solid #e2e8f0', borderRadius: 6, background: 'white', color: C.gray, cursor: 'pointer', fontWeight: 'bold', fontSize: 13 }}>Cancelar</button>
          <button onClick={onGuardar} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: 6, background: C.navy, color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: C.gray, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 6 }}>{label.toUpperCase()}</label>
      {children}
    </div>
  );
}
