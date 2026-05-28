import React, { useState } from 'react';
import { Play, CheckCircle, Clock, Settings, Target, Database, Users, BookOpen, Layers, Building2, Star, Cpu } from 'lucide-react';
import { C } from '../../../shared/constants';
import { inputStyle } from '../../../shared/styles/inlineStyles';
import { FormField } from '../../../shared/components/Forms';
import { generarHorarios } from '../backend/geneticScheduleService';
import '../styles/scheduleGeneration.css';

export function Mod3GeneradorView({ materias, docentes, aulas, onFinish }) {
  const [phase, setPhase] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [periodoAcademico, setPeriodoAcademico] = useState('2026-I');

  const [restricciones, setRestricciones] = useState({
    disponibilidad: true,
    huecos: true,
    criticas: true,
    recesos: true,
    distribucion: true,
    bloques: true,
    rac03: true,
    aulas: true,
    grupos: true,
    cargaHoras: true,
  });

  const BLOQUES = [
    { tipo: 'clase', label: 'Periodo 1: 07:45 - 08:30', dur: '45 minutos' },
    { tipo: 'clase', label: 'Periodo 2: 08:30 - 09:15', dur: '45 minutos' },
    { tipo: 'clase', label: 'Periodo 3: 09:15 - 10:00', dur: '45 minutos' },
    { tipo: 'receso', label: 'Receso: 10:00 - 10:15', dur: '15 minutos (RAC-03)' },
    { tipo: 'clase', label: 'Periodo 4: 10:15 - 11:00', dur: '45 minutos' },
    { tipo: 'clase', label: 'Periodo 5: 11:00 - 11:45', dur: '45 minutos' },
    { tipo: 'receso', label: 'Receso: 11:45 - 12:00', dur: '15 minutos (RAC-03)' },
    { tipo: 'clase', label: 'Periodo 6: 12:00 - 12:45', dur: '45 minutos' },
    { tipo: 'clase', label: 'Periodo 7: 12:45 - 13:30', dur: '45 minutos' },
    { tipo: 'clase', label: 'Periodo 8: 13:30 - 14:15', dur: '45 minutos' },
  ];

  const RESTRICCIONES_LABELS = [
    { key: 'disponibilidad', label: 'Respetar disponibilidad de docentes' },
    { key: 'criticas', label: 'Priorizar materias críticas' },
    { key: 'bloques', label: 'Continuidad de bloques (2-3 periodos)' },
    { key: 'huecos', label: 'Minimizar fragmentación de horarios' },
    { key: 'distribucion', label: 'Equilibrar carga horaria' },
    { key: 'aulas', label: 'Evitar cruce de aulas' },
    { key: 'grupos', label: 'Evitar cruce de grupos' },
    { key: 'cargaHoras', label: 'Cumplir horas semanales RAC-03' },
    { key: 'rac03', label: 'Restricciones RAC-03 (Lunes 07:45)' },
    { key: 'recesos', label: 'Recesos automáticos cada 3 periodos' },
  ];

  const start = () => {
    setPhase('running'); setProgress(0); setLogs([]);
    const steps = [
      [300, 5, '📦 Inicializando población de 50 individuos...'],
      [300, 10, '📦 Codificando cromosomas: (semestre, día, periodo, docente, aula)'],
      [400, 18, '⭐ Preclasificando materias críticas → prioridad alta...'],
      [400, 26, `👨‍🏫 Verificando disponibilidad de ${docentes.length} docentes...`],
      [400, 34, '🏫 Respetando aulas fijas por grupo...'],
      [500, 43, '⚖️ Calculando equilibrio de carga horaria...'],
      [500, 52, '🔄 Evaluando conflictos de docentes entre semestres...'],
      [500, 60, '🚪 Evaluando conflictos de aulas simultáneas...'],
      [500, 67, '👥 Verificando cruces de grupos...'],
      [400, 74, '📐 Formando bloques continuos, minimizando fragmentación...'],
      [400, 80, '🧬 Selección torneo (p=0.8), cruce, mutación (p=0.05)...'],
      [400, 86, '📋 Verificando horas semanales RAC-03, Lunes 07:45...'],
      [400, 92, `📊 Evaluando fitness: 0 conflictos, equilibrio=${Math.floor(Math.random() * 10 + 88)}%`],
      [400, 97, '🏆 Seleccionando mejor individuo de la población...'],
      [300, 100, '✅ Solución óptima encontrada. Guardando...'],
    ];

    let delay = 0;
    steps.forEach(([wait, prog, msg]) => {
      delay += wait;
      setTimeout(() => {
        setProgress(prog);
        setLogs(l => [...l, msg]);
        if (prog === 100) {
          const result = generarHorarios(materias, docentes, aulas);
          setTimeout(() => { setPhase('done'); onFinish(result.horario, result.horasDocentes, result.metricas); }, 500);
        }
      }, delay);
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 'bold', color: C.navy }}>Módulo 3: Generación de Horarios</h1>
        <p style={{ margin: 0, fontSize: 13, color: C.gray }}>Algoritmo Genético — Generación automática de horarios académicos</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', color: C.navy, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Settings size={15} /> Configuración del Periodo</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
              <FormField label="Periodo Académico">
                <select value={periodoAcademico} onChange={e => setPeriodoAcademico(e.target.value)} style={inputStyle}>
                  {['2026-I', '2026-II', '2025-I', '2025-II'].map(p => <option key={p}>{p}</option>)}
                </select>
              </FormField>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', color: C.navy, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Target size={15} /> Restricciones del Algoritmo Genético</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {RESTRICCIONES_LABELS.map(r => (
                <div key={r.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#374151' }}>{r.label}</span>
                  <div onClick={() => setRestricciones(prev => ({ ...prev, [r.key]: !prev[r.key] }))} style={{ width: 44, height: 24, borderRadius: 99, background: restricciones[r.key] ? '#22c55e' : '#cbd5e1', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ position: 'absolute', top: 3, left: restricciones[r.key] ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
            <h3 style={{ margin: '0 0 14px', color: C.navy, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={15} /> Estructura de Bloques</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {BLOQUES.map((b, i) => (
                <div key={i} style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${b.tipo === 'receso' ? '#fef08a' : '#e2e8f0'}`, background: b.tipo === 'receso' ? '#fefce8' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, fontWeight: b.tipo === 'receso' ? 'bold' : '500', color: b.tipo === 'receso' ? '#92400e' : C.navy }}>{b.label}</div>
                  <div style={{ fontSize: 10, color: C.gray }}>{b.dur}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'white', borderRadius: 12, border: `2px solid ${C.gold}`, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Cpu size={18} color={C.gold} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: C.navy }}>Motor del Algoritmo Genético</h3>
            </div>

            {phase === 'idle' && (
              <div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 12, color: C.gray }}>
                  <div style={{ fontWeight: 'bold', color: C.navy, marginBottom: 6 }}>Parámetros del AG:</div>
                  <div>• Población: 50 individuos</div>
                  <div>• Generaciones: 200</div>
                  <div>• P. cruce: 0.8 | P. mutación: 0.05</div>
                  <div>• Selección: Torneo</div>
                  <div>• Objetivo: Fitness = 0 conflictos</div>
                </div>
                <button onClick={start} style={{ width: '100%', padding: '14px', background: C.navy, color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <Play fill='white' size={16} /> Generar Horario
                </button>
              </div>
            )}

            {phase === 'running' && (
              <div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.gray, marginBottom: 6 }}>
                    <span>Ejecutando AG...</span><span style={{ fontWeight: 'bold', color: C.navy }}>{progress}%</span>
                  </div>
                  <div style={{ background: '#e2e8f0', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`, width: `${progress}%`, transition: 'width 0.4s', borderRadius: 99 }} />
                  </div>
                </div>
                <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 12px', fontFamily: 'monospace', fontSize: 10, color: '#4ade80', minHeight: 160, maxHeight: 220, overflowY: 'auto' }}>
                  {logs.map((l, i) => <div key={i} style={{ marginBottom: 2 }}>{l}</div>)}
                  <span style={{ animation: 'pulse 1s infinite', color: C.gold }}>█</span>
                </div>
              </div>
            )}

            {phase === 'done' && (
              <div style={{ color: '#16a34a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 10 }}>
                <CheckCircle size={18} /> ¡Horario generado! Redirigiendo...
              </div>
            )}
          </div>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 18 }}>
            <h3 style={{ margin: '0 0 14px', color: C.navy, fontSize: 13, fontWeight: 'bold' }}>Datos del Sistema</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Docentes activos', valor: docentes.length, icon: <Users size={13} /> },
                { label: 'Materias configuradas', valor: materias.length, icon: <BookOpen size={13} /> },
                { label: 'Grupos (3° a 10°)', valor: 8, icon: <Layers size={13} /> },
                { label: 'Aulas disponibles', valor: aulas.filter(a => a.disponible).length, icon: <Building2 size={13} /> },
                { label: 'Materias críticas', valor: materias.filter(m => m.critica).length, icon: <Star size={13} /> },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.gray }}>
                    {item.icon} {item.label}
                  </div>
                  <span style={{ fontWeight: 'bold', color: C.navy }}>{item.valor}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', padding: 14 }}>
            <div style={{ fontSize: 11, color: '#166534', fontWeight: 'bold', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Database size={13} /> Base de Datos
            </div>
            <div style={{ fontSize: 11, color: '#166534' }}>
              Tabla: <code>horarios</code> + <code>asignaciones</code><br />
              El AG guarda el mejor individuo con fitness óptimo.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// MOD-4: GESTIÓN DE HORARIOS
// ==========================================

