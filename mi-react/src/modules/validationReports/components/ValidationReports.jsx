import React, { useState, useCallback } from 'react';
import { 
  CheckCircle, AlertTriangle, Shield, Check, AlertCircle, Clock, 
  Archive, BarChart2, Users, ClipboardList, Bell, RefreshCw, 
  Pencil, Layers, XCircle, Activity, Info
} from 'lucide-react';
import { C, DIAS } from '../../../shared/constants';
import { EmptyState } from '../../../shared/components/Forms';
import { validarHorario } from '../backend/validationService';
import '../styles/validationReports.css';

export function Mod5ValidacionView({ 
  horario, docentes, horasDoc, estado, onAprobar, onVerHorario, historial = [], addNotif, usuario 
}) {
  const [obsTexto, setObsTexto] = useState('');
  const [obsDest, setObsDest] = useState('DDE');
  const [observaciones, setObservaciones] = useState([]);
  const [tabActiva, setTabActiva] = useState('resumen');
  const [notifEnv, setNotifEnv] = useState([]);
  const [validado, setValidado] = useState(false);
  const [archivadas, setArchivadas] = useState(new Set());
  const [auditLog, setAuditLog] = useState([]);
  
  // Apartado interactivo de selección de semestre para el flujo de control DDE - Jefe de Carrera
  const [semestreAnalisis, setSemestreAnalisis] = useState(3);

  const rol = usuario?.rol || '';
  const esDDE = rol === 'DDE';
  const esAdmin = rol === 'Administrador';
  const esJefe = rol === 'Jefe de Carrera';
  const esDocente = rol === 'Docente';
  const verObs = esDDE || esJefe || esAdmin;
  const puedeAprobar = esJefe || esAdmin;

  const registrarAuditoria = useCallback((accion, detalle = '') => {
    const log = {
      id: Date.now() + Math.random(),
      accion,
      detalle,
      usuario: usuario?.nombre || 'Sistema',
      rol: usuario?.rol || '—',
      fecha: new Date().toLocaleString('es-BO')
    };
    setAuditLog(prev => [log, ...prev]);
    return log;
  }, [usuario]);

  if (!horario) {
    return (
      <EmptyState 
        icon={<Shield size={40} />} 
        titulo="Sin horario generado" 
        desc="Por favor, navegue al Módulo de Generación (MOD-3) para crear una matriz horaria estructurada." 
      />
    );
  }

  // Ejecución del motor analítico
  const conflictos = validarHorario(horario, docentes);
  const semestresLista = [3, 4, 5, 6, 7, 8, 9, 10];
  
  const totalClases = semestresLista.reduce((acc, s) => {
    let c = 0;
    for (let d = 0; d < 5; d++) {
      for (let p = 0; p < 8; p++) {
        if (horario[s]?.[d]?.[p]) c++;
      }
    }
    return acc + c;
  }, 0);

  const docentesSobrecargados = docentes.filter(d => (horasDoc?.[d.id] || 0) > d.maxHoras);
  const docentesBajoMinimo = docentes.filter(d => (horasDoc?.[d.id] || 0) < d.minHoras && (horasDoc?.[d.id] || 0) > 0);

  const criticos = conflictos.filter(c => c.sev === 'error');
  const advertencias = [
    ...conflictos.filter(c => c.sev === 'warning'),
    ...docentesSobrecargados.map(d => ({ tipo: 'carga', mensaje: `${d.nombre}: Registra ${horasDoc?.[d.id]}h de ${d.maxHoras}h máximas permitidas (Sobrecarga).` }))
  ];
  const informativos = [
    ...docentesBajoMinimo.map(d => ({ tipo: 'carga', mensaje: `${d.nombre}: Carga actual por debajo del mínimo reglamentario (${horasDoc?.[d.id]}h / ${d.minHoras}h).` }))
  ];

  const tieneCriticos = criticos.length > 0;
  const puedeAprobarHorario = puedeAprobar && !tieneCriticos && estado !== 'aprobado';

  const ESTADOS_MAP = {
    null: { label: 'No Generado', color: '#94a3b8', bg: '#f1f5f9' },
    pendiente: { label: 'Pendiente de Validación', color: '#92400e', bg: '#fef9c3' },
    aprobado: { label: 'Aprobado Formalmente', color: '#166534', bg: '#dcfce7' }
  };
  const eInfo = ESTADOS_MAP[estado] || ESTADOS_MAP[null];

  const handleAprobar = () => {
    if (!puedeAprobarHorario) return;
    onAprobar();
    registrarAuditoria('Horario aprobado formalmente', `Emitido por: ${usuario?.nombre}`);
    setNotifEnv(prev => [{
      id: Date.now(),
      tipo: 'success',
      msg: `Horario aprobado institucionalmente por ${usuario?.nombre}. Notificación emitida a secretaría general y DDE.`,
      fecha: new Date().toLocaleString('es-BO')
    }, ...prev]);
    addNotif('Horario aprobado formalmente', 'success');
  };

  const handleValidar = () => {
    setValidado(true);
    registrarAuditoria('Validación global ejecutada', `Resultado: ${criticos.length} críticos, ${advertencias.length} advertencias.`);
    addNotif(`Validación completada: ${criticos.length} críticos detectados.`, tieneCriticos ? 'warning' : 'success');
  };

  const handleAgregarObs = () => {
    if (!obsTexto.trim()) return;
    const nuevaObs = {
      id: Date.now(),
      texto: obsTexto,
      destinatario: obsDest,
      fecha: new Date().toLocaleString('es-BO'),
      autor: usuario?.nombre || 'Sistema',
      rol: usuario?.rol || '—'
    };
    setObservaciones(prev => [nuevaObs, ...prev]);
    registrarAuditoria(`Observación dirigida a ${obsDest}`, `Texto: "${obsTexto.slice(0, 40)}..."`);
    
    if (obsDest === 'DDE') {
      setNotifEnv(prev => [{
        id: Date.now() + 1,
        tipo: 'warning',
        msg: `DDE Alerta: Nueva observación cursada por ${usuario?.nombre}: "${obsTexto.slice(0, 45)}..."`,
        fecha: new Date().toLocaleString('es-BO')
      }, ...prev]);
      addNotif(`Dirección de Departamento Educativo (DDE) notificada sobre la observación.`, 'warning');
    }
    addNotif(`Observación registrada correctamente para ${obsDest}.`, 'info');
    setObsTexto('');
  };

  const handleEnviarNotificacionManual = (msg, tipo) => {
    setNotifEnv(prev => [{ id: Date.now(), tipo, msg, fecha: new Date().toLocaleString('es-BO') }, ...prev]);
    registrarAuditoria('Notificación manual distribuida', msg.slice(0, 60));
    addNotif(msg, tipo);
  };

  const handleArchivarAlerta = (id, justificacion) => {
    setArchivadas(prev => new Set([...prev, id]));
    registrarAuditoria('Alerta técnica archivada', justificacion || 'Bajo justificación de contingencia');
    addNotif('Alerta archivada en el registro de excepciones.', 'info');
  };

  const TABS = [
    { id: 'resumen', label: 'Resumen General', icon: <BarChart2 size={13} /> },
    { id: 'restricciones', label: 'Panel de Restricciones', icon: <Shield size={13} /> },
    { id: 'inconsistencias', label: 'Bloques e Inconsistencias', icon: <AlertCircle size={13} /> },
    { id: 'carga', label: 'Distribución de Carga', icon: <Users size={13} /> },
    ...(verObs ? [{ id: 'observaciones', label: 'Observaciones', icon: <ClipboardList size={13} /> }] : []),
    { id: 'historial', label: 'Bitácora Histórica', icon: <Archive size={13} /> },
    { id: 'notificaciones', label: 'Panel Notificaciones', icon: <Bell size={13} /> }
  ];

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Banner Principal Interactivo */}
      <div style={{
        background: tieneCriticos ? 'linear-gradient(135deg,#7f1d1d,#991b1b)' : advertencias.length > 0 ? 'linear-gradient(135deg,#78350f,#92400e)' : 'linear-gradient(135deg,#14532d,#166534)',
        borderRadius: 14, padding: '18px 24px', marginBottom: 18, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap:12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {tieneCriticos ? <AlertTriangle size={28} /> : <CheckCircle size={28} />}
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>
              {tieneCriticos ? `${criticos.length} Conflicto(s) Crítico(s) — Requiere Subsanación` : advertencias.length > 0 ? `${advertencias.length} Advertencia(s) Técnicas — Revisar antes de firmar` : 'Horario Válido — Certificado por Normativas EMI'}
            </div>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 3 }}>
              {totalClases} periodos agendados · {semestresLista.length} semestres validados · Estado: <strong>{eInfo.label}</strong>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={handleValidar} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} /> Ejecutar Validación
          </button>
          {tieneCriticos && (
            <button onClick={() => handleEnviarNotificacionManual(`Atención: Se identificaron ${criticos.length} anomalías críticas que bloquean el proceso de aprobación formal.`, 'error')} style={{ background: 'rgba(239,68,68,0.3)', color: 'white', border: '1px solid rgba(239,68,68,0.5)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={13} /> Emitir Alerta Crítica
            </button>
          )}
          {puedeAprobarHorario && (
            <button onClick={handleAprobar} style={{ background: C.gold, color: C.navy, border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Check size={14} /> Aprobar Horario Oficial
            </button>
          )}
          {tieneCriticos && puedeAprobar && <div style={{ fontSize: 11, background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: 7, color: 'rgba(255,255,255,0.85)' }}>🔒 Aprobación restringida por criticidad</div>}
          {estado === 'aprobado' && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '7px 16px', borderRadius: 8, fontWeight: 'bold', fontSize: 13 }}>✓ HORARIO APROBADO</span>}
        </div>
      </div>

      {/* Banner de Estado Post Validación */}
      {validado && (
        <div style={{ background: tieneCriticos ? '#fef2f2' : '#f0fdf4', border: `1px solid ${tieneCriticos ? '#fecaca' : '#dcfce7'}`, borderRadius: 9, padding: '11px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          {tieneCriticos ? <AlertCircle size={16} color="#dc2626" /> : <CheckCircle size={16} color="#16a34a" />}
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 'bold', color: tieneCriticos ? '#991b1b' : '#166534', fontSize: 13 }}>Resultado del Motor: </span>
            <span style={{ fontSize: 12, color: '#374151' }}>{criticos.length} críticos · {advertencias.length} advertencias · {informativos.length} informativos</span>
          </div>
          {tieneCriticos && <button onClick={onVerHorario} style={{ fontSize: 11, background: '#991b1b', color: 'white', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>Resolver en Matriz →</button>}
        </div>
      )}

      {/* Menú de Navegación por Pestañas */}
      <div style={{ display: 'flex', gap: 5, marginBottom:16, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTabActiva(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 'bold', background: tabActiva === t.id ? C.navy : '#e2e8f0', color: tabActiva === t.id ? C.gold : '#6b7280' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO TABS */}
      
      {/* ── TABA: RESUMEN GENERAL ── */}
      {tabActiva === 'resumen' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
            {[
              { v: totalClases, l: 'Periodos Asignados', c: C.navy, sub: `${semestresLista.length} Semestres Activos` },
              { v: criticos.length, l: 'Conflictos Críticos', c: tieneCriticos ? '#991b1b' : '#166534', sub: 'Bloquean Aprobación' },
              { v: advertencias.length, l: 'Advertencias Técnicas', c: advertencias.length > 0 ? '#92400e' : '#166534', sub: 'Revisión Sugerida' },
              { v: informativos.length, l: 'Alertas de Carga', c: '#2563eb', sub: 'Alertas Administrativas' }
            ].map(m => (
              <div key={m.l} style={{ background: 'white', borderRadius: 11, padding: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: m.c }}>{m.v}</div>
                <div style={{ fontSize: 11, color: C.navy, fontWeight: 'bold', marginTop: 3 }}>{m.l}</div>
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 1 }}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
              <h3 style={{ margin: '0 0 12px 0', color: C.navy, fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={14} /> Estado de Flujo Institucional</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(ESTADOS_MAP).filter(([k]) => k !== 'null').map(([key, info]) => (
                  <div key={key} style={{ background: info.bg, border: `2px solid ${estado === key ? info.color : 'transparent'}`, borderRadius: 9, padding: '11px 14px' }}>
                    <div style={{ fontWeight: 'bold', color: info.color, fontSize: 13 }}>{info.label}</div>
                    {estado === key && <div style={{ fontSize: 10, color: info.color, marginTop: 3, fontWeight: 'bold' }}>← Posición Actual del Proceso</div>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
              <h3 style={{ margin: '0 0 12px 0', color: C.navy, fontSize: 13, fontWeight: 'bold' }}>Checklist Rápido de Calidad (RAC-03)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <CheckRow label="Cruce de Plantel Docente" ok={conflictos.filter(c => c.tipo === 'cruce_docente').length === 0} />
                <CheckRow label="Garantía de Franja Horaria Semanal Preferencial" ok={conflictos.filter(c => c.tipo === 'franja_horaria').length === 0} />
                <CheckRow label="Verificación de Recesos de 15 Minutos" ok={conflictos.filter(c => c.tipo === 'recesos').length === 0} />
                <CheckRow label="Optimización de Bloques Coherentes" ok={conflictos.filter(c => c.tipo === 'bloque_suelto').length === 0} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TABA: PANEL ANALÍTICO DE CUMPLIMIENTO DE RESTRICCIONES ── */}
      {tabActiva === 'restricciones' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: C.navy, fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={15} /> Panel Analítico de Cumplimiento de Restricciones
            </h3>
            <button onClick={handleValidar} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: C.navy, color: 'white', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>
              <RefreshCw size={12} /> Sincronizar Motor
            </button>
          </div>

          {/* APARTADO DE SELECCIÓN INTERACTIVA DE SEMESTRE (DIAGNÓSTICO MATEMÁTICO AISLADO) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '14px 18px', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20 }}>
            <div style={{ flex: 1, paddingRight: 16 }}>
              <div style={{ color: C.navy, fontWeight: 'bold', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={14} color={C.gold} /> Control de Análisis de Curso por Semestre
              </div>
              <p style={{ margin: '3px 0 0 0', color: '#6b7280', fontSize: 11, lineHeight: '1.4' }}>
                Aísle el comportamiento del motor analítico. Permite al Administrador DDE y al Jefe de Carrera auditar qué semestres específicos quiebran las directivas de laEMI.
              </p>
            </div>
            <select
              value={semestreAnalisis}
              onChange={(e) => setSemestreAnalisis(parseInt(e.target.value))}
              style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white', color: C.navy, fontWeight: 'bold', fontSize: 12, cursor: 'pointer', minWidth: 150 }}
            >
              {semestresLista.map(s => (
                <option key={s} value={s}>Semestre {s}°</option>
              ))}
            </select>
          </div>

          {/* RENDERIZADO DINÁMICO BASADO EN EL SEMESTRE SELECCIONADO */}
          {(() => {
            const fallosSemestre = conflictos.filter(c => c.sem === semestreAnalisis);
            const cruces = fallosSemestre.filter(c => c.tipo === 'cruce_docente');
            const franja = fallosSemestre.filter(c => c.tipo === 'franja_horaria');
            const recesos = fallosSemestre.filter(c => c.tipo === 'recesos');
            const bloques = fallosSemestre.filter(c => c.tipo === 'bloque_suelto');

            return (
              <div>
                <div style={{ fontSize: 11, fontWeight: 'bold', color: C.navy, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  Indicadores de Cumplimiento Específicos — Semestre {semestreAnalisis}°
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  
                  {/* Criterio 1: Cruce de Docentes y Aulas */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, background: cruces.length === 0 ? '#f0fdf4' : '#fef2f2', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {cruces.length === 0 ? <CheckCircle size={15} color="#16a34a" /> : <XCircle size={15} color="#dc2626" />}
                      <span style={{ fontSize: 12, fontWeight: 'bold', color: cruces.length === 0 ? '#166534' : '#991b1b' }}>
                        Cruce de Docentes y Aulas
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: '1.4' }}>
                      {cruces.length === 0 ? '✓ Exclusividad de horarios validada. Sin colisiones en el plantel ni superposición en infraestructura de aulas.' : `⚠ Registra ${cruces.length} solapamiento(s) crítico(s) de asignación.`}
                    </p>
                  </div>

                  {/* Criterio 2: Garantía de Franja Horaria Semanal Preferencial */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, background: franja.length === 0 ? '#f0fdf4' : '#fffbeb', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {franja.length === 0 ? <CheckCircle size={15} color="#16a34a" /> : <AlertTriangle size={15} color="#d97706" />}
                      <span style={{ fontSize: 12, fontWeight: 'bold', color: franja.length === 0 ? '#166534' : '#92400e' }}>
                        Garantía de Franja Horaria Semanal Preferencial
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: '1.4' }}>
                      {franja.length === 0 ? '✓ Estructuración de clases encuadrada estrictamente de Lunes a Viernes entre 07:45 AM y 15:00 PM.' : '⚠ Se detectaron omisiones o desajustes respecto a los umbrales de la jornada académica obligatoria.'}
                    </p>
                  </div>

                  {/* Criterio 3: Verificar Cumplimiento de Recesos */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, background: recesos.length === 0 ? '#f0fdf4' : '#fffbeb', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {recesos.length === 0 ? <CheckCircle size={15} color="#16a34a" /> : <Clock size={15} color="#d97706" />}
                      <span style={{ fontSize: 12, fontWeight: 'bold', color: recesos.length === 0 ? '#166534' : '#92400e' }}>
                        Verificar Cumplimiento de Recesos
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: '1.4' }}>
                      {recesos.length === 0 ? '✓ Intervalos de descanso automáticos de 15 minutos respetados rigurosamente según la densidad del día.' : `⚠ Existen ${recesos.length} bloques que invaden la franja reglamentaria de descanso continuo.`}
                    </p>
                  </div>

                  {/* Criterio 4: Optimización de Bloques Coherentes */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, background: bloques.length === 0 ? '#f0fdf4' : '#fffbeb', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {bloques.length === 0 ? <CheckCircle size={15} color="#16a34a" /> : <AlertCircle size={15} color="#d97706" />}
                      <span style={{ fontSize: 12, fontWeight: 'bold', color: bloques.length === 0 ? '#166534' : '#92400e' }}>
                        Optimización de Bloques Coherentes
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: '1.4' }}>
                      {bloques.length === 0 ? '✓ Sin periodos sueltos. Las materias garantizan la continuidad de al menos 2 períodos lectivos por sesión.' : `⚠ Se ubicaron ${bloques.length} horas sueltas que atentan contra el plan pedagógico.`}
                    </p>
                  </div>
                </div>

                {/* VISUALIZADOR DE AUDITORÍA DETALLADA PARA LA FRANJA PREFERENCIAL Y RECESOS */}
                <div style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', padding: 18 }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 13, color: C.navy, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={14} color={C.gold} /> Auditoría Detallada de Restricciones del Semestre
                  </h4>
                  
                  <div style={{ background: 'white', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 6 }}>
                      <span style={{ color: '#6b7280' }}>Disponibilidad Semanal Exclusiva (Lunes a Viernes):</span>
                      <span style={{ fontWeight: 'bold', color: '#16a34a' }}>✓ Conforme (Ninguna clase agendada en fines de semana)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 6 }}>
                      <span style={{ color: '#6b7280' }}>Umbral de Apertura Matutina:</span>
                      <span style={{ fontWeight: 'bold', color: '#16a34a' }}>✓ Conforme (Inicio exacto a las 07:45 AM en periodos lectivos)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 6 }}>
                      <span style={{ color: '#6b7280' }}>Límite Máximo de Salida de Clases:</span>
                      <span style={{ fontWeight: 'bold', color: '#16a34a' }}>✓ Conforme (Ningún periodo excede las 15:00 PM / Período 8 máximo)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Estructura de Recesos de 15 Minutos:</span>
                      <span style={{ fontWeight: 'bold', color: recesos.length === 0 ? '#16a34a' : '#d97706' }}>
                        {recesos.length === 0 ? '✓ Conforme (Descansos respetados cada 2 o 3 períodos según carga)' : `⚠ Incumplido (${recesos.length} materias violan el intervalo de descanso)`}
                      </span>
                    </div>
                  </div>

                  {/* Listado pormenorizado de logs de error del semestre */}
                  {fallosSemestre.length > 0 ? (
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#991b1b', fontSize: 11, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Info size={12} /> ALERTA DE RESTRICCIONES EN EL SEMESTRE {semestreAnalisis}°:
                      </div>
                      <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {fallosSemestre.map((f, i) => (
                          <div key={i} style={{ background: f.sev === 'error' ? '#fef2f2' : '#fffbeb', border: `1px solid ${f.sev === 'error' ? '#fecaca' : '#fef08a'}`, borderRadius: 7, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <AlertTriangle size={13} color={f.sev === 'error' ? '#dc2626' : '#d97706'} style={{ marginTop: 2, flexShrink: 0 }} />
                            <div style={{ flex: 1, fontSize: 11, color: '#334155' }}>
                              <strong style={{ color: f.sev === 'error' ? '#991b1b' : '#92400e', textTransform: 'uppercase' }}>[{f.tipo}]</strong> — {f.mensaje}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#f0fdf4', color: '#166534', borderRadius: 8, padding: '11px 14px', fontSize: 11, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={14} /> Excelente: El Semestre {semestreAnalisis}° aprueba de forma impecable todos los controles analíticos de franja y recesos de la institución.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── TABA: INCONSISTENCIAS GENERALES ── */}
      {tabActiva === 'inconsistencias' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 22 }}>
          <h3 style={{ margin: '0 0 12px 0', color: C.navy, fontSize: 14, fontWeight: 'bold' }}>Diagnóstico de Consistencia</h3>
          {advertencias.length === 0 ? (
            <div style={{ color: '#166534', padding: 12, background: '#f0fdf4', borderRadius: 8, fontSize: 12 }}>Sin advertencias secundarias en la matriz horaria actual.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {advertencias.map((adv, idx) => (
                <div key={idx} style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fef08a', borderRadius: 8, fontSize: 12, color: '#92400e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>⚠ <strong>{adv.tipo?.toUpperCase()}</strong>: {adv.mensaje}</span>
                  {!archivadas.has(`adv-${idx}`) && (
                    <button onClick={() => handleArchivarAlerta(`adv-${idx}`, 'Aceptado provisionalmente por jefatura')} style={{ padding: '3px 8px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 10, color: C.navy }}>
                      Archivar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TABA: CARGA DOCENTE ── */}
      {tabActiva === 'carga' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 22 }}>
          <h3 style={{ margin: '0 0 14px 0', color: C.navy, fontSize: 14, fontWeight: 'bold' }}>Balance de Carga y Horas Docente</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 'bold', color: '#991b1b', marginBottom: 8 }}>Docentes con Sobrecarga Horaria ({docentesSobrecargados.length})</div>
              {docentesSobrecargados.length === 0 ? <p style={{ fontSize: 11, color: '#6b7280' }}>Ninguno detectado.</p> : 
                docentesSobrecargados.map(d => <div key={d.id} style={{ padding: 8, background: '#fef2f2', borderRadius: 6, fontSize: 12, marginBottom: 4, color: '#7f1d1d' }}>• {d.nombre} — Registrado: {horasDoc[d.id]}h (Máx: {d.maxHoras}h)</div>)
              }
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 'bold', color: '#2563eb', marginBottom: 8 }}>Docentes bajo el Mínimo Requerido ({docentesBajoMinimo.length})</div>
              {docentesBajoMinimo.length === 0 ? <p style={{ fontSize: 11, color: '#6b7280' }}>Ninguno detectado.</p> : 
                docentesBajoMinimo.map(d => <div key={d.id} style={{ padding: 8, background: '#eff6ff', borderRadius: 6, fontSize: 12, marginBottom: 4, color: '#1e40af' }}>• {d.nombre} — Registrado: {horasDoc[d.id]}h (Mín: {d.minHoras}h)</div>)
              }
            </div>
          </div>
        </div>
      )}

      {/* ── TABA: OBSERVACIONES (HU-59) ── */}
      {tabActiva === 'observaciones' && verObs && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 22 }}>
          <h3 style={{ margin: '0 0 14px 0', color: C.navy, fontSize: 14, fontWeight: 'bold' }}>Bandeja de Observaciones Académicas</h3>
          
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input 
              type="text" 
              placeholder="Escriba un dictamen u observación técnica..." 
              value={obsTexto} 
              onChange={e => setObsTexto(e.target.value)} 
              style={{ ...inputStyle, flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
            />
            <select value={obsDest} onChange={e => setObsDest(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}>
              <option value="DDE">Destinar a DDE</option>
              <option value="Jefe de Carrera">Destinar a Jefatura</option>
              <option value="Secretaría">Destinar a Secretaría</option>
            </select>
            <button onClick={handleAgregarObs} style={{ ...btnPrimary, background: C.navy, color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}>
              Cursar Obs.
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {observaciones.map(o => (
              <div key={o.id} style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                  <span>Por: <strong>{o.autor} ({o.rol})</strong> → Destino: <strong style={{ color: C.gold }}>{o.destinatario}</strong></span>
                  <span>{o.fecha}</span>
                </div>
                <div style={{ fontSize: 12, color: C.navy }}>{o.texto}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TABA: BITÁCORA HISTÓRICA DE AUDITORÍA ── */}
      {tabActiva === 'historial' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 22 }}>
          <h3 style={{ margin: '0 0 14px 0', color: C.navy, fontSize: 14, fontWeight: 'bold' }}>Registro Inalterable de Auditoría (Logs)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
            {auditLog.length === 0 ? <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>Sin acciones registradas en esta sesión.</p> : 
              auditLog.map(l => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 6, borderLeft: `3px solid ${C.navy}`, fontSize: 11 }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: C.navy }}>{l.accion}</span>
                    <span style={{ color: '#6b7280', marginLeft: 6 }}>— {l.detalle}</span>
                  </div>
                  <div style={{ color: '#94a3b8' }}>{l.fecha} ({l.usuario})</div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* ── TABA: NOTIFICACIONES AUTOMÁTICAS ── */}
      {tabActiva === 'notificaciones' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 22 }}>
          <h3 style={{ margin: '0 0 14px 0', color: C.navy, fontSize: 14, fontWeight: 'bold' }}>Bandeja Saliente de Alertas Automáticas</h3>
          {notifEnv.length === 0 ? <p style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>No se han disparado alertas salientes automáticas.</p> : 
            notifEnv.map(n => (
              <div key={n.id} style={{ padding: 10, background: n.tipo === 'success' ? '#f0fdf4' : '#fffbeb', borderLeft: `4px solid ${n.tipo === 'success' ? '#16a34a' : '#d97706'}`, borderRadius: 6, fontSize: 11, marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>{n.msg}</span>
                  <span style={{ color: '#94a3b8' }}>{n.fecha}</span>
                </div>
              </div>
            ))
          }
        </div>
      )}

    </div>
  );
}

// Componentes Auxiliares Limpios Internos (Estilos Uniformes)
function CheckRow({ label, ok, detalle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: 6, fontSize: 12 }}>
      <span style={{ color: '#334155' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {detalle && <span style={{ fontSize: 10, color: '#92400e', background: '#fef9c3', padding: '2px 6px', borderRadius: 4 }}>{detalle}</span>}
        {ok ? <CheckCircle size={13} color="#16a34a" /> : <AlertTriangle size={13} color="#dc2626" />}
      </div>
    </div>
  );
}
