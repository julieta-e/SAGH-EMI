import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { C } from '../constants';

export function NotifBell({ notificaciones }) {
  const [open, setOpen] = useState(false);
  const nLeidas = notificaciones.length;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: C.gray, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, position: 'relative' }}>
        <Bell size={14} />
        {nLeidas > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: 14, height: 14, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: -4, right: -4 }}>{Math.min(nLeidas, 9)}</span>}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 34, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: 300, zIndex: 200, maxHeight: 320, overflowY: 'auto' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 'bold', fontSize: 12, color: C.navy }}>Notificaciones</div>
          {notificaciones.length === 0 && <div style={{ padding: 16, fontSize: 12, color: C.gray, textAlign: 'center' }}>Sin notificaciones</div>}
          {notificaciones.map(n => (
            <div key={n.id} style={{ padding: '8px 14px', borderBottom: '1px solid #f8fafc', fontSize: 11 }}>
              <div style={{ color: n.tipo === 'success' ? '#16a34a' : n.tipo === 'warning' ? '#92400e' : C.navy }}>{n.msg}</div>
              <div style={{ color: '#94a3b8', marginTop: 2 }}>{n.fecha}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


