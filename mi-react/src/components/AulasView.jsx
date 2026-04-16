import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { C } from '../constants/colors';
import { FormModal, FormField } from './SharedComponents';
import { btnPrimary, btnSmall, inputStyle } from '../styles/common';

export function AulasView({ aulas, setAulas }) {
  const [modal, setModal] = useState(null);

  const guardar = (datos) => {
    if (datos.id) setAulas(prev => prev.map(a => a.id === datos.id ? datos : a));
    else setAulas(prev => [...prev, { ...datos, id: `a_${Date.now()}` }]);
    setModal(null);
  };

  const eliminar = (id) => {
    setAulas(prev => prev.filter(a => a.id !== id));
    setModal(null);
  };

  const toggleDisponible = (id) => {
    setAulas(prev => prev.map(a => a.id === id ? { ...a, disponible: !a.disponible } : a));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {['Aula', 'Laboratorio', 'Auditorio', 'Sala'].map(t => {
            const cnt = aulas.filter(a => a.tipo === t).length;
            return (
              <div key={t} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 18 }}>{cnt}</div>
                <div style={{ fontSize: 11, color: C.gray }}>{t}s</div>
              </div>
            );
          })}
        </div>
        <button onClick={() => setModal({ nombre: '', tipo: 'Aula', capacidad: 30, edificio: 'A', disponible: true })} style={btnPrimary}>
          <Plus size={15} /> Nueva Aula
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {aulas.map(a => (
          <div key={a.id} style={{
            background: 'white', borderRadius: 10, border: `1px solid ${a.disponible ? '#e2e8f0' : '#fecaca'}`,
            padding: 16, opacity: a.disponible ? 1 : 0.7
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 14 }}>{a.nombre}</div>
                <div style={{ fontSize: 11, color: C.gray }}>Edificio {a.edificio}</div>
              </div>
              <span style={{
                background: a.tipo === 'Laboratorio' ? '#ede9fe' : a.tipo === 'Auditorio' ? '#fef9c3' : '#f1f5f9',
                color: a.tipo === 'Laboratorio' ? '#6d28d9' : a.tipo === 'Auditorio' ? '#92400e' : '#475569',
                padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 'bold'
              }}>{a.tipo}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1, background: C.grayLight, borderRadius: 6, padding: '6px', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', color: C.navy }}>{a.capacidad}</div>
                <div style={{ fontSize: 10, color: C.gray }}>Capacidad</div>
              </div>
              <div style={{ flex: 1, background: a.disponible ? '#dcfce7' : '#fee2e2', borderRadius: 6, padding: '6px', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', color: a.disponible ? '#166534' : '#dc2626' }}>{a.disponible ? 'Disp.' : 'No Disp.'}</div>
                <div style={{ fontSize: 10, color: C.gray }}>Estado</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => toggleDisponible(a.id)} style={{ ...btnSmall, flex: 1, justifyContent: 'center' }}>
                {a.disponible ? 'Deshabilitar' : 'Habilitar'}
              </button>
              <button onClick={() => setModal({ ...a })} style={btnSmall}><Pencil size={13} /></button>
              <button onClick={() => eliminar(a.id)} style={{ ...btnSmall, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <FormModal titulo={modal.id ? 'Editar Aula' : 'Nueva Aula'} onClose={() => setModal(null)} onGuardar={() => guardar(modal)}>
          <FormField label="Nombre del Aula">
            <input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Tipo">
              <select value={modal.tipo} onChange={e => setModal(m => ({ ...m, tipo: e.target.value }))} style={inputStyle}>
                <option>Aula</option>
                <option>Laboratorio</option>
                <option>Auditorio</option>
                <option>Sala</option>
              </select>
            </FormField>
            <FormField label="Edificio">
              <input value={modal.edificio} onChange={e => setModal(m => ({ ...m, edificio: e.target.value }))} style={inputStyle} />
            </FormField>
          </div>
          <FormField label="Capacidad">
            <input type="number" min={1} value={modal.capacidad} onChange={e => setModal(m => ({ ...m, capacidad: parseInt(e.target.value) }))} style={inputStyle} />
          </FormField>
          <FormField label="Disponible">
            <select value={modal.disponible ? 'si' : 'no'} onChange={e => setModal(m => ({ ...m, disponible: e.target.value === 'si' }))} style={inputStyle}>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}
