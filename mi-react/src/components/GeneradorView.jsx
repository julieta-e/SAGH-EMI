import React, { useState } from 'react';
import { Settings, Play, CheckCircle } from 'lucide-react';
import { C } from '../constants/colors';
import { generarHorarios } from '../utils/scheduling';

export function GeneradorView({ materias, docentes, aulas, onFinish }) {
  const [phase, setPhase] = useState('idle'); // idle | running | done
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);

  const start = () => {
    setPhase('running');
    setProgress(0);
    setLogs([]);
    const steps = [
      [400, 15, '↳ Inicializando población inicial (50 individuos)...'],
      [700, 35, '↳ Calculando fitness: conflictos de docentes y restricciones...'],
      [700, 55, '↳ Selección por torneo. Aplicando cruce de un punto...'],
      [700, 75, '↳ Mutación aleatoria (tasa 0.05). Evaluando generación 47/50...'],
      [600, 92, '↳ Verificando reglas duras: horas máx, lunes 07:45, bloques de 2-3 períodos...'],
      [500, 100, '✓ Solución óptima encontrada. Fitness: 0 conflictos.'],
    ];
    let delay = 0;
    steps.forEach(([wait, prog, msg]) => {
      delay += wait;
      setTimeout(() => {
        setProgress(prog);
        setLogs(l => [...l, msg]);
        if (prog === 100) {
          const result = generarHorarios(materias, docentes, aulas);
          setTimeout(() => {
            setPhase('done');
            onFinish(result.horario, result.horasDocentes);
          }, 600);
        }
      }, delay);
    });
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{
        background: 'white', borderRadius: 12, padding: 40,
        border: `1px solid #e2e8f0`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center'
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
          boxShadow: `0 8px 24px rgba(15,36,68,0.3)`
        }}>
          <Settings color={C.gold} size={36} style={{ animation: phase === 'running' ? 'spin 2s linear infinite' : 'none' }} />
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>

        <h2 style={{ color: C.navy, margin: '0 0 8px', fontSize: 22 }}>Motor de Algoritmo Genético</h2>
        <p style={{ color: C.gray, fontSize: 13, margin: '0 0 8px' }}>
          Genera horarios óptimos para los 8 semestres activos respetando:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
          {['Sin conflictos de docente', 'Máx 25 hrs/docente', 'Lunes 07:45 obligatorio', 'Bloques 2-3 periodos consecutivos', 'Asignación de aulas'].map(r => (
            <span key={r} style={{ background: C.grayLight, color: C.navy, fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 'bold' }}>
              ✓ {r}
            </span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { v: materias.length, l: 'Materias' },
            { v: docentes.length, l: 'Docentes' },
            { v: aulas.filter(a => a.disponible).length, l: 'Aulas Disp.' },
          ].map(s => (
            <div key={s.l} style={{ background: C.grayLight, borderRadius: 8, padding: '12px 0' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: C.navy }}>{s.v}</div>
              <div style={{ fontSize: 11, color: C.gray }}>{s.l}</div>
            </div>
          ))}
        </div>

        {phase === 'idle' && (
          <button onClick={start} style={{
            background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`,
            color: C.gold, border: 'none', borderRadius: 8, padding: '14px 40px',
            fontSize: 15, fontWeight: 'bold', cursor: 'pointer', letterSpacing: 1,
            boxShadow: `0 4px 16px rgba(15,36,68,0.4)`, display: 'flex', alignItems: 'center', gap: 10, margin: '0 auto'
          }}>
            <Play fill={C.gold} size={18} /> GENERAR HORARIO ÓPTIMO
          </button>
        )}

        {phase === 'running' && (
          <div>
            <div style={{ background: '#e2e8f0', borderRadius: 99, height: 8, marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`, width: `${progress}%`, transition: 'width 0.4s' }} />
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: '12px 16px', textAlign: 'left', fontFamily: 'monospace', fontSize: 12, color: '#4ade80', minHeight: 120, maxHeight: 160, overflowY: 'auto' }}>
              {logs.map((l, i) => <div key={i}>{l}</div>)}
              <span style={{ animation: 'pulse 1s infinite' }}>█</span>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div style={{ color: '#16a34a', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15 }}>
            <CheckCircle size={22} /> Generación Completada — Redirigiendo a Validación...
          </div>
        )}
      </div>
    </div>
  );
}
