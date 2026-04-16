import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { C } from '../constants/colors';
import { FormModal, FormField } from './SharedComponents';
import { btnPrimary, btnSmall, inputStyle } from '../styles/common';

export function MateriasView({ materias, setMaterias, docentes }) {
  const [filtro, setFiltro] = useState('Todos');
  const [modal, setModal] = useState(null);

  const guardar = (datos) => {
    if (datos.id) setMaterias(prev => prev.map(m => m.id === datos.id ? datos : m));
    else setMaterias(prev => [...prev, { ...datos, id: `m_${Date.now()}` }]);
    setModal(null);
  };

  const eliminar = (id) => {
    setMaterias(prev => prev.filter(m => m.id !== id));
    setModal(null);
  };

  const filtradas = filtro === 'Todos' ? materias : materias.filter(m => m.semestre === parseInt(filtro));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <select value={filtro} onChange={e => setFiltro(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 180 }}>
          <option value="Todos">Todos los Semestres</option>
          {[3, 4, 5, 6, 7, 8, 9, 10].map(s => <option key={s} value={s}>{s}° Semestre</option>)}
        </select>
        <button onClick={() => setModal({ nombre: '', semestre: 3, periodos: 2, docenteId: docentes[0]?.id || '', tipoAula: 'Aula' })} style={btnPrimary}>
          <Plus size={15} /> Nueva Materia
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', maxHeight: '65vh', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr style={{ background: C.grayLight }}>
              {['Materia', 'Semestre', 'Periodos', 'Tipo Aula', 'Docente Asignado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: C.gray, fontWeight: 'bold', letterSpacing: 1, borderBottom: '1px solid #e2e8f0' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtradas.map((m, i) => {
              const doc = docentes.find(d => d.id === m.docenteId);
              return (
                <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '600', fontSize: 13, color: C.navy }}>{m.nombre}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <span style={{ background: C.navy, color: C.gold, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{m.semestre}°</span>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 'bold', color: C.navy }}>{m.periodos}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: m.tipoAula === 'Laboratorio' ? '#ede9fe' : '#f1f5f9', color: m.tipoAula === 'Laboratorio' ? '#6d28d9' : '#475569', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{m.tipoAula}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: C.gray }}>{doc?.nombre || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button onClick={() => setModal({ ...m })} style={btnSmall}><Pencil size={13} /></button>
                    <button onClick={() => eliminar(m.id)} style={{ ...btnSmall, marginLeft: 6, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={13} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <FormModal titulo={modal.id ? 'Editar Materia' : 'Nueva Materia'} onClose={() => setModal(null)} onGuardar={() => guardar(modal)}>
          <FormField label="Nombre de la Materia">
            <input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Semestre">
              <select value={modal.semestre} onChange={e => setModal(m => ({ ...m, semestre: parseInt(e.target.value) }))} style={inputStyle}>
                {[3, 4, 5, 6, 7, 8, 9, 10].map(s => <option key={s} value={s}>{s}°</option>)}
              </select>
            </FormField>
            <FormField label="Periodos/Semana">
              <input type="number" min={1} max={8} value={modal.periodos} onChange={e => setModal(m => ({ ...m, periodos: parseInt(e.target.value) }))} style={inputStyle} />
            </FormField>
          </div>
          <FormField label="Tipo de Aula Requerida">
            <select value={modal.tipoAula} onChange={e => setModal(m => ({ ...m, tipoAula: e.target.value }))} style={inputStyle}>
              <option>Aula</option>
              <option>Laboratorio</option>
              <option>Auditorio</option>
              <option>Sala</option>
            </select>
          </FormField>
          <FormField label="Docente Asignado">
            <select value={modal.docenteId} onChange={e => setModal(m => ({ ...m, docenteId: e.target.value }))} style={inputStyle}>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}
