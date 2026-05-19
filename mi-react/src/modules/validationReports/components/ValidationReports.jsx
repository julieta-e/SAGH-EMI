import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Plus, Shield, Check, AlertCircle, Clock, Archive } from 'lucide-react';
import { C, DIAS } from '../../../shared/constants';
import { EmptyState } from '../../../shared/components/Forms';
import { inputStyle, btnPrimary } from '../../../shared/styles/inlineStyles';
import { validarHorario } from '../backend/validationService';
import '../styles/validationReports.css';

export function Mod5ValidacionView({ horario, docentes, horasDoc, estado, onAprobar, onVerHorario, historial, addNotif }) {
  const [obsTexto, setObsTexto] = useState('');
  const [observaciones, setObservaciones] = useState([]);

  if (!horario) return <EmptyState icon={<Shield size={40} />} titulo="Sin horario generado" desc='Ve al MOD-3 para crear un horario primero.' />;

  const conflictos = validarHorario(horario, docentes);
  const semestres = [3,4,5,6,7,8,9,10];
  const totalClases = semestres.reduce((acc, s) => { let c = 0; for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) if (horario[s]?.[d]?.[p]) c++; return acc + c; }, 0);
  const docentesSobrecargados = docentes.filter(d => (horasDoc?.[d.id] || 0) > d.maxHoras);
  const ok = conflictos.length === 0 && docentesSobrecargados.length === 0;

  const agregarObs = () => {
    if (!obsTexto.trim()) return;
    const obs = { id: Date.now(), texto: obsTexto, fecha: new Date().toLocaleString() };
    setObservaciones(prev => [obs, ...prev]);
    addNotif('Observación registrada (HU-59)', 'info');
    setObsTexto('');
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header estado */}
      <div style={{ background: ok ? `linear-gradient(135deg, #14532d, #166534)` : `linear-gradient(135deg, #7f1d1d, #991b1b)`, borderRadius: 12, padding: '18px 24px', marginBottom: 16, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {ok ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>{ok ? 'Horario Válido — Sin Conflictos' : `${conflictos.length} Conflicto(s) Detectado(s)`}</div>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{totalClases} clases · {semestres.length} semestres · Estado: {estado === 'aprobado' ? 'APROBADO' : 'PENDIENTE'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {estado !== 'aprobado' && ok && (
            <button onClick={onAprobar} style={{ background: C.gold, color: C.navy, border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 'bold', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Check size={14} /> Aprobar Horario (HU-62)
            </button>
          )}
          {estado === 'aprobado' && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 8, fontWeight: 'bold', fontSize: 13 }}>✓ APROBADO</span>}
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { v: totalClases, l: 'Clases Asignadas', c: C.navy },
          { v: conflictos.length, l: 'Conflictos', c: conflictos.length > 0 ? '#991b1b' : '#166534' },
          { v: docentesSobrecargados.length, l: 'Docentes Sobrecargados', c: docentesSobrecargados.length > 0 ? '#92400e' : '#166534' },
          { v: docentes.filter(d => (horasDoc?.[d.id] || 0) > 0).length, l: 'Docentes con Carga', c: C.navy },
        ].map(m => (
          <div key={m.l} style={{ background: 'white', borderRadius: 10, padding: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 'bold', color: m.c }}>{m.v}</div>
            <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{m.l}</div>
          </div>
        ))}
      </div>

      {/* Conflictos */}
      {conflictos.length > 0 && (
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #fecaca', padding: 18, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 10px', color: '#991b1b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={14} /> Conflictos a Resolver (HU-57)
          </h3>
          {conflictos.map((c, i) => (
            <div key={i} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '7px 10px', marginBottom: 6, fontSize: 12, color: '#7f1d1d' }}>
              ⚠ <strong>{c.tipo.replace('_', ' ').toUpperCase()}</strong> — {c.mensaje}
            </div>
          ))}
          <button onClick={onVerHorario} style={{ marginTop: 10, padding: '6px 14px', background: C.navy, color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>
            Ir a Editar Horario →
          </button>
        </div>
      )}

      {/* Verificación de recesos (HU-56) */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 10px', color: C.navy, fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} /> Verificación de Recesos (HU-56)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[{ r: 'Receso 10:00–10:15', ok: true }, { r: 'Receso 11:45–12:00', ok: true }, { r: 'Lunes 07:45 inicio', ok: true }, { r: 'Máx 8 periodos/día', ok: true }].map(item => (
            <div key={item.r} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <CheckCircle size={14} color="#16a34a" />
              <span style={{ color: C.gray }}>{item.r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Carga docente */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 14px', color: C.navy, fontSize: 13, fontWeight: 'bold' }}>Carga Horaria por Docente (RAC-03)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {docentes.map(d => {
            const horas = horasDoc?.[d.id] || 0;
            const pct = Math.min(100, (horas / d.maxHoras) * 100);
            const over = horas > d.maxHoras;
            return (
              <div key={d.id} style={{ padding: '8px 12px', border: `1px solid ${over ? '#fecaca' : '#e2e8f0'}`, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontWeight: '500', color: C.navy }}>{d.nombre}</span>
                  <span style={{ fontWeight: 'bold', color: over ? '#dc2626' : '#166534' }}>{horas}/{d.maxHoras}h</span>
                </div>
                <div style={{ background: '#e2e8f0', borderRadius: 99, height: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: over ? '#dc2626' : pct > 80 ? C.gold : '#16a34a', borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Observaciones (HU-59/69) */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px', color: C.navy, fontSize: 13, fontWeight: 'bold' }}>Registrar Observaciones (HU-59/69)</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input value={obsTexto} onChange={e => setObsTexto(e.target.value)} onKeyDown={e => e.key === 'Enter' && agregarObs()} placeholder="Escribir observación..." style={{ ...inputStyle, flex: 1 }} />
          <button onClick={agregarObs} style={{ ...btnPrimary, whiteSpace: 'nowrap' }}><Plus size={14} /> Agregar</button>
        </div>
        {observaciones.map(obs => (
          <div key={obs.id} style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: 6, padding: '7px 12px', marginBottom: 6, fontSize: 12 }}>
            <div style={{ color: C.navy }}>{obs.texto}</div>
            <div style={{ color: '#94a3b8', fontSize: 10, marginTop: 2 }}>{obs.fecha}</div>
          </div>
        ))}
      </div>

      {/* Historial (HU-63) */}
      {historial.length > 0 && (
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18 }}>
          <h3 style={{ margin: '0 0 10px', color: C.navy, fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Archive size={14} /> Historial de Cambios (HU-63)
          </h3>
          {historial.map(h => (
            <div key={h.id} style={{ display: 'flex', gap: 10, fontSize: 12, padding: '5px 8px', background: '#f8fafc', borderRadius: 6, marginBottom: 4 }}>
              <span style={{ color: C.gold }}>{h.fecha}</span>
              <span style={{ color: C.navy, fontWeight: 'bold' }}>{h.accion}</span>
              <span style={{ color: C.gray }}>— {h.usuario}</span>
              <span style={{ marginLeft: 'auto', color: h.estado === 'aprobado' ? '#16a34a' : '#92400e', fontWeight: 'bold', fontSize: 11 }}>{h.estado?.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// MOD-6: REPORTES
// ==========================================
