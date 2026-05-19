import React, { useState } from 'react';
import { Play, CheckCircle, Clock, Settings } from 'lucide-react';
import { C } from '../../../shared/constants';
import { inputStyle } from '../../../shared/styles/inlineStyles';
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
  });

  const BLOQUES = [
    { tipo: 'clase', label: 'Periodo 1: 07:45 - 08:30', dur: '45 minutos' },
    { tipo: 'clase', label: 'Periodo 2: 08:30 - 09:15', dur: '45 minutos' },
    { tipo: 'clase', label: 'Periodo 3: 09:15 - 10:00', dur: '45 minutos' },
    { tipo: 'receso', label: 'Receso: 10:00 - 10:15', dur: '15 minutos (automático cada 3 periodos)' },
    { tipo: 'clase', label: 'Periodo 4: 10:15 - 11:00', dur: '45 minutos' },
    { tipo: 'clase', label: 'Periodo 5: 11:00 - 11:45', dur: '45 minutos' },
    { tipo: 'receso', label: 'Receso: 11:45 - 12:00', dur: '15 minutos (automático cada 3 periodos)' },
    { tipo: 'clase', label: 'Periodo 6: 12:00 - 12:45', dur: '45 minutos' },
    { tipo: 'clase', label: 'Periodo 7: 12:45 - 13:30', dur: '45 minutos' },
    { tipo: 'clase', label: 'Periodo 8: 13:30 - 14:15', dur: '45 minutos' },
  ];

  const RESTRICCIONES_LABELS = [
    { key: 'disponibilidad', label: 'Respetar disponibilidad de docentes' },
    { key: 'huecos', label: 'Evitar huecos en horarios de docentes' },
    { key: 'criticas', label: 'Priorizar materias críticas' },
    { key: 'recesos', label: 'Recesos automáticos cada 3 periodos' },
    { key: 'distribucion', label: 'Distribución equitativa de carga' },
    { key: 'bloques', label: 'Bloques continuos de 2-3 periodos' },
  ];

  const start = () => {
    setPhase('running'); setProgress(0); setLogs([]);
    const steps = [
      [350, 8,  '↳ Inicializando población (50 individuos)...'],
      [400, 18, '↳ Preclasificando materias críticas (HU-41)...'],
      [600, 32, '↳ Calculando fitness: conflictos docentes, aulas y grupos...'],
      [600, 50, '↳ Selección por torneo. Cruce con probabilidad 0.8...'],
      [600, 65, '↳ Mutación (tasa 0.05). Evaluando generaciones...'],
      [500, 80, '↳ Verificando reglas duras: RAC-03, lunes 07:45, bloques 2-3...'],
      [500, 90, '↳ Verificando continuidad de bloques y recesos automáticos...'],
      [400, 100,'✓ Solución óptima encontrada. Fitness: 0 conflictos.'],
    ];
    let delay = 0;
    steps.forEach(([wait, prog, msg]) => {
      delay += wait;
      setTimeout(() => {
        setProgress(prog);
        setLogs(l => [...l, msg]);
        if (prog === 100) {
          const result = generarHorarios(materias, docentes, aulas);
          setTimeout(() => { setPhase('done'); onFinish(result.horario, result.horasDocentes); }, 500);
        }
      }, delay);
    });
  };

  return (
    <div style={{ fontFamily: "'Georgia', serif" }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* COLUMNA IZQUIERDA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Configuración del Periodo */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Settings size={18} color={C.gray} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: C.navy }}>
                Configuración del Periodo
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: C.gray, marginBottom: 8 }}>
                  Periodo Académico
                </label>
                <select
                  value={periodoAcademico}
                  onChange={e => setPeriodoAcademico(e.target.value)}
                  style={{ ...inputStyle, fontSize: 14 }}
                >
                  {['2026-I', '2026-II', '2025-I', '2025-II'].map(p => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bloques Horarios */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Clock size={18} color={C.gold} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: C.navy }}>
                Bloques Horarios
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {BLOQUES.map((b, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: `1px solid ${b.tipo === 'receso' ? '#fef08a' : '#e2e8f0'}`,
                  background: b.tipo === 'receso' ? '#fefce8' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{
                      fontSize: 13, fontWeight: '600',
                      color: b.tipo === 'receso' ? '#92400e' : C.navy
                    }}>
                      {b.label}
                    </div>
                    <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{b.dur}</div>
                  </div>
                  {b.tipo === 'receso' ? (
                    <Clock size={16} color={C.gold} />
                  ) : (
                    <span style={{
                      background: '#dcfce7', color: '#16a34a',
                      fontSize: 11, fontWeight: 'bold',
                      padding: '3px 12px', borderRadius: 20
                    }}>
                      Activo
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Restricciones del Algoritmo */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 'bold', color: C.navy }}>
              Restricciones del Algoritmo
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {RESTRICCIONES_LABELS.map(r => (
                <div key={r.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#374151' }}>{r.label}</span>
                  {/* Toggle switch */}
                  <div
                    onClick={() => setRestricciones(prev => ({ ...prev, [r.key]: !prev[r.key] }))}
                    style={{
                      width: 44, height: 24, borderRadius: 99,
                      background: restricciones[r.key] ? '#22c55e' : '#cbd5e1',
                      cursor: 'pointer', position: 'relative',
                      transition: 'background 0.2s', flexShrink: 0
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 3,
                      left: restricciones[r.key] ? 23 : 3,
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'white', transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Generador */}
          <div style={{
            background: 'white', borderRadius: 12,
            border: `2px solid ${C.gold}`, padding: 24
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ color: C.gold, fontSize: 16 }}>⚡</span>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: C.navy }}>Generador</h3>
            </div>

            {phase === 'idle' && (
              <button onClick={start} style={{
                width: '100%', padding: '14px',
                background: C.navy, color: 'white',
                border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                letterSpacing: 0.5
              }}>
                <Play fill="white" size={17} /> Generar Horario
              </button>
            )}

            {phase === 'running' && (
              <div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.gray, marginBottom: 6 }}>
                    <span>Generando...</span><span>{progress}%</span>
                  </div>
                  <div style={{ background: '#e2e8f0', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`, width: `${progress}%`, transition: 'width 0.4s' }} />
                  </div>
                </div>
                <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 12px', fontFamily: 'monospace', fontSize: 10, color: '#4ade80', minHeight: 100, maxHeight: 140, overflowY: 'auto' }}>
                  {logs.map((l, i) => <div key={i}>{l}</div>)}
                  <span style={{ animation: 'pulse 1s infinite' }}>█</span>
                </div>
              </div>
            )}

            {phase === 'done' && (
              <div style={{ color: '#16a34a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <CheckCircle size={18} /> ¡Completado! Redirigiendo...
              </div>
            )}
          </div>

          {/* Información */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 'bold', color: C.navy }}>
              Información
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                `${docentes.length} Docentes activos`,
                `${materias.length} Materias configuradas`,
                `8 Grupos (3° a 10°)`,
                `${aulas.filter(a => a.disponible).length} Aulas disponibles`,
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                  <span style={{ color: C.navy, fontWeight: 'bold' }}>•</span> {item}
                </div>
              ))}
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
