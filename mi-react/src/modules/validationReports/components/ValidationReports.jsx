import React, { useState, useCallback } from 'react';
import {
  CheckCircle, AlertTriangle, Plus, Shield, Check, AlertCircle,
  Clock, Archive, User, Send, Bell, Search, FileText,
  BarChart2, Layers, XCircle, Activity, Info, RefreshCw,
  Users, ClipboardList
} from 'lucide-react';
import { C, DIAS } from '../../../shared/constants';
import { EmptyState } from '../../../shared/components/Forms';
import { inputStyle, btnPrimary } from '../../../shared/styles/inlineStyles';
import { validarHorario } from '../backend/validationService';
import '../styles/validationReports.css';

export function Mod5ValidacionView({
  horario,
  docentes = [],
  horasDoc = {},
  onVerHorario
}) {
  // Estados de simulación de roles y flujo
  const [rolActivo, setRolActivo] = useState('ADMIN_DDE');
  const [submoduloActivo, setSubmoduloActivo] = useState('auditoria');
  const [obsTexto, setObsTexto] = useState('');
  const [estadoGlobal, setEstadoGlobal] = useState('BORRADOR');
  const [auditLog, setAuditLog] = useState([]);
  const [observaciones, setObservaciones] = useState([
    { id: 1, autor: 'Jefatura de Carrera', texto: 'Verificar disponibilidad de laboratorios de redes para semestres superiores.', fecha: '20/05/2026, 09:30 AM', tipo: 'INTERNA' }
  ]);
  const [historial, setHistorial] = useState([
    { id: 1, fecha: '19/05/2026, 02:00 PM', accion: 'Creación de matriz base', usuario: 'Planificador DDE', estado: 'BORRADOR' }
  ]);
  const [alertasEmitidas, setAlertasEmitidas] = useState([
    { id: 1, titulo: 'Apertura de Gestión', mensaje: 'Estructura inicial de horarios puesta a disposición para revisión técnica.', destino: 'Interno', fecha: '19/05/2026, 02:05 PM' }
  ]);

  // Sub-pestañas dentro de Validación y Calidad
  const [subTabAuditoria, setSubTabAuditoria] = useState('resumen');
  const [semestreAnalisis, setSemestreAnalisis] = useState(3);

  if (!horario) {
    return (
      <EmptyState
        icon={<Shield size={40} color={C.navy} />}
        titulo="Sin horario generado"
        desc="Diríjase al panel de Planificación Académica para estructurar una matriz de horarios activa."
      />
    );
  }

  const conflictos = validarHorario(horario, docentes);
  const semestresLista = [3, 4, 5, 6, 7, 8, 9, 10];

  const totalClases = semestresLista.reduce((acc, s) => {
    let c = 0;
    for (let d = 0; d < 5; d++)
      for (let p = 0; p < 8; p++)
        if (horario[s]?.[d]?.[p]) c++;
    return acc + c;
  }, 0);

  const docentesSobrecargados = docentes.filter(d => (horasDoc?.[d.id] || 0) > d.maxHoras);
  const docentesBajoMinimo = docentes.filter(d => (horasDoc?.[d.id] || 0) < d.minHoras && (horasDoc?.[d.id] || 0) > 0);

  const criticos = conflictos.filter(c => c.sev === 'error');
  const advertencias = [
    ...conflictos.filter(c => c.sev === 'warning'),
    ...docentesSobrecargados.map(d => ({ tipo: 'carga', mensaje: `${d.nombre}: ${horasDoc?.[d.id]}h de ${d.maxHoras}h máximas (Sobrecarga).` }))
  ];
  const informativos = docentesBajoMinimo.map(d => ({ tipo: 'carga', mensaje: `${d.nombre}: ${horasDoc?.[d.id]}h por debajo del mínimo (${d.minHoras}h).` }));

  const sinConflictosCriticos = criticos.length === 0 && docentesSobrecargados.length === 0;

  // Registrar auditoría interna
  const registrarAuditoriaInterna = useCallback((accion, detalle = '') => {
    const nuevoLog = {
      id: Date.now() + Math.random(),
      accion,
      detalle,
      usuario: rolActivo === 'ADMIN_DDE' ? 'Administrador DDE' : rolActivo === 'JEFE_CARRERA' ? 'Jefe de Carrera' : 'Docente',
      fecha: new Date().toLocaleString('es-BO')
    };
    setAuditLog(prev => [nuevoLog, ...prev]);
  }, [rolActivo]);

  // Transiciones de flujo
  const registrarTransicionFlujo = (nuevoEstado, glosaAccion, rolOperador) => {
    setEstadoGlobal(nuevoEstado);
    setHistorial(prev => [{
      id: Date.now(),
      fecha: new Date().toLocaleString('es-BO'),
      accion: glosaAccion,
      usuario: rolOperador === 'ADMIN_DDE' ? 'Administrador DDE' : 'Jefe de Carrera',
      estado: nuevoEstado
    }, ...prev]);
    setAlertasEmitidas(prev => [{
      id: Date.now(),
      titulo: `Cambio de Estado Estructural`,
      mensaje: `El documento de horarios cambió al estado [${nuevoEstado}]. Acción: ${glosaAccion}`,
      destino: nuevoEstado === 'EN_REVISION' ? 'Jefatura de Carrera' : 'Cuerpo Docente y DDE',
      fecha: new Date().toLocaleString('es-BO')
    }, ...prev]);
    registrarAuditoriaInterna(`Cambio de Estado: ${nuevoEstado}`, glosaAccion);
  };

  const agregarObservacionFormal = () => {
    if (!obsTexto.trim()) return;
    const nuevaObs = {
      id: Date.now(),
      autor: rolActivo === 'DOCENTE' ? 'Docente de Carrera' : rolActivo === 'JEFE_CARRERA' ? 'Jefatura de Carrera' : 'Administrador DDE',
      texto: obsTexto,
      fecha: new Date().toLocaleString('es-BO'),
      tipo: rolActivo === 'DOCENTE' ? 'DOCENTE_OBS' : 'INTERNA'
    };
    setObservaciones(prev => [nuevaObs, ...prev]);
    if (rolActivo === 'DOCENTE') {
      setAlertasEmitidas(prev => [{
        id: Date.now(),
        titulo: 'Observación de Carga Docente Ingresada',
        mensaje: `Un docente ha remitido observaciones: "${obsTexto}"`,
        destino: 'DDE y Jefatura de Carrera',
        fecha: new Date().toLocaleString('es-BO')
      }, ...prev]);
    }
    registrarAuditoriaInterna("Registro de Observación", `Glosa: ${obsTexto}`);
    setObsTexto('');
  };

  // Componente interno para la fila de checklist
  const CheckRow = ({ label, ok }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: 6, fontSize: 12 }}>
      <span style={{ color: '#334155' }}>{label}</span>
      {ok ? <CheckCircle size={13} color="#16a34a" /> : <AlertTriangle size={13} color="#dc2626" />}
    </div>
  );

  return (
    <div className="sagh-validation-container">

      {/* Selector de roles institucionales */}
      <div className="institutional-role-selector">
        <div className="selector-meta">
          <User size={14} />
          <span>Simular Entorno de Usuario Activo:</span>
        </div>
        <div className="selector-actions">
          <button className={`switch-role-btn ${rolActivo === 'ADMIN_DDE' ? 'active' : ''}`} onClick={() => { setRolActivo('ADMIN_DDE'); setSubmoduloActivo('auditoria'); }}>
            Administrador DDE
          </button>
          <button className={`switch-role-btn ${rolActivo === 'JEFE_CARRERA' ? 'active' : ''}`} onClick={() => { setRolActivo('JEFE_CARRERA'); setSubmoduloActivo('auditoria'); }}>
            Jefe de Carrera
          </button>
          <button className={`switch-role-btn ${rolActivo === 'DOCENTE' ? 'active' : ''}`} onClick={() => { setRolActivo('DOCENTE'); setSubmoduloActivo('observaciones'); }}>
            Docente de Carrera
          </button>
        </div>
      </div>

      {/* Banner superior de flujo de trabajo */}
      <div className={`institutional-workflow-banner state-${estadoGlobal.toLowerCase()}`}>
        <div className="banner-left-side">
          {estadoGlobal === 'APROBADO' ? <CheckCircle size={26} /> : <FileText size={26} />}
          <div>
            <div className="banner-title">
              {estadoGlobal === 'BORRADOR' && 'Fase Actual: Elaboración y Estructuración de Horarios'}
              {estadoGlobal === 'EN_REVISION' && 'Fase Actual: Inspección y Control de Calidad por Jefatura'}
              {estadoGlobal === 'APROBADO' && 'Horario Oficial Consolidado y Publicado'}
            </div>
            <div className="banner-subtitle">
              {totalClases} periodos activos · {semestresLista.length} semestres evaluados · Estado: <strong>{estadoGlobal}</strong>
            </div>
          </div>
        </div>
        <div className="banner-right-side">
          {rolActivo === 'ADMIN_DDE' && estadoGlobal === 'BORRADOR' && (
            <button className="workflow-trigger-btn btn-gold" onClick={() => registrarTransicionFlujo('EN_REVISION', 'DDE eleva propuesta a Jefatura', 'ADMIN_DDE')}>
              <Send size={14} /> Elevar propuesta a Jefatura
            </button>
          )}
          {rolActivo === 'JEFE_CARRERA' && estadoGlobal === 'EN_REVISION' && (
            <div className="workflow-button-group">
              <button className="workflow-trigger-btn btn-danger" onClick={() => registrarTransicionFlujo('BORRADOR', 'Jefatura devuelve al DDE', 'JEFE_CARRERA')}>
                Devolver con Observaciones
              </button>
              <button className="workflow-trigger-btn btn-success" onClick={() => registrarTransicionFlujo('APROBADO', 'Jefatura aprueba formalmente', 'JEFE_CARRERA')} disabled={!sinConflictosCriticos}>
                <Check size={14} /> Aprobar Horario Formalmente
              </button>
            </div>
          )}
          {estadoGlobal === 'APROBADO' && <span className="immutable-badge">✓ DOCUMENTO BLOQUEADO</span>}
        </div>
      </div>

      {/* Pestañas principales */}
      <div className="institutional-tabs-navbar">
        {rolActivo !== 'DOCENTE' && (
          <button className={`tab-item-link ${submoduloActivo === 'auditoria' ? 'active' : ''}`} onClick={() => setSubmoduloActivo('auditoria')}>
            Validación y Calidad
          </button>
        )}
        <button className={`tab-item-link ${submoduloActivo === 'observaciones' ? 'active' : ''}`} onClick={() => setSubmoduloActivo('observaciones')}>
          Gestión de Observaciones
        </button>
        {rolActivo !== 'DOCENTE' && (
          <button className={`tab-item-link ${submoduloActivo === 'flujo' ? 'active' : ''}`} onClick={() => setSubmoduloActivo('flujo')}>
            Flujo de Aprobación
          </button>
        )}
        <button className={`tab-item-link ${submoduloActivo === 'notificaciones' ? 'active' : ''}`} onClick={() => setSubmoduloActivo('notificaciones')}>
          Historial de Alertas Emitidas
        </button>
      </div>

      {/* ========== CONTENIDO DE VALIDACIÓN Y CALIDAD (con sub-pestañas) ========== */}
      {submoduloActivo === 'auditoria' && rolActivo !== 'DOCENTE' && (
        <div className="submodule-viewport-card fade-in">
          {rolActivo === 'JEFE_CARRERA' && estadoGlobal === 'BORRADOR' ? (
            <div className="pending-state-lockout">
              <Shield size={44} className="lockout-icon" />
              <h4>Panel en Espera de Envío</h4>
              <p>El Administrador DDE se encuentra configurando la matriz. El panel analítico se activará cuando la propuesta sea elevada a su despacho.</p>
            </div>
          ) : (
            <>
              {/* Sub-menú de los 4 botones internos */}
              <div className="audit-subtabs" style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                {[
                  { id: 'resumen', label: 'Resumen General', icon: <BarChart2 size={14} /> },
                  { id: 'restricciones', label: 'Panel de Restricciones', icon: <Shield size={14} /> },
                  { id: 'inconsistencias', label: 'Bloques e Inconsistencias', icon: <AlertCircle size={14} /> },
                  { id: 'carga', label: 'Distribución de Carga', icon: <Users size={14} /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSubTabAuditoria(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 16px', borderRadius: '20px', border: 'none',
                      background: subTabAuditoria === tab.id ? C.navy : '#f1f5f9',
                      color: subTabAuditoria === tab.id ? C.gold : '#475569',
                      fontWeight: 'bold', fontSize: '12px', cursor: 'pointer'
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* === SUB-TAB: RESUMEN GENERAL === */}
              {subTabAuditoria === 'resumen' && (
                <div>
                  <div className="metrics-dashboard-row" style={{ marginBottom: '20px' }}>
                    <div className="metric-box-item"><div className="metric-num color-navy">{totalClases}</div><div className="metric-lbl">Clases Asignadas</div></div>
                    <div className={`metric-box-item ${criticos.length > 0 ? 'bg-danger-subtle' : 'bg-success-subtle'}`}><div className="metric-num">{criticos.length}</div><div className="metric-lbl">Conflictos Críticos</div></div>
                    <div className={`metric-box-item ${advertencias.length > 0 ? 'bg-warning-subtle' : 'bg-success-subtle'}`}><div className="metric-num">{advertencias.length}</div><div className="metric-lbl">Advertencias</div></div>
                    <div className="metric-box-item"><div className="metric-num color-navy">{docentes.filter(d => (horasDoc?.[d.id] || 0) > 0).length}</div><div className="metric-lbl">Docentes con Carga</div></div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="audit-section-panel" style={{ marginBottom: 0 }}>
                      <h3 className="audit-section-header color-navy">Checklist de Calidad (RAC-03)</h3>
                      <CheckRow label="Cruce de Docentes y Aulas" ok={conflictos.filter(c => c.tipo === 'cruce_docente').length === 0} />
                      <CheckRow label="Franja Horaria Preferencial (Lun-Vie, 07:45-15:00)" ok={conflictos.filter(c => c.tipo === 'franja_horaria' && c.sev === 'error').length === 0} />
                      <CheckRow label="Recesos de 15 Minutos" ok={conflictos.filter(c => c.tipo === 'recesos').length === 0} />
                      <CheckRow label="Bloques Coherentes (mínimo 2 períodos)" ok={conflictos.filter(c => c.tipo === 'bloque_suelto').length === 0} />
                    </div>
                    <div className="audit-section-panel" style={{ marginBottom: 0 }}>
                      <h3 className="audit-section-header color-navy">Estado del Flujo</h3>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                        <div><strong>Estado actual:</strong> {estadoGlobal}</div>
                        <div><strong>Total de clases:</strong> {totalClases}</div>
                        <div><strong>Semestres:</strong> {semestresLista.join(', ')}</div>
                        <div><strong>Docentes sobrecargados:</strong> {docentesSobrecargados.length}</div>
                      </div>
                    </div>
                  </div>

                  {auditLog.length > 0 && (
                    <div className="audit-section-panel internal-engine-logs" style={{ marginTop: '20px' }}>
                      <h3 className="audit-section-header"><Clock size={13} /> Log Interno del Motor de Auditoría</h3>
                      <div className="engine-log-scroll">
                        {auditLog.map(log => (
                          <div key={log.id} className="engine-log-line">
                            <span className="log-stamp">[{log.fecha}]</span>
                            <span className="log-action">{log.accion}</span>
                            <span className="log-detail">{log.detalle}</span>
                            <span className="log-user">Por: {log.usuario}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* === SUB-TAB: PANEL DE RESTRICCIONES (con selector de semestre) === */}
              {subTabAuditoria === 'restricciones' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '14px 18px', borderRadius: 10, marginBottom: 20 }}>
                    <div>
                      <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}><Layers size={14} color={C.gold} /> Control de Análisis por Semestre</div>
                      <p style={{ fontSize: 11, margin: 0 }}>Aísle el comportamiento del motor para cada curso.</p>
                    </div>
                    <select value={semestreAnalisis} onChange={e => setSemestreAnalisis(parseInt(e.target.value))} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                      {semestresLista.map(s => <option key={s} value={s}>Semestre {s}°</option>)}
                    </select>
                  </div>

                  {(() => {
                    const fallosSemestre = conflictos.filter(c => c.sem === semestreAnalisis);
                    const cruces = fallosSemestre.filter(c => c.tipo === 'cruce_docente');
                    const franja = fallosSemestre.filter(c => c.tipo === 'franja_horaria');
                    const recesos = fallosSemestre.filter(c => c.tipo === 'recesos');
                    const bloques = fallosSemestre.filter(c => c.tipo === 'bloque_suelto');
                    return (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                          <div className={`criterio-card ${cruces.length === 0 ? 'ok' : 'fail'}`} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, background: cruces.length === 0 ? '#f0fdf4' : '#fef2f2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{cruces.length === 0 ? <CheckCircle size={14} color="#16a34a" /> : <XCircle size={14} color="#dc2626" />}<strong>Cruce de Docentes y Aulas</strong></div>
                            <p style={{ fontSize: 11 }}>{cruces.length === 0 ? '✓ Sin conflictos' : `⚠ ${cruces.length} solapamiento(s)`}</p>
                          </div>
                          <div className={`criterio-card ${franja.length === 0 ? 'ok' : 'warn'}`} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, background: franja.length === 0 ? '#f0fdf4' : '#fffbeb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{franja.length === 0 ? <CheckCircle size={14} color="#16a34a" /> : <AlertTriangle size={14} color="#d97706" />}<strong>Franja Horaria Preferencial</strong></div>
                            <p style={{ fontSize: 11 }}>{franja.length === 0 ? '✓ Dentro de Lunes a Viernes, 07:45-15:00' : `⚠ ${franja.length} incumplimiento(s)`}</p>
                          </div>
                          <div className={`criterio-card ${recesos.length === 0 ? 'ok' : 'warn'}`} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, background: recesos.length === 0 ? '#f0fdf4' : '#fffbeb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{recesos.length === 0 ? <CheckCircle size={14} color="#16a34a" /> : <Clock size={14} color="#d97706" />}<strong>Recesos de 15 Minutos</strong></div>
                            <p style={{ fontSize: 11 }}>{recesos.length === 0 ? '✓ Descansos respetados' : `⚠ ${recesos.length} bloque(s) violan pausa`}</p>
                          </div>
                          <div className={`criterio-card ${bloques.length === 0 ? 'ok' : 'warn'}`} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, background: bloques.length === 0 ? '#f0fdf4' : '#fffbeb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{bloques.length === 0 ? <CheckCircle size={14} color="#16a34a" /> : <AlertCircle size={14} color="#d97706" />}<strong>Bloques Coherentes</strong></div>
                            <p style={{ fontSize: 11 }}>{bloques.length === 0 ? '✓ Sin períodos sueltos' : `⚠ ${bloques.length} bloque(s) suelto(s)`}</p>
                          </div>
                        </div>

                        <div className="audit-section-panel" style={{ background: '#f8fafc' }}>
                          <h4 className="audit-section-header"><Activity size={14} color={C.gold} /> Auditoría Detallada del Semestre {semestreAnalisis}°</h4>
                          <div style={{ background: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderBottom: '1px dashed #e2e8f0', paddingBottom: 4 }}><span>Disponibilidad Semanal (Lun-Vie):</span><span style={{ fontWeight: 'bold', color: '#16a34a' }}>✓ Conforme</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderBottom: '1px dashed #e2e8f0', paddingBottom: 4 }}><span>Umbral de Apertura (07:45):</span><span style={{ fontWeight: 'bold', color: '#16a34a' }}>✓ Conforme</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderBottom: '1px dashed #e2e8f0', paddingBottom: 4 }}><span>Límite Máximo de Salida (15:00):</span><span style={{ fontWeight: 'bold', color: '#16a34a' }}>✓ Conforme</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}><span>Estructura de Recesos:</span><span style={{ fontWeight: 'bold', color: recesos.length === 0 ? '#16a34a' : '#d97706' }}>{recesos.length === 0 ? '✓ Conforme' : `⚠ Incumplido (${recesos.length})`}</span></div>
                          </div>
                          {fallosSemestre.length > 0 ? (
                            <div>
                              <div style={{ fontWeight: 'bold', color: '#991b1b', fontSize: 11, marginBottom: 8 }}>⚠ ALERTAS EN EL SEMESTRE {semestreAnalisis}°:</div>
                              <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {fallosSemestre.map((f, idx) => (
                                  <div key={idx} style={{ background: f.sev === 'error' ? '#fef2f2' : '#fffbeb', borderLeft: `3px solid ${f.sev === 'error' ? '#dc2626' : '#d97706'}`, padding: '8px 10px', fontSize: 11 }}>
                                    <strong>[{f.tipo.toUpperCase()}]</strong> — {f.mensaje}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div style={{ background: '#f0fdf4', padding: 10, borderRadius: 6, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <CheckCircle size={14} color="#16a34a" /> El semestre {semestreAnalisis}° aprueba todos los controles.
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* === SUB-TAB: BLOQUES E INCONSISTENCIAS === */}
              {subTabAuditoria === 'inconsistencias' && (
                <div>
                  <h3 className="audit-section-header color-navy">Diagnóstico de Consistencia</h3>
                  {advertencias.length === 0 ? (
                    <div style={{ color: '#166534', padding: 12, background: '#f0fdf4', borderRadius: 8 }}>Sin advertencias secundarias en la matriz horaria actual.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {advertencias.map((adv, idx) => (
                        <div key={idx} style={{ padding: '10px 14px', background: '#fffbeb', borderLeft: `4px solid ${adv.tipo === 'carga' ? '#2563eb' : '#d97706'}`, borderRadius: 8, fontSize: 12 }}>
                          <strong>{adv.tipo?.toUpperCase()}</strong>: {adv.mensaje}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* === SUB-TAB: DISTRIBUCIÓN DE CARGA === */}
              {subTabAuditoria === 'carga' && (
                <div>
                  <h3 className="audit-section-header color-navy">Balance de Carga y Horas Docente</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 'bold', color: '#991b1b', marginBottom: 8 }}>Docentes con Sobrecarga ({docentesSobrecargados.length})</div>
                      {docentesSobrecargados.length === 0 ? <p style={{ fontSize: 11, color: '#6b7280' }}>Ninguno detectado.</p> :
                        docentesSobrecargados.map(d => <div key={d.id} style={{ padding: 8, background: '#fef2f2', borderRadius: 6, marginBottom: 4 }}>• {d.nombre} — {horasDoc[d.id]}h / {d.maxHoras}h</div>)
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 'bold', color: '#2563eb', marginBottom: 8 }}>Docentes bajo el Mínimo ({docentesBajoMinimo.length})</div>
                      {docentesBajoMinimo.length === 0 ? <p style={{ fontSize: 11, color: '#6b7280' }}>Ninguno detectado.</p> :
                        docentesBajoMinimo.map(d => <div key={d.id} style={{ padding: 8, background: '#eff6ff', borderRadius: 6, marginBottom: 4 }}>• {d.nombre} — {horasDoc[d.id]}h / {d.minHoras}h</div>)
                      }
                    </div>
                  </div>

                  <div className="audit-section-panel" style={{ marginTop: 20 }}>
                    <h3 className="audit-section-header color-navy">Distribución de Carga de Cátedra</h3>
                    <div className="teachers-progress-grid">
                      {docentes.map(d => {
                        const horas = horasDoc?.[d.id] || 0;
                        const pct = Math.min(100, (horas / d.maxHoras) * 100);
                        const over = horas > d.maxHoras;
                        return (
                          <div key={d.id} className={`teacher-progress-card ${over ? 'overloaded' : ''}`}>
                            <div className="teacher-progress-meta">
                              <span className="t-name">{d.nombre}</span>
                              <span className={`t-hours ${over ? 'text-danger' : 'text-success'}`}>{horas} / {d.maxHoras}h</span>
                            </div>
                            <div className="progressbar-track">
                              <div className={`progressbar-thumb ${over ? 'thumb-danger' : pct > 80 ? 'thumb-warning' : 'thumb-success'}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========== GESTIÓN DE OBSERVACIONES ========== */}
      {submoduloActivo === 'observaciones' && (
        <div className="submodule-viewport-card fade-in">
          <div className="observations-workspace-grid">
            {estadoGlobal !== 'APROBADO' && (
              <div className="observation-form-holder">
                <h3 className="audit-section-header color-navy">Asentar Nueva Observación Formal</h3>
                <div className="input-inline-flex-row">
                  <input value={obsTexto} onChange={e => setObsTexto(e.target.value)} placeholder={rolActivo === 'DOCENTE' ? 'Describa su solicitud...' : 'Escriba una directriz técnica...'} style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={agregarObservacionFormal} style={btnPrimary} className="add-obs-submit-btn"><Plus size={14} /> Registrar</button>
                </div>
              </div>
            )}
            <div className="observations-split-display">
              {rolActivo !== 'DOCENTE' && (
                <div className="obs-bucket">
                  <h4 className="bucket-title">Coordinación de Autoridades (DDE ↔ Jefatura)</h4>
                  {observaciones.filter(o => o.tipo === 'INTERNA').map(obs => (
                    <div key={obs.id} className="institutional-comment-pill internally">
                      <div className="comment-meta-row"><strong>{obs.autor}</strong><span>{obs.fecha}</span></div>
                      <p>{obs.texto}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="obs-bucket">
                <h4 className="bucket-title">Buzón de Reclamos y Solicitudes de Docentes</h4>
                {observaciones.filter(o => o.tipo === 'DOCENTE_OBS').length === 0 ? <p className="empty-disclaimer-text">No se registran solicitudes entrantes.</p> :
                  observaciones.filter(o => o.tipo === 'DOCENTE_OBS').map(obs => (
                    <div key={obs.id} className="institutional-comment-pill teacher-sent">
                      <div className="comment-meta-row"><strong className="text-gold">{obs.autor}</strong><span>{obs.fecha}</span></div>
                      <p>{obs.texto}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== FLUJO DE APROBACIÓN (TRAZABILIDAD) ========== */}
      {submoduloActivo === 'flujo' && rolActivo !== 'DOCENTE' && (
        <div className="submodule-viewport-card fade-in">
          <div className="trazabilidad-panel">
            <h3 className="audit-section-header color-navy"><Archive size={15} /> Historial de Trazabilidad y Firmas Oficiales</h3>
            <div className="timeline-stack-container">
              {historial.map(h => (
                <div key={h.id} className="timeline-event-row">
                  <span className="event-date">{h.fecha}</span>
                  <span className="event-action">{h.accion}</span>
                  <span className="event-user">— Operador: {h.usuario}</span>
                  <span className={`event-badge-pill state-${h.estado.toLowerCase()}`}>{h.estado}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== HISTORIAL DE ALERTAS EMITIDAS ========== */}
      {submoduloActivo === 'notificaciones' && (
        <div className="submodule-viewport-card fade-in">
          <div className="notifications-server-log-view">
            <h3 className="audit-section-header color-navy"><Bell size={15} /> Registro de Despacho de Notificaciones Electrónicas</h3>
            <div className="notifications-stack">
              {alertasEmitidas.map(alerta => (
                <div key={alerta.id} className="notification-strip">
                  <div className="strip-decor-line" />
                  <div className="strip-content-body">
                    <div className="strip-meta-top"><strong>{alerta.titulo}</strong><span className="time-lbl">{alerta.fecha}</span></div>
                    <p className="strip-message-para">{alerta.mensaje}</p>
                    <div className="strip-footer-tag">Destinatario: {alerta.destino}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}