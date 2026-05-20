import React, { useState } from 'react';
import { FileText, Download, Printer, Users, Layers, Archive, Hash, Shield, BookOpen, Plus, BarChart2, Building2, FileDown } from 'lucide-react';
import { C, DIAS, RENDER_SLOTS } from '../../../shared/constants';
import { EmptyState } from '../../../shared/components/Forms';
import { inputStyle, btnPrimary, thStyle, tdStyle } from '../../../shared/styles/inlineStyles';
import { exportApprovedScheduleToPdf, exportApprovedScheduleToExcel, printApprovedSchedule, registerReportObservation } from '../backend/reportService';
import '../styles/reports.css';

export function Mod6ReportesView({ horario, docentes, materias, aulas, horasDoc, estadoHorario }) {
  const [subTab, setSubTab] = useState('resumen');
  const [filtroDoc, setFiltroDoc] = useState(docentes[0]?.id || '');
  const [filtroAula, setFiltroAula] = useState(aulas[0]?.id || '');
  const [filtroGrupo, setFiltroGrupo] = useState(3);
  const [obsTexto, setObsTexto] = useState('');
  const [observaciones, setObservaciones] = useState([]);

  const semestres = [3,4,5,6,7,8,9,10];

  const totalClases = horario ? semestres.reduce((acc, s) => {
    let c = 0; for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) if (horario[s]?.[d]?.[p]) c++; return acc + c;
  }, 0) : 0;

  const NotGenerated = () => <EmptyState icon={<FileText size={36} />} titulo="Sin horario generado" desc="Ve al MOD-3 para generar un horario primero." />;
  const reportPayload = { horario, docentes, aulas, estadoHorario };
  const handleReportAction = (type, title) => {
    try {
      const result = type === 'pdf'
        ? exportApprovedScheduleToPdf(reportPayload)
        : type === 'excel'
          ? exportApprovedScheduleToExcel(reportPayload)
          : printApprovedSchedule(reportPayload);
      alert(`${title}: ${result.fileName || 'listo para impresion'}`);
    } catch (error) {
      alert(error.message);
    }
  };
  const agregarObs = () => {
    setObservaciones(prev => registerReportObservation(prev, obsTexto));
    setObsTexto('');
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { id: 'resumen', label: 'Resumen General', icon: <BarChart2 size={13}/> },
          { id: 'docente', label: 'Por Docente (HU-48)', icon: <Users size={13}/> },
          { id: 'grupo', label: 'Por Grupo (HU-49)', icon: <Layers size={13}/> },
          { id: 'aula', label: 'Por Aula (HU-50)', icon: <Building2 size={13}/> },
          { id: 'exportar', label: 'Exportar (HU-64/65/66)', icon: <Download size={13}/> },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', background: subTab === t.id ? C.navy : '#e2e8f0', color: subTab === t.id ? C.gold : C.gray }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {subTab === 'resumen' && (
        !horario ? <NotGenerated /> :
        <div>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { v: totalClases, l: 'Total Clases', sub: 'asignadas', icon: <Hash size={18} />, c: C.navy },
              { v: docentes.filter(d => (horasDoc?.[d.id] || 0) > 0).length, l: 'Docentes Activos', sub: `de ${docentes.length} totales`, icon: <Users size={18} />, c: C.blue },
              { v: materias.length, l: 'Materias', sub: 'en el sistema', icon: <BookOpen size={18} />, c: C.green },
              { v: estadoHorario === 'aprobado' ? '✓ APROBADO' : 'Pendiente', l: 'Estado', sub: 'del horario', icon: <Shield size={18} />, c: estadoHorario === 'aprobado' ? '#166534' : '#92400e' },
            ].map(m => (
              <div key={m.l} style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: '16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ background: m.c, color: 'white', width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{m.icon}</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: m.c }}>{m.v}</div>
                  <div style={{ fontSize: 11, color: C.navy, fontWeight: 'bold' }}>{m.l}</div>
                  <div style={{ fontSize: 10, color: C.gray }}>{m.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Clases por semestre */}
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18, marginBottom: 14 }}>
            <h3 style={{ margin: '0 0 14px', color: C.navy, fontSize: 13, fontWeight: 'bold' }}>Clases por Semestre (HU-47)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {semestres.map(s => {
                let cnt = 0;
                for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) if (horario[s]?.[d]?.[p]) cnt++;
                const pct = Math.round((cnt / (8 * 5)) * 100);
                return (
                  <div key={s} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: C.navy }}>{s}°</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold', color: C.gold }}>{cnt}</div>
                    <div style={{ fontSize: 10, color: C.gray }}>periodos</div>
                    <div style={{ background: '#e2e8f0', borderRadius: 99, height: 4, marginTop: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: C.navy, borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribución de aulas */}
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18 }}>
            <h3 style={{ margin: '0 0 12px', color: C.navy, fontSize: 13, fontWeight: 'bold' }}>Distribución de Aulas (HU-50)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {['Aula', 'Laboratorio', 'Auditorio', 'Sala'].map(tipo => {
                const cnt = aulas.filter(a => a.tipo === tipo).length;
                const disp = aulas.filter(a => a.tipo === tipo && a.disponible).length;
                return (
                  <div key={tipo} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 18 }}>{disp}/{cnt}</div>
                    <div style={{ fontSize: 11, color: C.gray }}>{tipo}s disponibles</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {subTab === 'docente' && (
        !horario ? <NotGenerated /> :
        <div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: C.gray, marginBottom: 5, display: 'block' }}>Seleccionar Docente:</label>
            <select value={filtroDoc} onChange={e => setFiltroDoc(e.target.value)} style={{ ...inputStyle, maxWidth: 320 }}>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
          {filtroDoc && (() => {
            const doc = docentes.find(d => d.id === filtroDoc);
            const horas = horasDoc?.[filtroDoc] || 0;
            const materiasDoc = [];
            semestres.forEach(s => {
              for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) {
                const c = horario[s][d][p];
                if (c?.docenteId === filtroDoc && !materiasDoc.find(m => m.id === c.id && m.dia === d && m.periodo === p))
                  materiasDoc.push({ ...c, semestre: s, dia: d, periodo: p });
              }
            });
            return (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                  {[{ v: horas, l: `Horas asignadas (máx ${doc.maxHoras})`, c: horas > doc.maxHoras ? '#dc2626' : '#166534' }, { v: doc.tipo, l: 'Tipo de Docente', c: C.navy }, { v: doc.especialidad, l: 'Especialidad', c: C.blue }].map(m => (
                    <div key={m.l} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 'bold', color: m.c }}>{m.v}</div>
                      <div style={{ fontSize: 11, color: C.gray }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: C.grayLight }}>{['Materia', 'Semestre', 'Día', 'Periodo', 'Aula'].map(h => <th key={h} style={thStyle}>{h.toUpperCase()}</th>)}</tr></thead>
                    <tbody>
                      {materiasDoc.map((m, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                          <td style={tdStyle}><span style={{ fontWeight: 'bold', color: C.navy, fontSize: 13 }}>{m.nombre}</span></td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}><span style={{ background: C.navy, color: C.gold, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{m.semestre}°</span></td>
                          <td style={tdStyle}>{DIAS[m.dia]}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>P{m.periodo + 1}</td>
                          <td style={tdStyle}>{aulas.find(a => a.id === m.aulaId)?.nombre || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {subTab === 'grupo' && (
        !horario ? <NotGenerated /> :
        <div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: C.gray, marginBottom: 5, display: 'block' }}>Seleccionar Semestre:</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {semestres.map(s => (
                <button key={s} onClick={() => setFiltroGrupo(s)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', background: filtroGrupo === s ? C.navy : '#e2e8f0', color: filtroGrupo === s ? C.gold : C.gray }}>{s}°</button>
              ))}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.grayLight }}><th style={thStyle}>HORA</th>{DIAS.map(d => <th key={d} style={thStyle}>{d.toUpperCase()}</th>)}</tr>
              </thead>
              <tbody>
                {RENDER_SLOTS.map((slot, si) => {
                  if (slot.type === 'break') return (
                    <tr key={si}>
                      <td style={{ ...tdStyle, textAlign: 'center', fontSize: 10, color: '#94a3b8', background: '#f8fafc' }}>{slot.inicio}</td>
                      <td colSpan={5} style={{ background: '#fefce8', textAlign: 'center', fontSize: 10, color: '#92400e', padding: 3, fontWeight: 'bold' }}>RECESO</td>
                    </tr>
                  );
                  const p = slot.idx;
                  return (
                    <tr key={si} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ ...tdStyle, background: '#f8fafc', fontSize: 11, textAlign: 'center' }}>P{p+1}<br /><span style={{ fontSize: 9, color: '#94a3b8' }}>{slot.inicio}</span></td>
                      {[0,1,2,3,4].map(dia => {
                        const celda = horario[filtroGrupo][dia][p];
                        if (!celda) return <td key={dia} style={{ ...tdStyle, background: '#f8fafc' }} />;
                        const doc = docentes.find(d => d.id === celda.docenteId);
                        const aula = aulas.find(a => a.id === celda.aulaId);
                        return (
                          <td key={dia} style={{ ...tdStyle, background: '#eff6ff', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 'bold', fontSize: 11, color: C.navy }}>{celda.nombre}</div>
                            <div style={{ fontSize: 10, color: C.gray }}>{doc?.nombre}</div>
                            {aula && <div style={{ fontSize: 9, color: C.blue }}>📍 {aula.nombre}</div>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'aula' && (
        !horario ? <NotGenerated /> :
        <div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: C.gray, marginBottom: 5, display: 'block' }}>Seleccionar Aula:</label>
            <select value={filtroAula} onChange={e => setFiltroAula(e.target.value)} style={{ ...inputStyle, maxWidth: 320 }}>
              {aulas.filter(a => a.disponible).map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.tipo})</option>)}
            </select>
          </div>
          {filtroAula && (() => {
            const aula = aulas.find(a => a.id === filtroAula);
            const usos = [];
            semestres.forEach(s => {
              for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) {
                const c = horario[s][d][p];
                if (c?.aulaId === filtroAula) usos.push({ ...c, semestre: s, dia: d, periodo: p });
              }
            });
            const tasaOcupacion = Math.round((usos.length / (8 * 5 * 8)) * 100);
            return (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                  {[{ v: usos.length, l: 'Periodos Usados' }, { v: `${tasaOcupacion}%`, l: 'Tasa de Ocupación' }, { v: aula.capacidad, l: 'Capacidad' }].map(m => (
                    <div key={m.l} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 'bold', color: C.navy }}>{m.v}</div>
                      <div style={{ fontSize: 11, color: C.gray }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: C.grayLight }}>{['Materia', 'Semestre', 'Día', 'Periodo', 'Docente'].map(h => <th key={h} style={thStyle}>{h.toUpperCase()}</th>)}</tr></thead>
                    <tbody>
                      {usos.map((u, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                          <td style={tdStyle}><span style={{ fontWeight: 'bold', color: C.navy, fontSize: 13 }}>{u.nombre}</span></td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}><span style={{ background: C.navy, color: C.gold, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{u.semestre}°</span></td>
                          <td style={tdStyle}>{DIAS[u.dia]}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>P{u.periodo + 1}</td>
                          <td style={tdStyle}>{docentes.find(d => d.id === u.docenteId)?.nombre || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {subTab === 'exportar' && (
        <div>
          <p style={{ color: C.gray, fontSize: 13, marginBottom: 16 }}>Genera y descarga los horarios en distintos formatos para distribución institucional.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[
              { icon: <FileDown size={28} />, titulo: 'Exportar PDF (HU-64)', desc: 'Genera horario completo en PDF para impresión y distribución oficial', color: '#dc2626', label: 'Descargar PDF', type: 'pdf' },
              { icon: <FileText size={28} />, titulo: 'Exportar Excel (HU-65)', desc: 'Exporta en formato .xlsx para edición en Microsoft Excel', color: '#166534', label: 'Descargar Excel', type: 'excel' },
              { icon: <Printer size={28} />, titulo: 'Imprimir (HU-66)', desc: 'Envía directamente a impresora el cronograma académico del semestre seleccionado', color: C.navy, label: 'Imprimir Ahora', type: 'print' },
              { icon: <Users size={28} />, titulo: 'Horario por Docente (HU-68)', desc: 'Genera PDF individual con el horario de cada docente para distribución personal', color: C.blue, label: 'Generar PDFs', type: 'pdf' },
              { icon: <Layers size={28} />, titulo: 'Horario por Grupo', desc: 'Descarga el horario semestral completo para cada grupo académico', color: C.purple, label: 'Descargar', type: 'pdf' },
              { icon: <Archive size={28} />, titulo: 'Resumen Ejecutivo', desc: 'Informe gerencial con métricas de carga docente, ocupación de aulas y estadísticas', color: '#92400e', label: 'Generar Informe', type: 'pdf' },
            ].map(r => (
              <div key={r.titulo} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ color: r.color }}>{r.icon}</div>
                <div>
                  <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 13, marginBottom: 4 }}>{r.titulo}</div>
                  <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.5 }}>{r.desc}</div>
                </div>
                <button onClick={() => handleReportAction(r.type, r.titulo)}
                  style={{ marginTop: 'auto', padding: '8px', background: r.color, color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: !horario ? 0.4 : 1 }}
                  disabled={!horario}>
                  <Download size={13} /> {r.label}
                </button>
              </div>
            ))}
          </div>
          {!horario && <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#94a3b8' }}>⚠ Genera un horario primero en el MOD-3 para habilitar la exportación.</div>}
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18, marginTop: 16 }}>
            <h3 style={{ margin: '0 0 12px', color: C.navy, fontSize: 13, fontWeight: 'bold' }}>Registrar Observaciones (HU-69)</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input value={obsTexto} onChange={e => setObsTexto(e.target.value)} onKeyDown={e => e.key === 'Enter' && agregarObs()} placeholder="Observación para el reporte aprobado..." style={{ ...inputStyle, flex: 1 }} />
              <button onClick={agregarObs} style={{ ...btnPrimary, whiteSpace: 'nowrap' }}><Plus size={14} /> Agregar</button>
            </div>
            {observaciones.map(obs => (
              <div key={obs.id} style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: 6, padding: '7px 12px', marginBottom: 6, fontSize: 12 }}>
                <div style={{ color: C.navy }}>{obs.texto}</div>
                <div style={{ color: '#94a3b8', fontSize: 10, marginTop: 2 }}>{obs.fecha}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

