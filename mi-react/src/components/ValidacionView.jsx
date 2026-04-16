import React from 'react';
import { Shield, AlertTriangle, CheckCircle, AlertCircle, Eye, Check } from 'lucide-react';
import { C } from '../constants/colors';
import { EmptyState } from './SharedComponents';
import { validarHorario } from '../utils/scheduling';
import { DIAS } from '../constants/schedule';

export function ValidacionView({ horario, docentes, horasDoc, estado, onAprobar, onVerHorario }) {
  if (!horario) return (
    <EmptyState icon={<Shield size={40} />} titulo="Sin horario generado" desc='Ve al "Generador" para crear un horario primero.' />
  );

  const conflictos = validarHorario(horario, docentes);
  const semestres = [3, 4, 5, 6, 7, 8, 9, 10];
  const totalClases = semestres.reduce((acc, s) => {
    let c = 0;
    for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) if (horario[s]?.[d]?.[p]) c++;
    return acc + c;
  }, 0);

  const docentesSobrecargados = docentes.filter(d => (horasDoc?.[d.id] || 0) > d.maxHoras);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{
        background: conflictos.length === 0 && docentesSobrecargados.length === 0
          ? `linear-gradient(135deg, #14532d, #166534)`
          : `linear-gradient(135deg, #7f1d1d, #991b1b)`,
        borderRadius: 12, padding: '20px 28px', marginBottom: 20, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {conflictos.length === 0 ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 18 }}>
              {conflictos.length === 0 ? 'Horario Válido — Sin Conflictos Detectados' : `${conflictos.length} Conflicto(s) Detectado(s)`}
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
              {totalClases} clases asignadas · {semestres.length} semestres · Estado: {estado === 'aprobado' ? 'APROBADO' : 'PENDIENTE DE VALIDACIÓN'}
            </div>
          </div>
        </div>
        {estado !== 'aprobado' && conflictos.length === 0 && (
          <button onClick={onAprobar} style={{
            background: C.gold, color: C.navy, border: 'none', borderRadius: 8,
            padding: '10px 22px', fontWeight: 'bold', cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <Check size={16} /> Aprobar Horario
          </button>
        )}
        {estado === 'aprobado' && (
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: 8, fontWeight: 'bold', fontSize: 14 }}>
            ✓ APROBADO
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { v: totalClases, l: 'Clases Asignadas', c: C.navy },
          { v: conflictos.length, l: 'Conflictos', c: conflictos.length > 0 ? '#991b1b' : '#166534' },
          { v: docentesSobrecargados.length, l: 'Docentes Sobrecargados', c: docentesSobrecargados.length > 0 ? '#92400e' : '#166534' },
          { v: docentes.filter(d => (horasDoc?.[d.id] || 0) > 0).length, l: 'Docentes con Carga', c: C.navy },
        ].map(m => (
          <div key={m.l} style={{ background: 'white', borderRadius: 10, padding: '16px', border: `1px solid #e2e8f0`, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: m.c }}>{m.v}</div>
            <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{m.l}</div>
          </div>
        ))}
      </div>

      {conflictos.length > 0 && (
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #fecaca', padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 12px', color: '#991b1b', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} /> Conflictos a Resolver
          </h3>
          {conflictos.map((c, i) => (
            <div key={i} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', marginBottom: 8, fontSize: 13, color: '#7f1d1d' }}>
              <strong>{c.tipo === 'conflicto_docente' ? '⚠ Conflicto de Docente' : '⚠ Regla Dura'}</strong> — {c.mensaje}
            </div>
          ))}
          <div style={{ marginTop: 12, fontSize: 12, color: C.gray }}>
            Ve a <strong>Ver Horarios</strong> para hacer cambios manuales y resolver los conflictos.
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', color: C.navy, fontSize: 14, fontWeight: 'bold' }}>Carga Horaria por Docente</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {docentes.map(d => {
            const horas = horasDoc?.[d.id] || 0;
            const pct = Math.min(100, (horas / d.maxHoras) * 100);
            const over = horas > d.maxHoras;
            return (
              <div key={d.id} style={{ padding: '10px 12px', border: `1px solid ${over ? '#fecaca' : '#e2e8f0'}`, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: '500', color: C.navy }}>{d.nombre}</span>
                  <span style={{ fontWeight: 'bold', color: over ? '#dc2626' : '#166534' }}>{horas}/{d.maxHoras} h</span>
                </div>
                <div style={{ background: '#e2e8f0', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: over ? '#dc2626' : pct > 80 ? C.gold : '#16a34a', borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <button onClick={onVerHorario} style={{
          background: C.navy, color: 'white', border: 'none', borderRadius: 8,
          padding: '10px 24px', cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8
        }}>
          <Eye size={15} /> Ver y Editar Horarios Manualmente
        </button>
      </div>
    </div>
  );
}
