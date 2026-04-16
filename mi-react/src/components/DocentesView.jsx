import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { C } from '../constants/colors';
import { FormModal, FormField } from './SharedComponents';
import { btnPrimary, btnSmall, inputStyle } from '../styles/common';

export function DocentesView({ docentes, setDocentes }) {
  const [modal, setModal] = useState(null);

  const guardar = (datos) => {
    if (datos.id) {
      setDocentes(prev => prev.map(d => d.id === datos.id ? datos : d));
    } else {
      setDocentes(prev => [...prev, { ...datos, id: `d${Date.now()}` }]);
    }
    setModal(null);
  };

  const eliminar = (id) => {
    setDocentes(prev => prev.filter(d => d.id !== id));
    setModal(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ margin: 0, color: C.gray, fontSize: 13 }}>
          Regla dura: Ningún docente puede exceder su límite de horas semanales.
        </p>
        <button onClick={() => setModal({ nombre: '', tipo: 'Civil', maxHoras: 25, especialidad: '' })} style={btnPrimary}>
          <Plus size={15} /> Nuevo Docente
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.grayLight }}>
              {['Nombre', 'Tipo', 'Especialidad', 'Máx Hrs', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: C.gray, fontWeight: 'bold', letterSpacing: 1, borderBottom: '1px solid #e2e8f0' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docentes.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                <td style={{ padding: '10px 14px', fontWeight: '600', fontSize: 13, color: C.navy }}>{d.nombre}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    background: d.tipo.includes('Militar') ? '#dcfce7' : '#dbeafe',
                    color: d.tipo.includes('Militar') ? '#166534' : '#1e40af',
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 'bold'
                  }}>{d.tipo}</span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: C.gray }}>{d.especialidad}</td>
                <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 'bold', color: C.navy }}>{d.maxHoras}</td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => setModal({ ...d })} style={btnSmall}><Pencil size={13} /></button>
                  <button onClick={() => eliminar(d.id)} style={{ ...btnSmall, marginLeft: 6, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <FormModal
          titulo={modal.id ? 'Editar Docente' : 'Nuevo Docente'}
          onClose={() => setModal(null)}
          onGuardar={() => guardar(modal)}
        >
          <FormField label="Nombre Completo">
            <input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} />
          </FormField>
          <FormField label="Tipo">
            <select value={modal.tipo} onChange={e => setModal(m => ({ ...m, tipo: e.target.value }))} style={inputStyle}>
              <option>Civil</option>
              <option>Militar Activo</option>
              <option>Militar Reserva</option>
            </select>
          </FormField>
          <FormField label="Especialidad">
            <input value={modal.especialidad} onChange={e => setModal(m => ({ ...m, especialidad: e.target.value }))} style={inputStyle} />
          </FormField>
          <FormField label="Máx. Horas Semanales">
            <input type="number" min={1} max={40} value={modal.maxHoras} onChange={e => setModal(m => ({ ...m, maxHoras: parseInt(e.target.value) }))} style={inputStyle} />
          </FormField>
        </FormModal>
      )}
    </div>
  );
}
