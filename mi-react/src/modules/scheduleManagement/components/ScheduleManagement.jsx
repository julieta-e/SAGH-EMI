import React, { useState, useMemo } from 'react';
import { 
  Calendar, Pencil, Trash2, Save, X, Printer, Info, 
  BookOpen, Filter, Users, Home, Layers, AlertTriangle 
} from 'lucide-react';
import { C, DIAS, RENDER_SLOTS } from '../../../shared/constants';
import { EmptyState, FormField } from '../../../shared/components/Forms';
import { inputStyle } from '../../../shared/styles/inlineStyles';
import '../styles/scheduleManagement.css';

export function Mod4HorariosView({ horario, docentes, aulas, materias, estadoHorario, onCambio }) {
  // REQ-47 a REQ-50: Conmutador de Vistas y Categorías
  const [vistaTipo, setVistaTipo] = useState('semestre'); // 'semestre' | 'docente' | 'aula' | 'general'
  const [semestreActivo, setSemestreActivo] = useState(3);
  const [docenteActivo, setDocenteActivo] = useState('');
  const [aulaActiva, setAulaActiva] = useState('');
  
  // REQ-51: Filtro de búsqueda textual 
  const [filtroTexto, setFiltroTexto] = useState('');

  // REQ-52 y REQ-53: Modos de interacción y edición manual
  const [editMode, setEditMode] = useState(false);
  const [dragging, setDragging] = useState(null); 
  const [swapTarget, setSwapTarget] = useState(null); 
  const [modalCelda, setModalCelda] = useState(null); 

  // CONTROL DE CAMBIO DE VISTA SEGURO: Limpia filtros para evitar colapsos de pantalla
  const cambiarVista = (nuevaVista) => {
    setFiltroTexto('');
    setDocenteActivo('');
    setAulaActiva('');
    setVistaTipo(nuevaVista);
  };

  // Renderizado defensivo inicial
  if (!horario || Object.keys(horario).length === 0) {
    return (
      <EmptyState 
        icon={<Calendar size={40} />} 
        titulo="Sin horario generado disponible" 
        desc='Por favor, diríjase al módulo de "Generación Algorítmica (MOD-3)" para establecer la base de datos horaria del presente ciclo académico.' 
      />
    );
  }

  // REQ-54: Motor Analítico de Conflictos en Tiempo Real
  const mapaConflictos = useMemo(() => {
    const docenteOcupacion = {}; 
    const aulaOcupacion = {};    

    Object.keys(horario || {}).forEach(sem => {
      const semData = horario[sem] || {};
      for (let d = 0; d < 5; d++) {
        const diaData = semData[d] || {};
        for (let p = 0; p < 8; p++) {
          const celda = diaData[p];
          if (celda) {
            if (celda.docenteId) {
              const kDoc = `${d}-${p}-${celda.docenteId}`;
              docenteOcupacion[kDoc] = (docenteOcupacion[kDoc] || 0) + 1;
            }
            if (celda.aulaId) {
              const kAula = `${d}-${p}-${celda.aulaId}`;
              aulaOcupacion[kAula] = (aulaOcupacion[kAula] || 0) + 1;
            }
          }
        }
      }
    });

    return { docenteOcupacion, aulaOcupacion };
  }, [horario]);

  // REQ-47 a REQ-51: Compilador Matricial Dinámico Multidimensional
  const celdasRender = useMemo(() => {
    const grid = {};
    for (let d = 0; d < 5; d++) {
      grid[d] = {};
      for (let p = 0; p < 8; p++) {
        grid[d][p] = { tipo: 'vacio', clases: [] };
      }
    }

    Object.keys(horario).forEach(sem => {
      if (vistaTipo === 'semestre' && Number(sem) !== Number(semestreActivo)) return;

      for (let d = 0; d < 5; d++) {
        for (let p = 0; p < 8; p++) {
          const celdaData = horario[sem]?.[d]?.[p];
          if (!celdaData) continue;

          // REQ-48: Filtrado estricto por docente titular
          if (vistaTipo === 'docente' && docenteActivo && celdaData.docenteId !== docenteActivo) continue;
          
          // REQ-50: Filtrado estricto por aula física
          if (vistaTipo === 'aula' && aulaActiva && celdaData.aulaId !== aulaActiva) continue;
          
          // REQ-51: Filtro de búsqueda predictiva / Vista General
          if (vistaTipo === 'general' && filtroTexto) {
            const matchMateria = celdaData.nombre?.toLowerCase().includes(filtroTexto.toLowerCase());
            const docNom = (docentes || []).find(doc => doc.id === celdaData.docenteId)?.nombre || '';
            const matchDocente = docNom.toLowerCase().includes(filtroTexto.toLowerCase());
            if (!matchMateria && !matchDocente) continue;
          }

          grid[d][p].clases.push({
            ...celdaData,
            semestreOriginal: sem
          });
        }
      }
    });

    // Recalcular puentes de biblioteca obligatorios (Solo en vista por Semestre/Grupo)
    if (vistaTipo === 'semestre') {
      for (let d = 0; d < 5; d++) {
        let primera = -1, ultima = -1;
        for (let p = 0; p < 8; p++) {
          if (grid[d][p].clases.length > 0) {
            if (primera === -1) primera = p;
            ultima = p;
          }
        }
        for (let p = 0; p < 8; p++) {
          if (grid[d][p].clases.length > 0) {
            grid[d][p].tipo = 'clase';
          } else if (p > primera && p < ultima && primera !== -1) {
            grid[d][p].tipo = 'biblioteca';
          } else {
            grid[d][p].tipo = 'vacio';
          }
        }
      }
    } else {
      for (let d = 0; d < 5; d++) {
        for (let p = 0; p < 8; p++) {
          grid[d][p].tipo = grid[d][p].clases.length > 0 ? 'clase' : 'vacio';
        }
      }
    }

    return grid;
  }, [horario, vistaTipo, semestreActivo, docenteActivo, aulaActiva, filtroTexto, docentes]);

  // REQ-52: Intercambio por Arrastre Seguro (Drag & Drop Inter-Semestral)
  const handleSwap = (dia2, per2, destinoSemestre) => {
    if (!dragging) return;
    const { semestre: sem1, dia: dia1, periodo: per1 } = dragging;
    const sem2 = destinoSemestre || sem1;

    if (sem1 === sem2 && dia1 === dia2 && per1 === per2) {
      setDragging(null);
      setSwapTarget(null);
      return;
    }

    const nuevo = structuredClone(horario);
    
    if (!nuevo[sem1]) nuevo[sem1] = {};
    if (!nuevo[sem2]) nuevo[sem2] = {};
    if (!nuevo[sem1][dia1]) nuevo[sem1][dia1] = {};
    if (!nuevo[sem2][dia2]) nuevo[sem2][dia2] = {};

    const tmp = nuevo[sem1][dia1][per1] || null;
    nuevo[sem1][dia1][per1] = nuevo[sem2][dia2][per2] || null;
    nuevo[sem2][dia2][per2] = tmp;

    onCambio(nuevo);
    setDragging(null);
    setSwapTarget(null);
  };

  const ejecutarImpresion = () => {
    window.print();
  };

  const celda_editing = modalCelda ? horario[modalCelda.semestre]?.[modalCelda.dia]?.[modalCelda.periodo] : null;
  
  const COLORES = ['#dbeafe', '#dcfce7', '#fef9c3', '#fce7f3', '#ede9fe', '#ffedd5', '#cffafe', '#f1f5f9', '#fef2f2', '#f0fdf4'];
  const getMateriaColor = (matId) => { 
    const idx = (materias || []).findIndex(m => m.id === matId); 
    return idx !== -1 ? COLORES[idx % COLORES.length] : '#f1f5f9'; 
  };

  return (
    <div className="schedule-management-module" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      
      {/* SECCIÓN DE BOTONES DE CONTROL DE VISTAS */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => cambiarVista('semestre')} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6, background: vistaTipo === 'semestre' ? C.navy : '#e2e8f0', color: vistaTipo === 'semestre' ? C.gold : C.gray }}>
            <Layers size={14} /> Por Semestre / Grupo
          </button>
          <button onClick={() => cambiarVista('docente')} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6, background: vistaTipo === 'docente' ? C.navy : '#e2e8f0', color: vistaTipo === 'docente' ? C.gold : C.gray }}>
            <Users size={14} /> Por Docente
          </button>
          <button onClick={() => cambiarVista('aula')} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6, background: vistaTipo === 'aula' ? C.navy : '#e2e8f0', color: vistaTipo === 'aula' ? C.gold : C.gray }}>
            <Home size={14} /> Por Aula Física
          </button>
          <button onClick={() => cambiarVista('general')} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6, background: vistaTipo === 'general' ? C.navy : '#e2e8f0', color: vistaTipo === 'general' ? C.gold : C.gray }}>
            <Filter size={14} /> Vista General / Filtros
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {estadoHorario === 'aprobado' && (
            <span style={{ background: '#dcfce7', color: '#166534', fontSize: 11, padding: '4px 12px', borderRadius: 20, fontWeight: 'bold', border: '1px solid #16a34a' }}>✓ HORARIO APROBADO</span>
          )}
          <button onClick={() => setEditMode(!editMode)} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${editMode ? C.gold : '#e2e8f0'}`, background: editMode ? `rgba(200,168,75,0.1)` : 'white', color: editMode ? C.gold : C.gray, cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Pencil size={13} /> {editMode ? 'Modo Edición: Activo' : 'Habilitar Ajustes'}
          </button>
          <button onClick={ejecutarImpresion} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: 'white', color: C.navy, cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Printer size={13} /> Imprimir Reporte
          </button>
        </div>
      </div>

      {/* FILTROS SUB-DEPENDIENTES DINÁMICOS */}
      <div className="no-print" style={{ background: 'white', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {vistaTipo === 'semestre' && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 'bold', color: C.navy, marginRight: 8 }}>Ciclo Académico:</span>
            {[3,4,5,6,7,8,9,10].map(s => (
              <button key={s} onClick={() => setSemestreActivo(s)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', background: semestreActivo === s ? C.navy : '#f1f5f9', color: semestreActivo === s ? C.gold : C.gray }}>
                {s}° Semestre
              </button>
            ))}
          </div>
        )}

        {vistaTipo === 'docente' && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', width: '100%' }}>
            <span style={{ fontSize: 12, fontWeight: 'bold', color: C.navy }}>Cuerpo Docente:</span>
            <select value={docenteActivo} onChange={e => setDocenteActivo(e.target.value)} style={{ ...inputStyle, maxWidth: 350, padding: '6px 10px' }}>
              <option value="">-- Seleccione un docente para filtrar su horario --</option>
              {(docentes || []).map(d => <option key={d.id} value={d.id}>{d.nombre} ({d.tipo})</option>)}
            </select>
          </div>
        )}

        {vistaTipo === 'aula' && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', width: '100%' }}>
            <span style={{ fontSize: 12, fontWeight: 'bold', color: C.navy }}>Ocupación de Aula:</span>
            <select value={aulaActiva} onChange={e => setAulaActiva(e.target.value)} style={{ ...inputStyle, maxWidth: 350, padding: '6px 10px' }}>
              <option value="">-- Seleccione un espacio físico para consultar disponibilidad --</option>
              {(aulas || []).map(a => <option key={a.id} value={a.id}>{a.nombre} [Capacidad: {a.capacidad} est.]</option>)}
            </select>
          </div>
        )}

        {vistaTipo === 'general' && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', width: '100%' }}>
            <span style={{ fontSize: 12, fontWeight: 'bold', color: C.navy }}>Buscador Global:</span>
            <input type="text" placeholder="Escriba el nombre de la materia o el docente titular..." value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} style={{ ...inputStyle, maxWidth: 400, padding: '6px 12px' }} />
          </div>
        )}
      </div>

      {editMode && (
        <div className="no-print" style={{ background: `rgba(200,168,75,0.06)`, border: `1px dashed ${C.gold}`, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400e', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Info size={14} />
          <span><strong>Ajustes manuales activos:</strong> Haga clic en las materias asignadas para cambiar sus dependencias o arrástrelas a otras celdas para reubicarlas.</span>
        </div>
      )}

      {/* REQ-47: GRID MATRICIAL INSTITUCIONAL */}
      <div className="print-container" style={{ background: 'white', borderRadius: 10, border: `2px solid ${C.navy}`, overflow: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
          <thead>
            <tr>
              <th style={{ background: '#f8fafc', borderBottom: `2px solid ${C.navy}`, borderRight: '1px solid #e2e8f0', padding: '12px 8px', width: 90, fontSize: 11, color: C.navy, fontWeight: 'bold' }}>HORA</th>
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
                    <td style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '4px 8px', fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', textAlign: 'center' }}>{slot.inicio}</td>
                    <td colSpan={5} style={{ background: 'repeating-linear-gradient(45deg, #fefce8, #fefce8 6px, #fef9c3 6px, #fef9c3 12px)', borderBottom: '1px solid #e2e8f0', padding: '4px', textAlign: 'center', fontSize: 11, fontWeight: 'bold', color: '#92400e', letterSpacing: 2 }}>
                      — RECESO ACADÉMICO ({slot.inicio} - {slot.fin}) —
                    </td>
                  </tr>
                );
              }

              const p = slot.idx;
              return (
                <tr key={si} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '8px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ fontSize: 12, fontWeight: 'bold', color: C.navy }}>P{p+1}</div>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748b' }}>{slot.inicio}</div>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748b' }}>{slot.fin}</div>
                  </td>
                  
                  {[0, 1, 2, 3, 4].map(dia => {
                    const celda = celdasRender[dia]?.[p] || { tipo: 'vacio', clases: [] };
                    const isTarget = swapTarget?.dia === dia && swapTarget?.periodo === p;

                    if (celda.tipo === 'clase') {
                      return (
                        <td 
                          key={dia}
                          onDragOver={e => { e.preventDefault(); editMode && setSwapTarget({ dia, periodo: p }); }}
                          onDrop={() => handleSwap(dia, p, vistaTipo === 'semestre' ? semestreActivo : null)}
                          style={{ borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '6px', verticalAlign: 'top', background: isTarget ? '#fef9c3' : 'white', outline: isTarget ? `2px dashed ${C.gold}` : 'none' }}
                        >
                          {celda.clases.map((clase, cIdx) => {
                            const docente = (docentes || []).find(d => d.id === clase.docenteId);
                            const aula = (aulas || []).find(a => a.id === clase.aulaId);
                            
                            const kDoc = `${dia}-${p}-${clase.docenteId}`;
                            const kAula = `${dia}-${p}-${clase.aulaId}`;
                            const confDocente = clase.docenteId && mapaConflictos.docenteOcupacion[kDoc] > 1;
                            const confAula = clase.aulaId && mapaConflictos.aulaOcupacion[kAula] > 1;
                            
                            const isDragging = dragging?.semestre === clase.semestreOriginal && dragging?.dia === dia && dragging?.periodo === p;

                            return (
                              <div
                                key={cIdx}
                                onClick={() => editMode && setModalCelda({ semestre: clase.semestreOriginal, dia, periodo: p })}
                                draggable={editMode}
                                onDragStart={() => editMode && setDragging({ semestre: clase.semestreOriginal, dia, periodo: p })}
                                onDragEnd={() => { setDragging(null); setSwapTarget(null); }}
                                style={{ 
                                  background: isDragging ? '#dbeafe' : getMateriaColor(clase.id), 
                                  padding: '6px 8px', 
                                  borderRadius: 5,
                                  cursor: editMode ? 'pointer' : 'default', 
                                  opacity: isDragging ? 0.4 : 1,
                                  border: (confDocente || confAula) ? '2px solid #dc2626' : '1px solid rgba(0,0,0,0.06)',
                                  position: 'relative',
                                  marginBottom: cIdx < celda.clases.length - 1 ? 6 : 0,
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}
                              >
                                {clase.critica && <span style={{ position: 'absolute', top: 3, right: 6, color: '#dc2626', fontSize: 10 }}>★</span>}
                                <div style={{ fontWeight: 'bold', fontSize: 11, color: C.navy, lineHeight: 1.2 }}>{clase.nombre}</div>
                                <div style={{ fontSize: 10, color: '#334155', marginTop: 3, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 3 }}>
                                  👤 {docente?.nombre || 'Docente No Asignado'} {vistaTipo !== 'semestre' && `[${clase.semestreOriginal}° Sem]`}
                                </div>
                                {aula && <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>📍 {aula.nombre}</div>}
                                
                                {confDocente && (
                                  <div style={{ background: '#fef2f2', color: '#b91c1c', fontSize: 8, padding: '2px 5px', borderRadius: 4, marginTop: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <AlertTriangle size={10} /> Solapamiento de Docente
                                  </div>
                                )}
                                {confAula && (
                                  <div style={{ background: '#fef2f2', color: '#b91c1c', fontSize: 8, padding: '2px 5px', borderRadius: 4, marginTop: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <AlertTriangle size={10} /> Doble Asignación de Aula
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </td>
                      );
                    } else if (celda.tipo === 'biblioteca') {
                      return (
                        <td key={dia} onDragOver={e => { e.preventDefault(); editMode && setSwapTarget({ dia, periodo: p }); }} onDrop={() => handleSwap(dia, p, semestreActivo)} style={{ background: isTarget ? '#fef9c3' : '#f0fdf4', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: 6, textAlign: 'center', outline: isTarget ? `2px dashed ${C.gold}` : 'none' }}>
                          <div style={{ fontSize: 10, color: '#16a34a', opacity: 0.7 }}>
                            <BookOpen size={13} style={{ margin: '0 auto 2px' }} />
                            <div style={{ fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 }}>HORA PUENTE BIBLIOTECA</div>
                          </div>
                        </td>
                      );
                    } else {
                      return (
                        <td key={dia} onDragOver={e => { e.preventDefault(); editMode && setSwapTarget({ dia, periodo: p }); }} onDrop={() => handleSwap(dia, p, vistaTipo === 'semestre' ? semestreActivo : null)} style={{ background: isTarget ? '#fef9c3' : '#f8fafc', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', outline: isTarget ? `2px dashed ${C.gold}` : 'none', minHeight: 50 }} />
                      );
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PIE DE NOTAS */}
      <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 11, color: C.gray, flexWrap: 'wrap' }}>
        <span><strong>★</strong> Asignatura Crítica Priorizada</span>
        <span><strong>📚 Puente:</strong> Intervalo de Autoestudio Mandatorio</span>
        <span><strong>📌 Regulación RAC-03:</strong> Bloque de inicio Lunes a las 07:45</span>
        <span style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠️ Celdas con borde carmesí delatan colisiones en la grilla horaria.</span>
      </div>

      {/* REQ-53: PANEL MODAL CON ARQUITECTURA CORREGIDA */}
      {modalCelda && celda_editing && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, width: 440, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: C.navy, fontSize: 16, fontWeight: 'bold' }}>Ajustar Asignación Manual</h3>
              <button onClick={() => setModalCelda(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray }}><X size={20} /></button>
            </div>
            
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px', marginBottom: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 13 }}>{celda_editing.nombre}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                Malla Curricular: Semestre {modalCelda.semestre}° · {DIAS[modalCelda.dia]} · Periodo {modalCelda.periodo + 1}
              </div>
            </div>

            <FormField label="DOCENTE TITULAR RESPONSABLE">
              <select 
                value={celda_editing.docenteId || ''} 
                onChange={e => { 
                  const n = structuredClone(horario);
                  if (!n[modalCelda.semestre]) n[modalCelda.semestre] = {};
                  if (!n[modalCelda.semestre][modalCelda.dia]) n[modalCelda.semestre][modalCelda.dia] = {};
                  if (!n[modalCelda.semestre][modalCelda.dia][modalCelda.periodo]) n[modalCelda.semestre][modalCelda.dia][modalCelda.periodo] = {};
                  
                  n[modalCelda.semestre][modalCelda.dia][modalCelda.periodo].docenteId = e.target.value || null; 
                  onCambio(n); 
                }} 
                style={inputStyle}
              >
                <option value="">-- Sin Carga Docente / Libre --</option>
                {(docentes || []).map(d => <option key={d.id} value={d.id}>{d.nombre} — [{d.tipo}]</option>)}
              </select>
            </FormField>

            <div style={{ marginTop: 12 }} />

            <FormField label="AULA O INFRAESTRUCTURA ASIGNADA">
              <select 
                value={celda_editing.aulaId || ''} 
                onChange={e => { 
                  const n = structuredClone(horario); 
                  if (!n[modalCelda.semestre]) n[modalCelda.semestre] = {};
                  if (!n[modalCelda.semestre][modalCelda.dia]) n[modalCelda.semestre][modalCelda.dia] = {};
                  if (!n[modalCelda.semestre][modalCelda.dia][modalCelda.periodo]) n[modalCelda.semestre][modalCelda.dia][modalCelda.periodo] = {};

                  n[modalCelda.semestre][modalCelda.dia][modalCelda.periodo].aulaId = e.target.value || null; 
                  onCambio(n); 
                }} 
                style={inputStyle}
              >
                <option value="">-- Sin Aula Asignada (Virtual) --</option>
                {(aulas || []).filter(a => a.disponible).map(a => (
                  <option key={a.id} value={a.id}>{a.nombre} ({a.tipo}) — Capacidad Max: {a.capacidad} est.</option>
                ))}
              </select>
            </FormField>

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button 
                onClick={() => { 
                  const n = structuredClone(horario); 
                  if (n[modalCelda.semestre]?.[modalCelda.dia]) {
                    n[modalCelda.semestre][modalCelda.dia][modalCelda.periodo] = null; 
                  }
                  onCambio(n); 
                  setModalCelda(null);
                }} 
                style={{ flex: 1, padding: '10px', border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                <Trash2 size={14} /> Liberar Espacio
              </button>
              <button 
                onClick={() => setModalCelda(null)} 
                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 6, background: C.navy, color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                <Save size={14} /> Aplicar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}