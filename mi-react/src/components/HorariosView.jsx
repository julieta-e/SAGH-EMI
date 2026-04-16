import React, { useState } from 'react';
import { Calendar, Pencil, Printer, Info, BookOpen, GripVertical, X, Trash2, Save, Eye } from 'lucide-react';
import { C } from '../constants/colors';
import { EmptyState } from './SharedComponents';
import { DIAS, RENDER_SLOTS } from '../constants/schedule';


export function HorariosView({ horario, docentes, aulas, materias, estadoValidacion, onCambio }) {
  const [semestreActivo, setSemestreActivo] = useState(3);
  const [editMode, setEditMode] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [swapTarget, setSwapTarget] = useState(null);
  const [modalCelda, setModalCelda] = useState(null);

  if (!horario) return (
    <EmptyState icon={<Calendar size={40} />} titulo="Sin horario generado"
      desc='Ve al "Generador" para crear un horario primero.' />
  );

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
    setDragging(null);
    setSwapTarget(null);
  };

  const handleClearCell = (dia, periodo) => {
    const nuevo = JSON.parse(JSON.stringify(horario));
    nuevo[semestreActivo][dia][periodo] = null;
    onCambio(nuevo);
    setModalCelda(null);
  };

  const handleChangeDocente = (dia, periodo, nuevoDocenteId) => {
    const nuevo = JSON.parse(JSON.stringify(horario));
    if (nuevo[semestreActivo][dia][periodo]) {
      nuevo[semestreActivo][dia][periodo].docenteId = nuevoDocenteId;
    }
    onCambio(nuevo);
    setModalCelda(null);
  };

  const handleChangeAula = (dia, periodo, nuevoAulaId) => {
    const nuevo = JSON.parse(JSON.stringify(horario));
    if (nuevo[semestreActivo][dia][periodo]) {
      nuevo[semestreActivo][dia][periodo].aulaId = nuevoAulaId || null;
    }
    onCambio(nuevo);
    setModalCelda(null);
  };

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

  const COLORES_MAT = ['#dbeafe', '#dcfce7', '#fef9c3', '#fce7f3', '#ede9fe', '#ffedd5', '#cffafe', '#f1f5f9'];
  const getMateriaColor = (matId) => {
    const idx = materias.findIndex(m => m.id === matId);
    return COLORES_MAT[idx % COLORES_MAT.length];
  };

  const celda_editing = modalCelda ? horarioSem[modalCelda.dia][modalCelda.periodo] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[3, 4, 5, 6, 7, 8, 9, 10].map(s => (
            <button key={s} onClick={() => setSemestreActivo(s)} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
              background: semestreActivo === s ? C.navy : '#e2e8f0',
              color: semestreActivo === s ? C.gold : C.gray,
            }}>{s}º</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {estadoValidacion === 'aprobado' && (
            <span style={{ background: '#dcfce7', color: '#166534', fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 'bold', border: '1px solid #16a34a' }}>
              ✓ APROBADO
            </span>
          )}
          <button onClick={() => setEditMode(!editMode)} style={{
            padding: '6px 14px', borderRadius: 6, border: `1px solid ${editMode ? C.gold : '#e2e8f0'}`,
            background: editMode ? `rgba(200,168,75,0.1)` : 'white',
            color: editMode ? C.gold : C.gray, cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Pencil size={14} /> {editMode ? 'Modo Edición ON' : 'Editar'}
          </button>
          <button style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: C.gray, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Printer size={14} /> PDF
          </button>
        </div>
      </div>

      {editMode && (
        <div style={{ background: `rgba(200,168,75,0.08)`, border: `1px dashed ${C.gold}`, borderRadius: 8, padding: '10px 16px', marginBottom: 10, fontSize: 12, color: '#92400e', display: 'flex', gap: 16, alignItems: 'center' }}>
          <Info size={14} />
          <span><strong>Modo edición activo:</strong> Haz clic en una celda para cambiar docente o aula. Arrastra para intercambiar celdas.</span>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 10, border: `2px solid ${C.navy}`, overflow: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr>
              <th style={{ background: '#f8fafc', borderBottom: `2px solid ${C.navy}`, borderRight: '1px solid #e2e8f0', padding: '12px 8px', width: 90, fontSize: 12, color: C.navy, fontWeight: 'bold' }}>HORA</th>
              {DIAS.map(dia => (
                <th key={dia} style={{ background: C.navy, borderBottom: `2px solid ${C.navy}`, borderRight: '1px solid rgba(255,255,255,0.1)', padding: '12px', color: C.gold, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>{dia.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RENDER_SLOTS.map((slot, si) => {
              if (slot.type === 'break') {
                return (
                  <tr key={si}>
                    <td style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '4px 8px', fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', textAlign: 'center' }}>
                      {slot.inicio}
                    </td>
                    <td colSpan={5} style={{
                      background: 'repeating-linear-gradient(45deg, #fefce8, #fefce8 8px, #fef9c3 8px, #fef9c3 16px)',
                      borderBottom: '1px solid #e2e8f0', padding: '4px', textAlign: 'center',
                      fontSize: 10, fontWeight: 'bold', color: '#92400e', letterSpacing: 2
                    }}>
                      — {slot.label.toUpperCase()} ({slot.inicio} - {slot.fin}) —
                    </td>
                  </tr>
                );
              }

              const p = slot.idx;
              return (
                <tr key={si} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '8px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ fontSize: 11, fontWeight: 'bold', color: C.navy }}>P{p + 1}</div>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8' }}>{slot.inicio}</div>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8' }}>{slot.fin}</div>
                  </td>
                  {[0, 1, 2, 3, 4].map(dia => {
                    const celda = celdasRender[dia][p];
                    const isTarget = swapTarget?.dia === dia && swapTarget?.periodo === p;
                    const isDragging = dragging?.dia === dia && dragging?.periodo === p;

                    if (celda.tipo === 'clase') {
                      const docente = docentes.find(d => d.id === celda.data.docenteId);
                      const aula = aulas.find(a => a.id === celda.data.aulaId);
                      const bgColor = getMateriaColor(celda.data.id);
                      return (
                        <td key={dia}
                          onClick={() => editMode && setModalCelda({ dia, periodo: p })}
                          draggable={editMode}
                          onDragStart={() => { if (editMode) setDragging({ dia, periodo: p }); }}
                          onDragOver={e => { e.preventDefault(); if (editMode) setSwapTarget({ dia, periodo: p }); }}
                          onDrop={() => handleSwap(dia, p)}
                          onDragEnd={() => { setDragging(null); setSwapTarget(null); }}
                          style={{
                            background: isDragging ? '#dbeafe' : isTarget ? '#fef9c3' : bgColor,
                            borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0',
                            padding: '6px 8px', cursor: editMode ? 'pointer' : 'default', verticalAlign: 'top',
                            opacity: isDragging ? 0.5 : 1, transition: 'opacity 0.2s',
                            outline: isTarget ? `2px dashed ${C.gold}` : 'none',
                            position: 'relative'
                          }}>
                          {editMode && <div style={{ position: 'absolute', top: 4, right: 4, color: '#94a3b8' }}><GripVertical size={10} /></div>}
                          <div style={{ fontWeight: 'bold', fontSize: 12, color: C.navy, lineHeight: 1.2, paddingRight: editMode ? 14 : 0 }}>{celda.data.nombre}</div>
                          <div style={{ fontSize: 10, color: '#475569', marginTop: 3, borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 3 }}>{docente?.nombre || '—'}</div>
                          {aula && <div style={{ fontSize: 9, color: '#64748b', marginTop: 1 }}>📍 {aula.nombre}</div>}
                          {editMode && <div style={{ fontSize: 9, color: C.gold, marginTop: 2 }}>✎ Click para editar</div>}
                        </td>
                      );
                    } else if (celda.tipo === 'biblioteca') {
                      return (
                        <td key={dia}
                          onDragOver={e => { e.preventDefault(); if (editMode) setSwapTarget({ dia, periodo: p }); }}
                          onDrop={() => handleSwap(dia, p)}
                          style={{
                            background: isTarget ? '#fef9c3' : '#f0fdf4', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0',
                            padding: 6, textAlign: 'center', outline: isTarget ? `2px dashed ${C.gold}` : 'none'
                          }}>
                          <div style={{ fontSize: 10, color: '#16a34a', opacity: 0.7 }}>
                            <BookOpen size={14} style={{ margin: '0 auto 2px' }} />
                            <div style={{ fontWeight: 'bold', letterSpacing: 1 }}>BIBLIOTECA</div>
                          </div>
                        </td>
                      );
                    } else {
                      return (
                        <td key={dia}
                          onDragOver={e => { e.preventDefault(); if (editMode) setSwapTarget({ dia, periodo: p }); }}
                          onDrop={() => handleSwap(dia, p)}
                          style={{
                            background: isTarget ? '#fef9c3' : '#f8fafc', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0',
                            outline: isTarget ? `2px dashed ${C.gold}` : 'none'
                          }} />
                      );
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: C.gray }}>
        <span>📌 <strong>Regla Dura:</strong> Lunes inicia a las 07:45</span>
        <span>📚 <strong>Puente:</strong> Horas intermedias = Biblioteca</span>
        <span>🔢 <strong>Total:</strong> ~20 periodos/semana por semestre</span>
      </div>

      {modalCelda && celda_editing && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 28, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: C.navy, fontSize: 16 }}>Editar Celda</h3>
              <button onClick={() => setModalCelda(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray }}><X size={20} /></button>
            </div>
            <div style={{ background: C.grayLight, borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <div style={{ fontWeight: 'bold', color: C.navy }}>{celda_editing.nombre}</div>
              <div style={{ fontSize: 12, color: C.gray }}>{DIAS[modalCelda.dia]} · Periodo {modalCelda.periodo + 1}</div>
            </div>

            <label style={{ fontSize: 12, color: C.gray, display: 'block', marginBottom: 6, fontWeight: 'bold' }}>DOCENTE</label>
            <select
              value={celda_editing.docenteId}
              onChange={e => handleChangeDocente(modalCelda.dia, modalCelda.periodo, e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 16, fontSize: 13 }}
            >
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre} ({d.tipo})</option>)}
            </select>

            <label style={{ fontSize: 12, color: C.gray, display: 'block', marginBottom: 6, fontWeight: 'bold' }}>AULA</label>
            <select
              value={celda_editing.aulaId || ''}
              onChange={e => handleChangeAula(modalCelda.dia, modalCelda.periodo, e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 20, fontSize: 13 }}
            >
              <option value="">Sin asignar</option>
              {aulas.filter(a => a.disponible).map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.tipo}) — Cap. {a.capacidad}</option>)}
            </select>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleClearCell(modalCelda.dia, modalCelda.periodo)} style={{
                flex: 1, padding: '9px', border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: 13, fontWeight: 'bold'
              }}>
                <Trash2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Vaciar Celda
              </button>
              <button onClick={() => setModalCelda(null)} style={{
                flex: 1, padding: '9px', border: 'none', borderRadius: 6, background: C.navy, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 'bold'
              }}>
                <Save size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
