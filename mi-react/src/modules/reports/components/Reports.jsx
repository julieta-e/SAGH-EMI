import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Users, Layers, Hash, Shield, BookOpen, Plus, BarChart2, ClipboardList, CheckCircle, AlertCircle, Eye, X, Table } from 'lucide-react';
import { C, DIAS, RENDER_SLOTS } from '../../../shared/constants';
import { EmptyState } from '../../../shared/components/Forms';
import { inputStyle, btnPrimary, thStyle, tdStyle } from '../../../shared/styles/inlineStyles';
import '../styles/reports.css';
import {
  exportarHorarioGeneralPDF,
  exportarHorarioDocentePDF,
  exportarAulasPDF,
  exportarCargaPDF,
  exportarHorarioGeneralExcel,
  exportarCargaExcel,
  exportarAulasExcel,
  buildScheduleRows,
} from '../backend/reportService';

const API = 'http://localhost:3001/api';

// ── Modal de Vista Previa ─────────────────────────────────────────────────────
function VistaPreviewModal({ tipo, horario, docentes, aulas, horasDoc, periodo, onClose }) {
  const semestres = [3,4,5,6,7,8,9,10];

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=700');
    const content = document.getElementById('preview-content-inner');
    if (!content || !printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html><html><head><meta charset="utf-8"/>
      <title>${tipo} - ${periodo}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #111; }
        .print-header { background: #0d1b2a; color: #d4af37; padding: 14px 20px; margin-bottom: 16px; }
        .print-header h1 { font-size: 15px; font-weight: bold; }
        .print-header p { font-size: 11px; color: #fff; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #0d1b2a; color: #d4af37; padding: 6px 8px; font-size: 10px; text-align: left; }
        td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
        tr:nth-child(even) td { background: #f5f7fa; }
        .footer { margin-top: 20px; font-size: 9px; color: #888; text-align: right; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>
      <div class="print-header">
        <h1>Escuela Militar de Ingeniería — Ingeniería de Sistemas</h1>
        <p>${tipo} &nbsp;|&nbsp; Periodo: ${periodo}</p>
      </div>
      ${content.innerHTML}
      <div class="footer">Generado: ${new Date().toLocaleString('es-BO')}</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
  };

  const renderContent = () => {
    if (tipo === 'Horario General') {
      const rows = buildScheduleRows({ horario, docentes, aulas });
      return (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: '#0d1b2a' }}>
              {['Semestre','Día','Periodo','Materia','Docente','Aula','Tipo Aula'].map(h => (
                <th key={h} style={{ padding: '6px 10px', color: '#d4af37', fontSize: 10, textAlign: 'left', fontWeight: 'bold' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f5f7fa', borderBottom: '1px solid #e2e8f0' }}>
                <td style={tdStyle}><span style={{ background: '#0d1b2a', color: '#d4af37', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 'bold' }}>{r.Semestre}</span></td>
                <td style={tdStyle}>{r.Día}</td>
                <td style={tdStyle}>{r.Periodo}</td>
                <td style={{ ...tdStyle, fontWeight: 'bold', color: '#0d1b2a' }}>{r.Materia}</td>
                <td style={tdStyle}>{r.Docente}</td>
                <td style={tdStyle}>{r.Aula}</td>
                <td style={tdStyle}>{r['Tipo Aula']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (tipo === 'Ocupación de Aulas') {
      const aulasData = aulas.filter(a => a.disponible).map(aula => {
        let usos = 0;
        semestres.forEach(s => {
          for (let d = 0; d < 5; d++)
            for (let p = 0; p < 8; p++)
              if (horario?.[s]?.[d]?.[p]?.aulaId === aula.id) usos++;
        });
        return { ...aula, usos, tasa: Math.round((usos / 40) * 100) };
      });
      return (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: '#0d1b2a' }}>
              {['Aula','Tipo','Edificio','Capacidad','Periodos Usados','Ocupación %'].map(h => (
                <th key={h} style={{ padding: '6px 10px', color: '#d4af37', fontSize: 10, textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {aulasData.map((a, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f5f7fa', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ ...tdStyle, fontWeight: 'bold', color: '#0d1b2a' }}>{a.nombre}</td>
                <td style={tdStyle}>{a.tipo}</td>
                <td style={tdStyle}>Edif. {a.edificio}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>{a.capacidad}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>{a.usos}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={{ color: a.tasa > 70 ? '#166534' : a.tasa > 40 ? '#92400e' : '#b91c1c', fontWeight: 'bold' }}>{a.tasa}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (tipo === 'Carga Horaria') {
      return (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: '#0d1b2a' }}>
              {['Docente','Tipo','Especialidad','Mín','Máx','Asignadas','Estado'].map(h => (
                <th key={h} style={{ padding: '6px 10px', color: '#d4af37', fontSize: 10, textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docentes.map((d, i) => {
              const h = horasDoc?.[d.id] || 0;
              const minH = d.min_horas || d.minHoras || 0;
              const maxH = d.max_horas || d.maxHoras || 0;
              const estado = h < minH ? 'BAJO' : h > maxH ? 'EXCEDE' : 'OK';
              const eColor = estado === 'OK' ? '#166534' : estado === 'BAJO' ? '#92400e' : '#b91c1c';
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f5f7fa', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ ...tdStyle, fontWeight: 'bold', color: '#0d1b2a' }}>{d.nombre}</td>
                  <td style={tdStyle}>{d.tipo}</td>
                  <td style={tdStyle}>{d.especialidad}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{minH}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{maxH}</td>
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>{h}</td>
                  <td style={{ ...tdStyle, color: eColor, fontWeight: 'bold', textAlign: 'center' }}>{estado}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 14, width: '100%', maxWidth: 900, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.35)' }}>
        <div style={{ background: '#0d1b2a', borderRadius: '14px 14px 0 0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#d4af37', fontWeight: 'bold', fontSize: 15 }}>Vista Previa — {tipo}</div>
            <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>Periodo: {periodo} · Escuela Militar de Ingeniería</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: 'none', background: '#d4af37', color: '#0d1b2a', cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>
              <Printer size={13} /> Imprimir
            </button>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'white' }}>
              <X size={16} />
            </button>
          </div>
        </div>
        <div style={{ padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Table size={13} style={{ color: '#64748b' }} />
          <span style={{ fontSize: 11, color: '#64748b' }}>Vista previa de lo que se exportará en PDF y Excel</span>
        </div>
        <div id="preview-content-inner" style={{ overflowY: 'auto', flex: 1, padding: 20 }}>
          {renderContent()}
        </div>
        <div style={{ padding: '10px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '7px 18px', borderRadius: 7, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', fontSize: 12 }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function Mod6ReportesView({ horario, materias, docentes, aulas, grupos, horasDoc, estadoHorario, addNotif, usuario }) {
  const rol = usuario?.rol || '';
  const esDDE = rol === 'DDE';
  const esDocente = rol === 'Docente';
  const esJefeCarrera = rol === 'Jefe de Carrera';

  const [subTab, setSubTab] = useState('resumen');
  const [filtroDoc, setFiltroDoc] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState(3);
  const [periodoExport, setPeriodoExport] = useState('2026-I');
  const [preview, setPreview] = useState(null);
  const [obsTexto, setObsTexto] = useState('');
  const [observaciones, setObservaciones] = useState([]);
  const [obsGrupo, setObsGrupo] = useState([]);
  const [obsExito, setObsExito] = useState(false);

  const semestres = [3,4,5,6,7,8,9,10];

  // Semestres donde el docente tiene clases
  const semestresDocente = esDocente
    ? semestres.filter(s => {
        if (!horario?.[s]) return false;
        for (let d = 0; d < 5; d++)
          for (let p = 0; p < 8; p++)
            if (horario[s]?.[d]?.[p]?.docenteId === usuario?.id) return true;
        return false;
      })
    : semestres;

  const docenteFiltroActivo = esDocente ? usuario?.id : filtroDoc;

  useEffect(() => {
    if (docentes.length > 0 && !filtroDoc) {
      setFiltroDoc(docentes[0]?.id || '');
    }
  }, [docentes]);

  useEffect(() => {
    if (semestresDocente.length > 0) {
      setFiltroGrupo(semestresDocente[0]);
    }
  }, [horario]);

  // Cargar todas las observaciones para DDE (tab observaciones)
  useEffect(() => {
    if (!esDDE) return;
    fetch(`${API}/observaciones`)
      .then(r => r.json())
      .then(data => setObservaciones(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [esDDE, subTab]);

  // Cargar observaciones del semestre para DDE (tab grupo)
  useEffect(() => {
    if (!esDDE) return;
    fetch(`${API}/observaciones/${filtroGrupo}`)
      .then(r => r.json())
      .then(data => setObsGrupo(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [filtroGrupo, esDDE]);

  const guardarObservacion = async () => {
    if (!obsTexto.trim()) return;
    try {
      const res = await fetch(`${API}/observaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semestre: filtroGrupo,
          texto: obsTexto,
          usuario_nombre: usuario?.nombre,
          usuario_rol: usuario?.rol,
        })
      });
      if (!res.ok) throw new Error('Error al guardar');
      setObsTexto('');
      setObsExito(true);
      setTimeout(() => setObsExito(false), 4000);
      addNotif('✅ Observación registrada correctamente', 'success');
    } catch (err) {
      console.error(err);
      addNotif('❌ Error al registrar observación', 'error');
    }
  };

  const totalClases = horario ? semestres.reduce((acc, s) => {
    let c = 0;
    for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) if (horario[s]?.[d]?.[p]) c++;
    return acc + c;
  }, 0) : 0;

  const NotGenerated = () => <EmptyState icon={<FileText size={36} />} titulo="Sin horario generado" desc="Ve al MOD-3 para generar un horario primero." />;

  const reportes = [
    {
      titulo: 'Horario General',
      desc: 'Todos los semestres (3° al 10°)',
      onPDF: () => { exportarHorarioGeneralPDF({ horario, docentes, aulas, periodo: periodoExport, estadoHorario }); addNotif('PDF exportado: Horario General', 'success'); },
      onExcel: () => { exportarHorarioGeneralExcel({ horario, docentes, aulas, periodo: periodoExport }); addNotif('Excel exportado: Horario General', 'success'); },
    },
    {
      titulo: 'Ocupación de Aulas',
      desc: 'Uso y disponibilidad de aulas',
      onPDF: () => { exportarAulasPDF({ horario, aulas, periodo: periodoExport, estadoHorario }); addNotif('PDF exportado: Aulas', 'success'); },
      onExcel: () => { exportarAulasExcel({ horario, aulas, periodo: periodoExport }); addNotif('Excel exportado: Aulas', 'success'); },
    },
    {
      titulo: 'Carga Horaria',
      desc: 'Distribución de horas por docente',
      onPDF: () => { exportarCargaPDF({ docentes, horasDoc, periodo: periodoExport, estadoHorario }); addNotif('PDF exportado: Carga Horaria', 'success'); },
      onExcel: () => { exportarCargaExcel({ docentes, horasDoc, periodo: periodoExport }); addNotif('Excel exportado: Carga Horaria', 'success'); },
    },
  ];

  const tabs = [
    { id: 'resumen',   label: 'Resumen General', icon: <BarChart2 size={13} /> },
    { id: 'docente',   label: 'Por Docente',     icon: <Users size={13} /> },
    { id: 'grupo',     label: 'Por Grupo',       icon: <Layers size={13} /> },
    ...(esDDE || esJefeCarrera ? [{ id: 'exportar', label: 'Exportar', icon: <Download size={13} /> }] : []),
    ...(esDDE ? [{ id: 'observaciones', label: 'Observaciones', icon: <ClipboardList size={13} /> }] : []),
  ];

  return (
    <div>
      {preview && (
        <VistaPreviewModal
          tipo={preview}
          horario={horario}
          docentes={docentes}
          aulas={aulas}
          horasDoc={horasDoc}
          periodo={periodoExport}
          onClose={() => setPreview(null)}
        />
      )}

      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 'bold', color: C.navy }}>Módulo 6: Reportes</h1>
        <p style={{ margin: 0, fontSize: 13, color: C.gray }}>Exportar PDF · Excel · Imprimir · Reportes por Periodo, Docente y Grupo</p>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 'bold', background: subTab === t.id ? C.navy : '#e2e8f0', color: subTab === t.id ? C.gold : C.gray }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── RESUMEN ── */}
      {subTab === 'resumen' && (
        !horario ? <NotGenerated /> :
        <div>
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
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18 }}>
            <h3 style={{ margin: '0 0 14px', color: C.navy, fontSize: 13, fontWeight: 'bold' }}>Clases por Semestre</h3>
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
        </div>
      )}

      {/* ── POR DOCENTE ── */}
      {subTab === 'docente' && (
        !horario ? <NotGenerated /> :
        <div>
          {(esDDE || esJefeCarrera) && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: C.gray, marginBottom: 5, display: 'block' }}>Seleccionar Docente:</label>
              <select value={filtroDoc} onChange={e => setFiltroDoc(e.target.value)} style={{ ...inputStyle, maxWidth: 320 }}>
                {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
          )}

          {docenteFiltroActivo && (() => {
            const doc = docentes.find(d => d.id === docenteFiltroActivo);
            const horas = horasDoc?.[docenteFiltroActivo] || 0;
            const materiasDoc = [];
            semestres.forEach(s => {
              for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) {
                const c = horario?.[s]?.[d]?.[p];
                if (c?.docenteId === docenteFiltroActivo && !materiasDoc.find(m => m.dia === d && m.periodo === p && m.semestre === s))
                  materiasDoc.push({ ...c, semestre: s, dia: d, periodo: p });
              }
            });
            return (
              <div>
                {doc && (
                  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.navy, color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 'bold', flexShrink: 0 }}>
                      {doc.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 15 }}>{doc.nombre}</div>
                      <div style={{ fontSize: 12, color: C.gray }}>{doc.especialidad} · {doc.tipo} · {horas} periodos asignados</div>
                    </div>
                  </div>
                )}
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 14 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: C.navy }}>
                        {['Materia', 'Sem.', 'Día', 'Hora', 'Aula'].map(h => (
                          <th key={h} style={{ ...thStyle, color: C.gold }}>{h.toUpperCase()}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {materiasDoc.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 12 }}>Sin clases asignadas</td></tr>
                      )}
                      {materiasDoc.map((m, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                          <td style={tdStyle}><span style={{ fontWeight: 'bold', color: C.navy }}>{m.nombre}</span></td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}><span style={{ background: C.navy, color: C.gold, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{m.semestre}°</span></td>
                          <td style={tdStyle}>{DIAS[m.dia]}</td>
                          <td style={tdStyle}>{['07:45','08:30','09:15','10:15','11:00','12:00','12:45','13:30'][m.periodo] || `P${m.periodo+1}`}</td>
                          <td style={tdStyle}>{aulas.find(a => a.id === m.aulaId)?.nombre || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {esDDE && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => { exportarHorarioDocentePDF({ horario, docentes, aulas, docenteId: docenteFiltroActivo, periodo: periodoExport, estadoHorario }); addNotif('PDF exportado', 'success'); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}
                    >
                      <FileText size={13} /> Exportar PDF
                    </button>
                    <button
                      onClick={() => { exportarHorarioGeneralExcel({ horario, docentes, aulas, periodo: periodoExport }); addNotif('Excel exportado', 'success'); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#166534', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}
                    >
                      <Download size={13} /> Exportar Excel
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── POR GRUPO ── */}
      {subTab === 'grupo' && (
        !horario ? <NotGenerated /> :
        <div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {semestresDocente.map(s => (
                <button key={s} onClick={() => { setFiltroGrupo(s); setObsExito(false); }} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', background: filtroGrupo === s ? C.navy : '#e2e8f0', color: filtroGrupo === s ? C.gold : C.gray }}>{s}°</button>
              ))}
            </div>
          </div>

          {/* Tabla del horario */}
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '8px 14px', background: C.navy, color: C.gold, fontSize: 11, fontWeight: 'bold' }}>
              Horario {filtroGrupo}° Semestre · {periodoExport}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.navy }}>
                  <th style={{ ...thStyle, color: C.gold }}>HORA</th>
                  {DIAS.map(d => <th key={d} style={{ ...thStyle, color: C.gold }}>{d.toUpperCase()}</th>)}
                </tr>
              </thead>
              <tbody>
                {RENDER_SLOTS.map((slot, si) => {
                  if (slot.type === 'break') return (
                    <tr key={si}>
                      <td style={{ ...tdStyle, textAlign: 'center', fontSize: 10, background: '#f8fafc' }}>{slot.inicio}</td>
                      <td colSpan={5} style={{ background: '#fefce8', textAlign: 'center', fontSize: 10, color: '#92400e', padding: 3, fontWeight: 'bold' }}>RECESO</td>
                    </tr>
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
                        const docCelda = docentes.find(d => d.id === celda.docenteId);
                        const aula = aulas.find(a => a.id === celda.aulaId);
                        return (
                          <td key={dia} style={{ ...tdStyle, background: '#eff6ff', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 'bold', fontSize: 11, color: C.navy }}>{celda.nombre}</div>
                            <div style={{ fontSize: 10, color: C.gray }}>{docCelda?.nombre}</div>
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

          {/* Botones descarga para Docente y Jefe de Carrera también */}
          {(esDDE || esDocente || esJefeCarrera) && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button
                onClick={() => { exportarHorarioGeneralPDF({ horario, docentes, aulas, periodo: periodoExport, estadoHorario }); addNotif('PDF exportado', 'success'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}
              >
                <FileText size={13} /> Descargar PDF
              </button>
              <button
                onClick={() => { exportarHorarioGeneralExcel({ horario, docentes, aulas, periodo: periodoExport }); addNotif('Excel exportado', 'success'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#166534', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}
              >
                <Download size={13} /> Descargar Excel
              </button>
            </div>
          )}

          {/* Observaciones — solo para Docente y Jefe de Carrera, NO para DDE */}
          {(esDocente || esJefeCarrera) && (
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18 }}>
              <h3 style={{ margin: '0 0 12px', color: C.navy, fontSize: 13, fontWeight: 'bold' }}>
                Registrar Observación — {filtroGrupo}° Semestre
              </h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  value={obsTexto}
                  onChange={e => setObsTexto(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && guardarObservacion()}
                  placeholder="Escribe una observación sobre este semestre..."
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={guardarObservacion} style={btnPrimary}>
                  <Plus size={14} /> Registrar
                </button>
              </div>

              {/* Mensaje de éxito */}
              {obsExito && (
                <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={16} color="#166534" />
                  <span style={{ fontSize: 13, color: '#166534', fontWeight: 'bold' }}>
                    ✅ Tu observación fue registrada exitosamente y es visible para el DDE.
                  </span>
                </div>
              )}
            </div>
          )}

        
        </div>
      )}

      {/* ── EXPORTAR (solo DDE y Jefe de Carrera) ── */}
      {subTab === 'exportar' && (esDDE || esJefeCarrera) && (
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
            {reportes.map(rep => (
              <div key={rep.titulo} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
                <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 14, marginBottom: 6 }}>{rep.titulo}</div>
                <div style={{ fontSize: 12, color: C.gray, marginBottom: 14 }}>{rep.desc}</div>
                <div style={{ fontSize: 11, color: '#166534', background: '#f0fdf4', padding: '5px 10px', borderRadius: 6, marginBottom: 12 }}>
                  Periodo: <strong>{periodoExport}</strong>
                </div>
                <button
                  disabled={!horario}
                  onClick={() => setPreview(rep.titulo)}
                  style={{ width: '100%', marginBottom: 10, padding: '9px 6px', borderRadius: 8, border: `1.5px solid ${!horario ? '#e2e8f0' : C.gold}`, background: !horario ? '#f1f5f9' : '#fffbeb', color: !horario ? '#94a3b8' : C.navy, cursor: !horario ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Eye size={13} /> Vista Previa
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button disabled={!horario} onClick={rep.onPDF} style={{ flex: 1, padding: '10px 6px', borderRadius: 8, border: 'none', background: !horario ? '#f1f5f9' : '#dc2626', color: !horario ? '#94a3b8' : 'white', cursor: !horario ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <FileText size={13} /> PDF
                  </button>
                  <button disabled={!horario} onClick={rep.onExcel} style={{ flex: 1, padding: '10px 6px', borderRadius: 8, border: 'none', background: !horario ? '#f1f5f9' : '#166534', color: !horario ? '#94a3b8' : 'white', cursor: !horario ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <Download size={13} /> Excel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── OBSERVACIONES GENERALES (solo DDE) ── */}
      {subTab === 'observaciones' && esDDE && (
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18 }}>
          <h3 style={{ margin: '0 0 12px', color: C.navy, fontSize: 13, fontWeight: 'bold' }}>
            Todas las Observaciones Registradas ({observaciones.length})
          </h3>
          {observaciones.length === 0 ? (
            <div style={{ fontSize: 12, color: C.gray, textAlign: 'center', padding: 24 }}>
              Sin observaciones registradas aún
            </div>
          ) : (
            observaciones.map((obs, i) => (
              <div key={obs.id || i} style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ background: C.navy, color: C.gold, padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 'bold' }}>
                    {obs.semestre}° Semestre
                  </span>
                  <span style={{ fontSize: 10, color: C.gray }}>{new Date(obs.fecha).toLocaleString('es-BO')}</span>
                </div>
                <div style={{ fontSize: 13, color: C.navy, marginBottom: 4 }}>{obs.texto}</div>
                <div style={{ fontSize: 11, color: C.gray }}>
                  👤 {obs.usuario_nombre} · {obs.usuario_rol}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}