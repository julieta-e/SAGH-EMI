import React, { useState } from 'react';
import { Calendar, Pencil, Trash2, Save, X, Printer, Info, BookOpen } from 'lucide-react';
import { C, DIAS, RENDER_SLOTS } from '../../../shared/constants';
import { EmptyState, FormField } from '../../../shared/components/Forms';
import { inputStyle } from '../../../shared/styles/inlineStyles';
import '../styles/scheduleManagement.css';

export function Mod4HorariosView({ horario, docentes, aulas, materias, estadoHorario, onCambio }) {
  const [semestreActivo, setSemestreActivo] = useState(3);
  const [editMode, setEditMode] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [swapTarget, setSwapTarget] = useState(null);
  const [modalCelda, setModalCelda] = useState(null);
  if (!horario) return <EmptyState icon={<Calendar size={40} />} titulo="Sin horario generado" desc='Ve al "MOD-3 Generación" para crear un horario primero.' />;

  const horarioSem = horario[semestreActivo];

  const handleSwap = (dia2, per2) => {
    if (!dragging) return;
    const { dia: dia1, periodo: per1 } = dragging;
    if (dia1 === dia2 && per1 === per2) { setDragging(null); setSwapTarget(null); return; }
    const nuevo = JSON.parse(JSON.stringify(horario));
    const tmp = nuevo[semestreActivo][dia2][per2];
    nuevo[semestreActivo][dia2][per2] = nuevo[semestreActivo][dia1][per1];
    nuevo[semestreActivo][dia1][per1] = tmp;
    onCambio(nuevo);
    setDragging(null); setSwapTarget(null);
  };

  const celda_editing = modalCelda ? horarioSem[modalCelda.dia][modalCelda.periodo] : null;

  const COLORES = ['#dbeafe', '#dcfce7', '#fef9c3', '#fce7f3', '#ede9fe', '#ffedd5', '#cffafe', '#f1f5f9', '#fef2f2', '#f0fdf4'];
  const getMateriaColor = (matId) => { const idx = materias.findIndex(m => m.id === matId); return COLORES[idx % COLORES.length]; };

  const celdasRender = {};
  for (let d = 0; d < 5; d++) {
    celdasRender[d] = {};
    let primera = -1, ultima = -1;
    for (let p = 0; p < 8; p++) { if (horarioSem[d][p]) { if (primera === -1) primera = p; ultima = p; } }
    for (let p = 0; p < 8; p++) {
      if (horarioSem[d][p]) celdasRender[d][p] = { tipo: 'clase', data: horarioSem[d][p] };
      else if (p > primera && p < ultima && primera !== -1) celdasRender[d][p] = { tipo: 'biblioteca' };
      else celdasRender[d][p] = { tipo: 'vacio' };
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Controles superiores */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {[3,4,5,6,7,8,9,10].map(s => (
            <button key={s} onClick={() => setSemestreActivo(s)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', background: semestreActivo === s ? C.navy : '#e2e8f0', color: semestreActivo === s ? C.gold : C.gray }}>
              {s}°
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {estadoHorario === 'aprobado' && <span style={{ background: '#dcfce7', color: '#166534', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 'bold', border: '1px solid #16a34a' }}>✓ APROBADO</span>}
          <button onClick={() => setEditMode(!editMode)} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${editMode ? C.gold : '#e2e8f0'}`, background: editMode ? `rgba(200,168,75,0.1)` : 'white', color: editMode ? C.gold : C.gray, cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Pencil size={13} /> {editMode ? 'Edición ON' : 'Editar'}
          </button>
          <button style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: C.gray, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Printer size={13} /> Imprimir
          </button>
        </div>
      </div>

      {editMode && (
        <div style={{ background: `rgba(200,168,75,0.08)`, border: `1px dashed ${C.gold}`, borderRadius: 8, padding: '8px 14px', marginBottom: 8, fontSize: 11, color: '#92400e', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Info size={13} />
          <span><strong>Modo edición:</strong> Haz clic en una celda para cambiar docente/aula. Arrastra para intercambiar celdas.</span>
        </div>
      )}

      {/* Tabla de horario */}
      <div style={{ background: 'white', borderRadius: 10, border: `2px solid ${C.navy}`, overflow: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr>
              <th style={{ background: '#f8fafc', borderBottom: `2px solid ${C.navy}`, borderRight: '1px solid #e2e8f0', padding: '10px 8px', width: 80, fontSize: 11, color: C.navy, fontWeight: 'bold' }}>HORA</th>
              {DIAS.map(dia => (
                <th key={dia} style={{ background: C.navy, borderBottom: `2px solid ${C.navy}`, borderRight: '1px solid rgba(255,255,255,0.1)', padding: '10px', color: C.gold, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>{dia.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RENDER_SLOTS.map((slot, si) => {
              if (slot.type === 'break') {
                return (
                  <tr key={si}>
                    <td style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '3px 8px', fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', textAlign: 'center' }}>{slot.inicio}</td>
                    <td colSpan={5} style={{ background: 'repeating-linear-gradient(45deg, #fefce8, #fefce8 6px, #fef9c3 6px, #fef9c3 12px)', borderBottom: '1px solid #e2e8f0', padding: '3px', textAlign: 'center', fontSize: 10, fontWeight: 'bold', color: '#92400e', letterSpacing: 2 }}>
                      — RECESO ({slot.inicio} - {slot.fin}) —
                    </td>
                  </tr>
                );
              }
              const p = slot.idx;
              return (
                <tr key={si} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '6px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ fontSize: 11, fontWeight: 'bold', color: C.navy }}>P{p+1}</div>
                    <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#94a3b8' }}>{slot.inicio}</div>
                    <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#94a3b8' }}>{slot.fin}</div>
                  </td>
                  {[0,1,2,3,4].map(dia => {
                    const celda = celdasRender[dia][p];
                    const isTarget = swapTarget?.dia === dia && swapTarget?.periodo === p;
                    const isDragging = dragging?.dia === dia && dragging?.periodo === p;

                    if (celda.tipo === 'clase') {
                      const docente = docentes.find(d => d.id === celda.data.docenteId);
                      const aula = aulas.find(a => a.id === celda.data.aulaId);
                      return (
                        <td key={dia}
                          onClick={() => editMode && setModalCelda({ dia, periodo: p })}
                          draggable={editMode}
                          onDragStart={() => editMode && setDragging({ dia, periodo: p })}
                          onDragOver={e => { e.preventDefault(); editMode && setSwapTarget({ dia, periodo: p }); }}
                          onDrop={() => handleSwap(dia, p)}
                          onDragEnd={() => { setDragging(null); setSwapTarget(null); }}
                          style={{ background: isDragging ? '#dbeafe' : isTarget ? '#fef9c3' : getMateriaColor(celda.data.id), borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '5px 7px', cursor: editMode ? 'pointer' : 'default', verticalAlign: 'top', opacity: isDragging ? 0.5 : 1, outline: isTarget ? `2px dashed ${C.gold}` : 'none', position: 'relative' }}>
                          {celda.data.critica && <span style={{ position: 'absolute', top: 2, right: 4, color: '#dc2626', fontSize: 9 }}>★</span>}
                          <div style={{ fontWeight: 'bold', fontSize: 11, color: C.navy, lineHeight: 1.2 }}>{celda.data.nombre}</div>
                          <div style={{ fontSize: 10, color: '#475569', marginTop: 2, borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: 2 }}>{docente?.nombre || '—'}</div>
                          {aula && <div style={{ fontSize: 9, color: '#64748b', marginTop: 1 }}>📍 {aula.nombre}</div>}
                        </td>
                      );
                    } else if (celda.tipo === 'biblioteca') {
                      return (
                        <td key={dia} onDragOver={e => { e.preventDefault(); editMode && setSwapTarget({ dia, periodo: p }); }} onDrop={() => handleSwap(dia, p)} style={{ background: isTarget ? '#fef9c3' : '#f0fdf4', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: 5, textAlign: 'center', outline: isTarget ? `2px dashed ${C.gold}` : 'none' }}>
                          <div style={{ fontSize: 10, color: '#16a34a', opacity: 0.6 }}>
                            <BookOpen size={12} style={{ margin: '0 auto 1px' }} />
                            <div style={{ fontSize: 9, fontWeight: 'bold', letterSpacing: 1 }}>BIBLIOTECA</div>
                          </div>
                        </td>
                      );
                    } else {
                      return (
                        <td key={dia} onDragOver={e => { e.preventDefault(); editMode && setSwapTarget({ dia, periodo: p }); }} onDrop={() => handleSwap(dia, p)} style={{ background: isTarget ? '#fef9c3' : '#f8fafc', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', outline: isTarget ? `2px dashed ${C.gold}` : 'none' }} />
                      );
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: C.gray }}>
        <span>★ Materia crítica (priorizada)</span>
        <span>📚 Puente = Biblioteca</span>
        <span>📌 Lunes inicia a las 07:45 (Regla RAC-03)</span>
      </div>

      {/* Modal edición celda */}
      {modalCelda && celda_editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 26, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, color: C.navy, fontSize: 15 }}>Editar Celda (HU-52/53)</h3>
              <button onClick={() => setModalCelda(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray }}><X size={18} /></button>
            </div>
            <div style={{ background: C.grayLight, borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
              <div style={{ fontWeight: 'bold', color: C.navy }}>{celda_editing.nombre}</div>
              <div style={{ fontSize: 12, color: C.gray }}>{DIAS[modalCelda.dia]} · Periodo {modalCelda.periodo + 1}</div>
            </div>
            <FormField label="DOCENTE">
              <select value={celda_editing.docenteId} onChange={e => { const n = JSON.parse(JSON.stringify(horario)); n[semestreActivo][modalCelda.dia][modalCelda.periodo].docenteId = e.target.value; onCambio(n); setModalCelda(null); }} style={inputStyle}>
                {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre} ({d.tipo})</option>)}
              </select>
            </FormField>
            <div style={{ marginTop: 12 }} />
            <FormField label="AULA">
              <select value={celda_editing.aulaId || ''} onChange={e => { const n = JSON.parse(JSON.stringify(horario)); n[semestreActivo][modalCelda.dia][modalCelda.periodo].aulaId = e.target.value || null; onCambio(n); setModalCelda(null); }} style={inputStyle}>
                <option value="">Sin asignar</option>
                {aulas.filter(a => a.disponible).map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.tipo}) — Cap. {a.capacidad}</option>)}
              </select>
            </FormField>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button onClick={() => { const n = JSON.parse(JSON.stringify(horario)); n[semestreActivo][modalCelda.dia][modalCelda.periodo] = null; onCambio(n); setModalCelda(null); }} style={{ flex: 1, padding: '8px', border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>
                <Trash2 size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />Vaciar
              </button>
              <button onClick={() => setModalCelda(null)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 6, background: C.navy, color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>
                <Save size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MOD-5: VALIDACIÓN
// ==========================================
