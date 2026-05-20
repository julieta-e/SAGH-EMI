import React, { useState } from 'react';
import { FileText, Download, Printer, Users, Layers, Building2, Hash, Shield, BookOpen, Plus, BarChart2, ClipboardList, Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { C, DIAS, RENDER_SLOTS } from '../../../shared/constants';
import { EmptyState } from '../../../shared/components/Forms';
import { inputStyle, btnPrimary, thStyle, tdStyle } from '../../../shared/styles/inlineStyles';
import '../styles/reports.css';

export function Mod6ReportesView({ horario, materias, docentes, aulas, grupos, horasDoc, estadoHorario, addNotif, usuario }) {
  const [subTab, setSubTab] = useState('resumen');
  const [filtroDoc, setFiltroDoc] = useState(docentes[0]?.id || '');
  const [filtroGrupo, setFiltroGrupo] = useState(3);
  const [periodoExport, setPeriodoExport] = useState('2026-I');
  const [obsReporte, setObsReporte] = useState('');
  const [observaciones, setObservaciones] = useState([]);

  const semestres = [3,4,5,6,7,8,9,10];

  const totalClases = horario ? semestres.reduce((acc, s) => {
    let c = 0;
    for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) if (horario[s]?.[d]?.[p]) c++;
    return acc + c;
  }, 0) : 0;

  const NotGenerated = () => <EmptyState icon={<FileText size={36} />} titulo="Sin horario generado" desc="Ve al MOD-3 para generar un horario primero." />;

  const exportarPDF = (nombre, contenido) => {
    const blob = new Blob([contenido], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombre}_${periodoExport}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    addNotif(`PDF exportado: ${nombre}`, 'success');
  };

  const exportarExcel = (nombre, contenido) => {
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombre}_${periodoExport}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    addNotif(`Excel exportado: ${nombre}`, 'success');
  };

  const imprimir = () => {
    window.print();
    addNotif('Impresión iniciada', 'info');
  };

  const notificarDDE = (msg) => {
    addNotif(`📧 Notificación enviada a DDE: ${msg}`, 'success', 'DDE');
  };

  const generarContenidoGeneral = () => {
    let txt = `HORARIO GENERAL — PERÍODO ${periodoExport}\n`;
    txt += `Escuela Militar de Ingeniería · Ing. de Sistemas\n`;
    txt += `Estado: ${estadoHorario?.toUpperCase() || 'PENDIENTE'}\n`;
    txt += '═'.repeat(60) + '\n\n';
    if (!horario) return txt + 'Sin horario generado.\n';
    semestres.forEach(sem => {
      const grid = horario[sem] || [];
      const clases = grid.flat().filter(c => c);
      txt += `${sem}° SEMESTRE — ${[...new Set(clases.map(c => c.nombre))].length} materias\n`;
      DIAS.forEach((dia, d) => {
        const cd = (grid[d] || []).filter(c => c);
        if (cd.length > 0) txt += `  ${dia}: ${[...new Set(cd.map(c => c.nombre))].join(', ')}\n`;
      });
      txt += '\n';
    });
    return txt;
  };

  const generarContenidoDocente = (docId) => {
    const doc = docentes.find(d => d.id === (docId || filtroDoc));
    if (!doc || !horario) return 'Sin datos';
    let txt = `HORARIO DOCENTE — ${doc.nombre.toUpperCase()}\n`;
    txt += `Período: ${periodoExport} · Especialidad: ${doc.especialidad} · Tipo: ${doc.tipo}\n`;
    txt += `Horas asignadas: ${horasDoc?.[doc.id] || 0}/${doc.maxHoras}\n`;
    txt += '═'.repeat(50) + '\n\n';
    semestres.forEach(s => {
      for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) {
        const c = horario[s]?.[d]?.[p];
        if (c?.docenteId === doc.id) {
          const aulaObj = aulas.find(a => a.id === c.aulaId);
          txt += `${DIAS[d]} P${p+1}: ${c.nombre} (${s}°) — ${aulaObj?.nombre || 'Sin aula'}\n`;
        }
      }
    });
    return txt;
  };

  const generarContenidoAulas = () => {
    let txt = `OCUPACIÓN DE AULAS — PERÍODO ${periodoExport}\n`;
    txt += `Escuela Militar de Ingeniería · Ing. de Sistemas\n`;
    txt += '═'.repeat(60) + '\n\n';
    if (!horario) return txt + 'Sin horario generado.\n';
    aulas.filter(a => a.disponible).forEach(aula => {
      const usos = [];
      semestres.forEach(s => {
        for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) {
          const c = horario[s]?.[d]?.[p];
          if (c?.aulaId === aula.id) usos.push({ ...c, semestre: s, dia: d, periodo: p });
        }
      });
      const tasa = Math.round((usos.length / 40) * 100);
      txt += `${aula.nombre} — ${aula.tipo} — Edificio ${aula.edificio} — Cap. ${aula.capacidad}\n`;
      txt += `Ocupación: ${usos.length}/40 periodos (${tasa}%)\n`;
      usos.forEach(u => { txt += `  ${DIAS[u.dia]} P${u.periodo+1}: ${u.nombre} (${u.semestre}°)\n`; });
      txt += '\n';
    });
    return txt;
  };

  const generarContenidoCarga = () => {
    let txt = `CARGA HORARIA — PERÍODO ${periodoExport}\n`;
    txt += '═'.repeat(60) + '\n\n';
    docentes.forEach(doc => {
      const horas = horasDoc?.[doc.id] || 0;
      const estado = horas < doc.minHoras ? 'BAJO' : horas > doc.maxHoras ? 'EXCEDE' : 'OK';
      txt += `${doc.nombre} (${doc.tipo})\n`;
      txt += `  Horas: ${horas}/${doc.maxHoras} | Mín: ${doc.minHoras} | Estado: ${estado}\n\n`;
    });
    return txt;
  };

  const generarCSV = () => {
    if (!horario) return '';
    let csv = 'Semestre,Día,Periodo,Hora,Materia,Docente,Aula,Tipo Aula\n';
    semestres.forEach(s => {
      RENDER_SLOTS.filter(sl => sl.type === 'class').forEach(slot => {
        const p = slot.idx;
        DIAS.forEach((dia, d) => {
          const c = horario[s]?.[d]?.[p];
          if (c) {
            const doc = docentes.find(x => x.id === c.docenteId);
            const aula = aulas.find(x => x.id === c.aulaId);
            csv += `${s}°,${dia},P${p+1},${slot.inicio}-${slot.fin},"${c.nombre}","${doc?.nombre || ''}","${aula?.nombre || ''}","${c.tipoAula}"\n`;
          }
        });
      });
    });
    return csv;
  };

  const agregarObs = () => {
    if (!obsReporte.trim()) return;
    setObservaciones(prev => [{ id: Date.now(), texto: obsReporte, fecha: new Date().toLocaleString(), usuario: usuario?.nombre }, ...prev]);
    addNotif('Observación registrada en reporte', 'info');
    setObsReporte('');
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 'bold', color: C.navy }}>Módulo 6: Reportes</h1>
        <p style={{ margin: 0, fontSize: 13, color: C.gray }}>Exportar PDF · Excel · Imprimir · Reportes por Periodo, Docente y Grupo</p>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { id: 'resumen', label: 'Resumen General', icon: <BarChart2 size={13} /> },
          { id: 'docente', label: 'Por Docente', icon: <Users size={13} /> },
          { id: 'grupo', label: 'Por Grupo', icon: <Layers size={13} /> },
          { id: 'exportar', label: 'Exportar', icon: <Download size={13} /> },
          { id: 'observaciones', label: 'Observaciones', icon: <ClipboardList size={13} /> },
          { id: 'notificaciones', label: 'Notificaciones', icon: <Bell size={13} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 'bold', background: subTab === t.id ? C.navy : '#e2e8f0', color: subTab === t.id ? C.gold : C.gray }}>
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
            <div style={{ display: 'flex', gap: 10 }}>
              <select value={filtroDoc} onChange={e => setFiltroDoc(e.target.value)} style={{ ...inputStyle, maxWidth: 320 }}>
                {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
              <button onClick={() => { exportarPDF('Horario_Docente_' + docentes.find(d => d.id === filtroDoc)?.nombre.replace(/ /g,'_'), generarContenidoDocente(filtroDoc)); }} disabled={!horario} style={{ ...btnPrimary, background: !horario ? '#e2e8f0' : '#dc2626', cursor: !horario ? 'not-allowed' : 'pointer' }}>
                <FileText size={13} /> Exportar PDF Docente
              </button>
            </div>
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
                  {[{ v: horas, l: `Horas (máx ${doc.maxHoras})`, c: horas > doc.maxHoras ? '#dc2626' : '#166534' }, { v: doc.tipo, l: 'Tipo', c: C.navy }, { v: doc.especialidad, l: 'Especialidad', c: C.blue }].map(m => (
                    <div key={m.l} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 'bold', color: m.c }}>{m.v}</div>
                      <div style={{ fontSize: 11, color: C.gray }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: C.grayLight }}>{['Materia', 'Sem.', 'Día', 'Periodo', 'Aula'].map(h => <th key={h} style={thStyle}>{h.toUpperCase()}</th>)}</tr></thead>
                    <tbody>
                      {materiasDoc.map((m, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                          <td style={tdStyle}><span style={{ fontWeight: 'bold', color: C.navy }}>{m.nombre}</span></td>
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
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {semestres.map(s => (
                <button key={s} onClick={() => setFiltroGrupo(s)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', background: filtroGrupo === s ? C.navy : '#e2e8f0', color: filtroGrupo === s ? C.gold : C.gray }}>{s}°</button>
              ))}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '8px 14px', background: C.navy, color: C.gold, fontSize: 11, fontWeight: 'bold' }}>
              Horario {filtroGrupo}° Semestre · {periodoExport}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.grayLight }}>
                  <th style={thStyle}>HORA</th>
                  {DIAS.map(d => <th key={d} style={thStyle}>{d.toUpperCase()}</th>)}
                </tr>
              </thead>
              <tbody>
                {RENDER_SLOTS.map((slot, si) => {
                  if (slot.type === 'break') return (
                    <tr key={si}><td style={{ ...tdStyle, textAlign: 'center', fontSize: 10, background: '#f8fafc' }}>{slot.inicio}</td><td colSpan={5} style={{ background: '#fefce8', textAlign: 'center', fontSize: 10, color: '#92400e', padding: 3, fontWeight: 'bold' }}>RECESO</td></tr>
                  );
                  const p = slot.idx;
                  return (
                    <tr key={si} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ ...tdStyle, background: '#f8fafc', fontSize: 11, textAlign: 'center' }}>
                        P{p + 1}<br /><span style={{ fontSize: 9, color: '#94a3b8' }}>{slot.inicio}</span>
                      </td>
                      {[0,1,2,3,4].map(dia => {
                        const celda = horario[filtroGrupo]?.[dia]?.[p];
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


      {subTab === 'exportar' && (
        <div>
          <div style={{ background: 'white', borderRadius: 12, border: `2px solid ${C.gold}`, padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 14, marginBottom: 12 }}>Seleccionar Periodo Académico</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {['2026-I', '2026-II', '2025-I', '2025-II', '2024-I', '2024-II'].map(p => (
                <button key={p} onClick={() => setPeriodoExport(p)} style={{ padding: '7px 16px', borderRadius: 8, border: `2px solid ${periodoExport === p ? C.gold : '#e2e8f0'}`, background: periodoExport === p ? C.navy : 'white', color: periodoExport === p ? C.gold : C.gray, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>
                  {p}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#166534', background: '#dcfce7', padding: '6px 12px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={12} /> Periodo activo: <strong style={{ marginLeft: 4 }}>{periodoExport}</strong>
            </div>
          </div>

          {!horario && (
            <div style={{ background: '#fef9c3', border: '1px solid #fef08a', borderRadius: 8, padding: '10px 16px', marginBottom: 14, fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={14} /> Genera un horario primero en el MOD-3 para habilitar la exportación.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[{ titulo: 'Horario General', desc: 'Todos los semestres (3° al 10°)', generarPDF: generarContenidoGeneral, generarExcel: generarCSV },
              { titulo: 'Horario por Docente', desc: 'Clases asignadas a cada docente', generarPDF: generarContenidoDocente, generarExcel: generarContenidoDocente },
              { titulo: 'Ocupación de Aulas', desc: 'Uso y disponibilidad de aulas', generarPDF: generarContenidoAulas, generarExcel: generarContenidoAulas },
              { titulo: 'Carga Horaria', desc: 'Distribución de horas por docente', generarPDF: generarContenidoCarga, generarExcel: generarContenidoCarga },
            ].map(rep => (
              <div key={rep.titulo} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
                <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 14, marginBottom: 6 }}>{rep.titulo}</div>
                <div style={{ fontSize: 12, color: C.gray, marginBottom: 14 }}>{rep.desc}</div>
                <div style={{ fontSize: 11, color: '#166534', background: '#f0fdf4', padding: '5px 10px', borderRadius: 6, marginBottom: 12 }}>
                  Periodo: <strong>{periodoExport}</strong>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button disabled={!horario} onClick={() => exportarPDF(rep.titulo.replace(/ /g,'_'), rep.generarPDF())} style={{ flex: 1, padding: '10px 6px', borderRadius: 8, border: 'none', background: !horario ? '#f1f5f9' : '#dc2626', color: !horario ? '#94a3b8' : 'white', cursor: !horario ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <FileText size={13} /> PDF
                  </button>
                  <button disabled={!horario} onClick={() => exportarExcel(rep.titulo.replace(/ /g,'_'), rep.generarExcel())} style={{ flex: 1, padding: '10px 6px', borderRadius: 8, border: 'none', background: !horario ? '#f1f5f9' : '#166534', color: !horario ? '#94a3b8' : 'white', cursor: !horario ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <Download size={13} /> Excel
                  </button>
                  <button onClick={imprimir} style={{ padding: '10px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: C.gray, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                    <Printer size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'observaciones' && (
        <div>
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18, marginBottom: 14 }}>
            <h3 style={{ margin: '0 0 12px', color: C.navy, fontSize: 13, fontWeight: 'bold' }}>Nueva Observación</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={obsReporte} onChange={e => setObsReporte(e.target.value)} onKeyDown={e => e.key === 'Enter' && agregarObs()} placeholder="Escribe una observación sobre el reporte o el horario..." style={{ ...inputStyle, flex: 1 }} />
              <button onClick={agregarObs} style={btnPrimary}><Plus size={14} /> Registrar</button>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18 }}>
            <h3 style={{ margin: '0 0 12px', color: C.navy, fontSize: 13 }}>Observaciones Registradas ({observaciones.length})</h3>
            {observaciones.length === 0 && <div style={{ fontSize: 12, color: C.gray, textAlign: 'center', padding: 16 }}>Sin observaciones aún</div>}
            {observaciones.map(obs => (
              <div key={obs.id} style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: C.navy, marginBottom: 4 }}>{obs.texto}</div>
                <div style={{ fontSize: 11, color: C.gray }}>👤 {obs.usuario} · {obs.fecha}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'notificaciones' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              {
                titulo: 'Notificar Horario Generado',
                desc: 'Informa a la DDE que un nuevo horario fue generado y está pendiente de aprobación.',
                msg: 'Nuevo horario generado para el período ' + periodoExport + '. Requiere validación.',
              },
              {
                titulo: 'Notificar Horario Aprobado',
                desc: 'Informa a la DDE y a los docentes que el horario fue aprobado formalmente.',
                msg: 'Horario ' + periodoExport + ' aprobado y en vigencia. Disponible para consulta.',
              },
              {
                titulo: 'Notificar Cambio de Docente',
                desc: 'Comunica a la DDE una modificación en la asignación de docentes.',
                msg: 'Se realizó un cambio de docente en el horario ' + periodoExport + '.',
              },
              {
                titulo: 'Notificar Conflicto Detectado',
                desc: 'Alerta a la DDE sobre conflictos de horario pendientes de resolución.',
                msg: 'Se detectaron conflictos en el horario ' + periodoExport + '. Requiere revisión.',
              },
            ].map(n => (
              <div key={n.titulo} style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 18 }}>
                <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 13, marginBottom: 6 }}>{n.titulo}</div>
                <div style={{ fontSize: 11, color: C.gray, marginBottom: 12, lineHeight: 1.5 }}>{n.desc}</div>
                <div style={{ background: '#f8fafc', borderRadius: 6, padding: '8px 10px', fontSize: 11, color: C.navy, marginBottom: 12, fontStyle: 'italic' }}>
                  "{n.msg}"
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => notificarDDE(n.msg)} style={{ ...btnPrimary, fontSize: 12, padding: '6px 14px' }}>
                    <Bell size={13} /> Enviar a DDE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

