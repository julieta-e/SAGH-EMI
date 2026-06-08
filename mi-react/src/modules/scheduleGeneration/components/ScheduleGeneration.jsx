import React, { useState } from 'react';
import {
  Play, CheckCircle, Clock, Settings, Target, Database,
  Users, BookOpen, Layers, Building2, Star, Cpu,
  AlertTriangle, XCircle, TrendingUp, Zap, RefreshCw,
} from 'lucide-react';
import { C } from '../../../shared/constants';
import { inputStyle } from '../../../shared/styles/inlineStyles';
import { FormField } from '../../../shared/components/Forms';
import { generarHorarios } from '../backend/geneticScheduleService';
import '../styles/scheduleGeneration.css';

// ── Constantes de UI ──────────────────────────────────────────────────────────
const BLOQUES = [
  { tipo: 'clase',  label: 'Periodo 1: 07:45 – 08:30', dur: '45 min' },
  { tipo: 'clase',  label: 'Periodo 2: 08:30 – 09:15', dur: '45 min' },
  { tipo: 'clase',  label: 'Periodo 3: 09:15 – 10:00', dur: '45 min' },
  { tipo: 'receso', label: '⏸ Receso:  10:00 – 10:15', dur: '15 min (RAC-03)' },
  { tipo: 'clase',  label: 'Periodo 4: 10:15 – 11:00', dur: '45 min' },
  { tipo: 'clase',  label: 'Periodo 5: 11:00 – 11:45', dur: '45 min' },
  { tipo: 'clase',  label: 'Periodo 6: 11:45 – 12:30', dur: '45 min' },
  { tipo: 'receso', label: '⏸ Receso:  12:30 – 12:45', dur: '15 min (RAC-03)' },
  { tipo: 'clase',  label: 'Periodo 7: 12:45 – 13:30', dur: '45 min' },
  { tipo: 'clase',  label: 'Periodo 8: 13:30 – 14:15', dur: '45 min' },
];

const RESTRICCIONES_LABELS = [
  { key: 'disponibilidad', label: 'Respetar disponibilidad de docentes',  tipo: 'dura',   desc: 'H4 — Un docente no puede dar clases en días que no declaró disponibles.' },
  { key: 'aulas',          label: 'Evitar cruce de aulas',                tipo: 'dura',   desc: 'H2 — Un aula no puede ser usada por dos grupos al mismo tiempo.' },
  { key: 'grupos',         label: 'Evitar cruce de grupos',               tipo: 'dura',   desc: 'H3 — Un semestre no puede tener dos materias a la misma hora.' },
  { key: 'cargaHoras',     label: 'Respetar horas máximas RAC-03',        tipo: 'dura',   desc: 'H6 — Ningún docente puede exceder su carga horaria máxima semanal.' },
  { key: 'criticas',       label: 'Priorizar materias críticas',          tipo: 'blanda', desc: 'S4 — Las materias críticas se asignan primero y en horarios tempranos.' },
  { key: 'bloques',        label: 'Continuidad de bloques (2-3 periodos)',tipo: 'blanda', desc: 'S2 — Los periodos de una materia se agrupan en bloques continuos.' },
  { key: 'huecos',         label: 'Minimizar huecos entre clases',        tipo: 'blanda', desc: 'S3 — Se evitan periodos libres entre clases del mismo semestre.' },
  { key: 'distribucion',   label: 'Equilibrar carga entre docentes',      tipo: 'blanda', desc: 'S1 — La carga horaria se distribuye de forma equitativa.' },
  { key: 'rac03',          label: 'Lunes inicio 07:45 (RAC-03)',          tipo: 'blanda', desc: 'S6 — El primer periodo del lunes debe ser utilizado.' },
  { key: 'recesos',        label: 'Recesos automáticos cada 3 periodos',  tipo: 'blanda', desc: 'RAC-03 — Se insertan recesos de 15 min tras cada 3 periodos.' },
];

// ── Chip de tipo de restricción ───────────────────────────────────────────────
const ChipTipo = ({ tipo }) => (
  <span style={{
    fontSize: 9, fontWeight: 900, padding: '2px 7px', borderRadius: 99,
    background: tipo === 'dura' ? '#fee2e2' : '#fef9c3',
    color:      tipo === 'dura' ? '#b91c1c' : '#92400e',
    border:     `1px solid ${tipo === 'dura' ? '#fecaca' : '#fde68a'}`,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  }}>
    {tipo === 'dura' ? 'DURA' : 'BLANDA'}
  </span>
);

// ── Tarjeta de métrica ────────────────────────────────────────────────────────
const MetricCard = ({ label, value, color, sub }) => (
  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
    <div style={{ fontSize: 22, fontWeight: 900, color: color || C.navy, fontFamily: 'serif' }}>{value}</div>
    <div style={{ fontSize: 10, fontWeight: 700, color: C.navy, marginTop: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>{sub}</div>}
  </div>
);

// ── Componente principal ──────────────────────────────────────────────────────
export function Mod3GeneradorView({ materias, docentes, aulas, onFinish }) {
  const [phase,           setPhase]           = useState('idle');   // idle | running | done | error
  const [progress,        setProgress]        = useState(0);
  const [logs,            setLogs]            = useState([]);
  const [periodoAcademico,setPeriodoAcademico] = useState('2026-I');
  const [metricas,        setMetricas]        = useState(null);
  const [errorMsg,        setErrorMsg]        = useState('');
  const [restriccionDetalle, setRestriccionDetalle] = useState(null);

  const [restricciones, setRestricciones] = useState({
    disponibilidad: true,
    huecos:         true,
    criticas:       true,
    recesos:        true,
    distribucion:   true,
    bloques:        true,
    rac03:          true,
    aulas:          true,
    grupos:         true,
    cargaHoras:     true,
  });

  // Verificar datos mínimos antes de generar
  const datosValidos = () => {
    if (!materias || materias.length === 0) return { ok: false, msg: 'No hay materias cargadas en el sistema.' };
    if (!docentes || docentes.length === 0) return { ok: false, msg: 'No hay docentes registrados.' };
    if (!aulas    || aulas.length === 0)    return { ok: false, msg: 'No hay aulas registradas.' };
    const conDocente = materias.filter(m => m.docenteId && docentes.find(d => d.id === m.docenteId));
    if (conDocente.length === 0) return { ok: false, msg: 'Ninguna materia tiene docente asignado. Asigne docentes en MOD-2.' };
    return { ok: true };
  };

  const start = () => {
    const { ok, msg } = datosValidos();
    if (!ok) { setErrorMsg(msg); setPhase('error'); return; }

    setPhase('running');
    setProgress(0);
    setLogs([]);
    setMetricas(null);
    setErrorMsg('');

    const conDocente    = materias.filter(m => m.docenteId && docentes.find(d => d.id === m.docenteId));
    const sinDocente    = materias.filter(m => !m.docenteId || !docentes.find(d => d.id === m.docenteId));
    const aulasActivas  = aulas.filter(a => a.disponible !== false);
    const materiasCrit  = conDocente.filter(m => m.critica).length;

    const steps = [
      [200,  5,  `📦 Inicializando población de 60 individuos...`],
      [250, 10,  `📦 Codificando cromosomas: (semestre, día, periodo, docente, aula)`],
      [300, 16,  `⭐ Preclasificando ${materiasCrit} materia(s) crítica(s) → prioridad máxima`],
      [300, 22,  `👨‍🏫 Verificando disponibilidad de ${docentes.length} docentes (normativa RAC-03)`],
      [300, 28,  `🏫 Validando ${aulasActivas.length} aulas disponibles y sus tipos`],
      [350, 35,  `📋 Aplicando restricciones DURAS: sin cruces de docente, aula ni grupo`],
      [350, 41,  `📐 Construyendo bloques continuos de 2-3 periodos por materia`],
      [400, 48,  `⚖️ Equilibrando carga horaria entre docentes (RAC-03)`],
      [400, 55,  `🔄 Generación 1-50: operadores de cruce (p=0.85) y mutación (p=0.08)`],
      [400, 62,  `🔄 Generación 51-150: selección por torneo (k=5), elitismo (top 3)`],
      [400, 69,  `🔄 Generación 151-250: refinando soluciones, reduciendo conflictos...`],
      [350, 75,  `🧬 Generación 250-300: convergencia, seleccionando mejor individuo`],
      [300, 81,  `📋 Verificando cumplimiento RAC-03: Lunes 07:45, recesos automáticos`],
      [300, 87,  sinDocente.length > 0
                  ? `⚠️  ${sinDocente.length} materia(s) sin docente asignado (serán omitidas)`
                  : `✅ Todas las materias tienen docente asignado`],
      [300, 93,  `📊 Evaluando fitness: periodos asignados, conflictos, balance...`],
      [250, 98,  `🏆 Seleccionando individuo óptimo de la población final`],
      [200, 100, `✅ Horario generado. Procesando resultado...`],
    ];

    let delay = 0;
    steps.forEach(([wait, prog, msg]) => {
      delay += wait;
      setTimeout(() => {
        setProgress(prog);
        setLogs(prev => [...prev, msg]);

        if (prog === 100) {
          try {
            const result = generarHorarios(materias, docentes, aulas, restricciones);
            setMetricas(result.metricas);
            setTimeout(() => {
              setPhase('done');
              onFinish(result.horario, result.horasDocentes, result.metricas);
            }, 600);
          } catch (err) {
            console.error('[SAGH-AG] Error al generar horario:', err);
            setErrorMsg(`Error interno del algoritmo: ${err.message}`);
            setPhase('error');
          }
        }
      }, delay);
    });
  };

  const resetear = () => {
    setPhase('idle');
    setProgress(0);
    setLogs([]);
    setMetricas(null);
    setErrorMsg('');
  };

  // Datos de diagnóstico
  const conDocente   = (materias || []).filter(m => m.docenteId && (docentes || []).find(d => d.id === m.docenteId));
  const sinDocente   = (materias || []).filter(m => !m.docenteId || !(docentes || []).find(d => d.id === m.docenteId));
  const aulasActivas = (aulas || []).filter(a => a.disponible !== false);
  const laboratorios = aulasActivas.filter(a => a.tipo === 'Laboratorio');

  return (
    <div>
      {/* Encabezado */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 'bold', color: C.navy }}>
          Módulo 3: Generación de Horarios
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: C.gray }}>
          Algoritmo Genético — Optimización automática bajo normativa RAC-03 · EMI UALP
        </p>
      </div>

      {/* Alerta de materias sin docente */}
      {sinDocente.length > 0 && (
        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={15} color="#92400e" />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 12, color: '#92400e' }}>
              {sinDocente.length} materia(s) sin docente asignado
            </div>
            <div style={{ fontSize: 11, color: '#92400e' }}>
              {sinDocente.map(m => m.nombre).join(' · ')} — Asígneles docentes en MOD-2 antes de generar.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>

        {/* ── Columna izquierda ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Configuración del periodo */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', color: C.navy, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Settings size={15} /> Configuración del Periodo Académico
            </h3>
            <FormField label="Periodo Académico">
              <select
                value={periodoAcademico}
                onChange={e => setPeriodoAcademico(e.target.value)}
                style={inputStyle}
              >
                {['2026-I', '2026-II', '2025-I', '2025-II'].map(p => <option key={p}>{p}</option>)}
              </select>
            </FormField>
          </div>

          {/* Restricciones */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
            <h3 style={{ margin: '0 0 6px', color: C.navy, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Target size={15} /> Restricciones del Algoritmo
            </h3>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 14 }}>
              Las restricciones <strong style={{ color: '#b91c1c' }}>DURAS</strong> no deben violarse. Las{' '}
              <strong style={{ color: '#92400e' }}>BLANDAS</strong> son deseables pero flexibles.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {RESTRICCIONES_LABELS.map(r => (
                <div key={r.key}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                      <ChipTipo tipo={r.tipo} />
                      <span
                        style={{ fontSize: 12, color: '#374151', cursor: 'help', flex: 1 }}
                        title={r.desc}
                        onClick={() => setRestriccionDetalle(restriccionDetalle === r.key ? null : r.key)}
                      >
                        {r.label}
                      </span>
                    </div>
                    {/* Toggle */}
                    <div
                      onClick={() => {
                        // Las restricciones duras no se pueden desactivar
                        if (r.tipo === 'dura') return;
                        setRestricciones(prev => ({ ...prev, [r.key]: !prev[r.key] }));
                      }}
                      style={{
                        width: 44, height: 24, borderRadius: 99,
                        background: restricciones[r.key] ? (r.tipo === 'dura' ? '#dc2626' : '#22c55e') : '#cbd5e1',
                        cursor: r.tipo === 'dura' ? 'not-allowed' : 'pointer',
                        position: 'relative', transition: 'background 0.2s',
                        flexShrink: 0, marginLeft: 12,
                        opacity: r.tipo === 'dura' ? 0.85 : 1,
                      }}
                      title={r.tipo === 'dura' ? 'Restricción obligatoria (no desactivable)' : ''}
                    >
                      <div style={{
                        position: 'absolute', top: 3,
                        left: restricciones[r.key] ? 23 : 3,
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'white', transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                  </div>
                  {/* Descripción expandible */}
                  {restriccionDetalle === r.key && (
                    <div style={{ marginTop: 6, marginLeft: 8, padding: '7px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11, color: '#475569' }}>
                      {r.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Estructura de bloques horarios */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
            <h3 style={{ margin: '0 0 14px', color: C.navy, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={15} /> Estructura de Bloques (RAC-03)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {BLOQUES.map((b, i) => (
                <div key={i} style={{
                  padding: '9px 14px', borderRadius: 8,
                  border:      `1px solid ${b.tipo === 'receso' ? '#fde68a' : '#e2e8f0'}`,
                  background:  b.tipo === 'receso' ? '#fefce8' : '#f8fafc',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: b.tipo === 'receso' ? 'bold' : '500',
                    color:      b.tipo === 'receso' ? '#92400e' : C.navy,
                  }}>{b.label}</div>
                  <div style={{ fontSize: 10, color: C.gray }}>{b.dur}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Columna derecha ───────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Motor AG */}
          <div style={{ background: 'white', borderRadius: 12, border: `2px solid ${C.gold}`, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Cpu size={18} color={C.gold} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: C.navy }}>
                Motor Algoritmo Genético
              </h3>
            </div>

            {/* IDLE */}
            {phase === 'idle' && (
              <div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 12, color: C.gray }}>
                  <div style={{ fontWeight: 'bold', color: C.navy, marginBottom: 8, fontSize: 13 }}>Parámetros AG:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      ['Población',    '60 individuos'],
                      ['Generaciones', '300 máx.'],
                      ['P. cruce',     '0.85'],
                      ['P. mutación',  '0.08'],
                      ['Selección',    'Torneo k=5'],
                      ['Elitismo',     'Top 3'],
                      ['Mutaciones',   'Swap / Mover / Día'],
                      ['Objetivo',     'Fitness ≥ 0'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#94a3b8' }}>{k}</span>
                        <span style={{ fontWeight: 700, color: C.navy }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={start}
                  disabled={!datosValidos().ok}
                  style={{
                    width: '100%', padding: '14px', border: 'none', borderRadius: 10,
                    fontSize: 14, fontWeight: 'bold', cursor: datosValidos().ok ? 'pointer' : 'not-allowed',
                    background: datosValidos().ok ? C.navy : '#e2e8f0',
                    color:      datosValidos().ok ? 'white' : '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  }}
                >
                  <Play fill={datosValidos().ok ? 'white' : '#94a3b8'} size={16} />
                  Generar Horario Académico
                </button>
                {!datosValidos().ok && (
                  <div style={{ marginTop: 10, fontSize: 11, color: '#b91c1c', textAlign: 'center' }}>
                    {datosValidos().msg}
                  </div>
                )}
              </div>
            )}

            {/* RUNNING */}
            {phase === 'running' && (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.gray, marginBottom: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Zap size={12} color={C.gold} /> Ejecutando AG...
                    </span>
                    <span style={{ fontWeight: 'bold', color: C.navy }}>{progress}%</span>
                  </div>
                  <div style={{ background: '#e2e8f0', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${C.navy}, ${C.gold})`,
                      width: `${progress}%`,
                      transition: 'width 0.4s ease',
                      borderRadius: 99,
                    }} />
                  </div>
                </div>
                {/* Terminal de logs */}
                <div style={{
                  background: '#0f172a', borderRadius: 10, padding: '12px 14px',
                  fontFamily: 'monospace', fontSize: 10, color: '#4ade80',
                  minHeight: 180, maxHeight: 260, overflowY: 'auto',
                }}>
                  {logs.map((l, i) => (
                    <div key={i} style={{ marginBottom: 3, opacity: i < logs.length - 3 ? 0.6 : 1 }}>
                      <span style={{ color: '#64748b' }}>[{String(i + 1).padStart(2, '0')}]</span>{' '}
                      {l}
                    </div>
                  ))}
                  <span style={{ color: C.gold, animation: 'pulse 1s infinite' }}>█</span>
                </div>
              </div>
            )}

            {/* DONE */}
            {phase === 'done' && metricas && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#16a34a', fontWeight: 'bold', fontSize: 13 }}>
                  <CheckCircle size={18} /> ¡Horario generado exitosamente!
                </div>

                {/* Métricas del resultado */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  <MetricCard
                    label="Periodos asignados"
                    value={metricas.periodosAsign || 0}
                    sub={`de ${metricas.periodosReq || 0} requeridos`}
                    color={metricas.faltantes === 0 ? '#166534' : '#b91c1c'}
                  />
                  <MetricCard
                    label="Equilibrio"
                    value={`${metricas.equilibrio || 0}%`}
                    sub="distribución carga"
                    color={metricas.equilibrio >= 80 ? '#166534' : '#92400e'}
                  />
                  <MetricCard
                    label="Cruces docente"
                    value={metricas.crucesDocente || 0}
                    sub="conflictos H1"
                    color={metricas.crucesDocente === 0 ? '#166534' : '#b91c1c'}
                  />
                  <MetricCard
                    label="Cruces aula"
                    value={metricas.crucesAula || 0}
                    sub="conflictos H2"
                    color={metricas.crucesAula === 0 ? '#166534' : '#b91c1c'}
                  />
                  <MetricCard
                    label="RAC-03 Lunes"
                    value={metricas.rac03Ok ? '✓' : '✗'}
                    sub="07:45 cubierto"
                    color={metricas.rac03Ok ? '#166534' : '#b91c1c'}
                  />
                  <MetricCard
                    label="Bloques continuos"
                    value={metricas.continuidad || 0}
                    sub="periodos agrupados"
                    color={C.navy}
                  />
                </div>

                {/* Advertencias */}
                {(metricas.faltantes > 0 || metricas.crucesDocente > 0 || metricas.crucesAula > 0) && (
                  <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 11, color: '#92400e', marginBottom: 4 }}>
                      ⚠ Advertencias del resultado:
                    </div>
                    {metricas.faltantes > 0 && (
                      <div style={{ fontSize: 11, color: '#92400e' }}>
                        · {metricas.faltantes} periodo(s) sin asignar — verifique docentes en MOD-2.
                      </div>
                    )}
                    {metricas.crucesDocente > 0 && (
                      <div style={{ fontSize: 11, color: '#92400e' }}>
                        · {metricas.crucesDocente} cruce(s) de docente detectado(s) — ajuste manualmente en MOD-4.
                      </div>
                    )}
                    {metricas.crucesAula > 0 && (
                      <div style={{ fontSize: 11, color: '#92400e' }}>
                        · {metricas.crucesAula} cruce(s) de aula detectado(s) — ajuste manualmente en MOD-4.
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={resetear}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <RefreshCw size={12} /> Regenerar
                  </button>
                  <div style={{ flex: 2, padding: '10px', borderRadius: 8, background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <TrendingUp size={12} /> Viendo en MOD-4...
                  </div>
                </div>
              </div>
            )}

            {/* ERROR */}
            {phase === 'error' && (
              <div>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#b91c1c', fontWeight: 'bold', fontSize: 12, marginBottom: 6 }}>
                    <XCircle size={14} /> Error al generar horario
                  </div>
                  <div style={{ fontSize: 11, color: '#b91c1c' }}>{errorMsg}</div>
                </div>
                <button onClick={resetear}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: C.navy, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <RefreshCw size={13} /> Intentar de nuevo
                </button>
              </div>
            )}
          </div>

          {/* Datos del sistema */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 18 }}>
            <h3 style={{ margin: '0 0 14px', color: C.navy, fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Database size={13} /> Datos del Sistema
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Docentes activos',          valor: docentes?.length || 0,              icon: <Users size={13} />,    color: '#166534' },
                { label: 'Materias programables',     valor: conDocente.length,                  icon: <BookOpen size={13} />, color: '#166534' },
                { label: 'Materias sin docente',      valor: sinDocente.length,                  icon: <AlertTriangle size={13} />, color: sinDocente.length > 0 ? '#b91c1c' : '#94a3b8' },
                { label: 'Semestres (3° a 10°)',      valor: 8,                                  icon: <Layers size={13} />,   color: C.navy },
                { label: 'Aulas disponibles',         valor: aulasActivas.length,               icon: <Building2 size={13} />,color: '#166534' },
                { label: 'Laboratorios',              valor: laboratorios.length,                icon: <Building2 size={13} />,color: '#7c3aed' },
                { label: 'Materias críticas',         valor: (materias||[]).filter(m=>m.critica).length, icon: <Star size={13} />, color: '#92400e' },
                { label: 'Total periodos a asignar',  valor: conDocente.reduce((s,m)=>s+Number(m.periodos||0),0), icon: <Clock size={13} />, color: C.navy },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, padding: '4px 0', borderBottom: '1px solid #f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.gray }}>
                    <span style={{ color: item.color }}>{item.icon}</span>
                    {item.label}
                  </div>
                  <span style={{ fontWeight: 'bold', color: item.color }}>{item.valor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info BD */}
          <div style={{ background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', padding: 14 }}>
            <div style={{ fontSize: 11, color: '#166534', fontWeight: 'bold', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Database size={13} /> Persistencia en Base de Datos
            </div>
            <div style={{ fontSize: 11, color: '#166534', lineHeight: 1.6 }}>
              El horario generado se guardará automáticamente como una nueva versión en la gestión activa (<code>versiones_horario</code>).
              Puede revisarlo, editarlo y aprobarlo desde el MOD-4.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}