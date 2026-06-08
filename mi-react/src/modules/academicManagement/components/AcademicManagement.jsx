import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Users, BookOpen, Building2, Layers, AlertTriangle } from 'lucide-react';
import { C, DIAS } from '../../../shared/constants';
import { FormModal, FormField } from '../../../shared/components/Forms';
import { inputStyle, btnPrimary, btnSmall, thStyle, tdStyle } from '../../../shared/styles/inlineStyles';
import '../styles/academicManagement.css';

const API = 'http://localhost:3001/api';

// ── Normaliza materia de BD al formato frontend ────────────────────────────────
function normalizarMateria(m) {
  return {
    ...m,
    id:              m.id        ?? m.id_materia,
    semestre:        Number(m.semestre ?? m.id_semestre ?? 0),
    docenteId:       m.docenteId ?? m.docente_id ?? null,
    tipoAula:        m.tipoAula  ?? m.tipo_aula  ?? 'Aula',
    horas_teoria:      Number(m.horas_teoria      ?? 0),
    horas_practica:    Number(m.horas_practica     ?? 0),
    horas_laboratorio: Number(m.horas_laboratorio  ?? 0),
    periodos:        Number(m.periodos ?? 0),
    critica:         m.critica === true || m.critica === 't' || m.critica === 1,
  };
}

// ── Componente raíz MOD-2 ─────────────────────────────────────────────────────
export function Mod2GestionAcadView({
  docentes, setDocentes,
  materias, setMaterias,
  aulas,    setAulas,
  grupos,   setGrupos,
}) {
  const [subTab, setSubTab] = useState('docentes');

  const subTabs = [
    { id: 'docentes', label: 'Docentes', icon: <Users size={14} /> },
    { id: 'materias', label: 'Materias', icon: <BookOpen size={14} /> },
    { id: 'aulas',    label: 'Aulas',    icon: <Building2 size={14} /> },
    { id: 'grupos',   label: 'Grupos',   icon: <Layers size={14} /> },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 'bold', color: C.navy }}>
          Módulo 2: Gestión Académica
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: C.gray }}>
          Administre docentes, materias, aulas y grupos académicos
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {subTabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:6, border:'none', cursor:'pointer', fontSize:12, fontWeight:'bold', background: subTab === t.id ? C.navy : '#e2e8f0', color: subTab === t.id ? C.gold : C.gray }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {subTab === 'docentes' && <DocentesView docentes={docentes} setDocentes={setDocentes} />}
      {subTab === 'materias' && <MateriasView materias={materias} setMaterias={setMaterias} docentes={docentes} />}
      {subTab === 'aulas'    && <AulasView aulas={aulas} setAulas={setAulas} />}
      {subTab === 'grupos'   && <GruposView grupos={grupos} setGrupos={setGrupos} aulas={aulas} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DOCENTES
// ══════════════════════════════════════════════════════════════════════════════
function DocentesView({ docentes, setDocentes }) {
  const [modal,    setModal]    = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const recargar = async () => {
    const res = await fetch(`${API}/docentes`);
    setDocentes(await res.json());
  };

  const guardar = async (datos) => {
    const method = datos.id ? 'PUT' : 'POST';
    const url    = datos.id ? `${API}/docentes/${datos.id}` : `${API}/docentes`;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre:        datos.nombre,
        tipo:          datos.tipo,
        especialidad:  datos.especialidad,
        email:         datos.email,
        max_horas:     datos.maxHoras,
        min_horas:     datos.minHoras,
        disponibilidad: datos.disponibilidad,
      }),
    });
    await recargar();
    setModal(null);
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este docente?')) return;
    await fetch(`${API}/docentes/${id}`, { method: 'DELETE' });
    await recargar();
  };

  const filtrados = docentes.filter(d =>
    d.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.especialidad?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const modalVacio = { nombre:'', tipo:'Civil', maxHoras:25, minHoras:10, especialidad:'', email:'', disponibilidad:[0,1,2,3,4] };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14, gap:10 }}>
        <div style={{ position:'relative', flex:1, maxWidth:280 }}>
          <Search size={13} style={{ position:'absolute', left:10, top:9, color:C.gray }} />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar docente..." style={{ ...inputStyle, paddingLeft:30 }} />
        </div>
        <button onClick={() => setModal(modalVacio)} style={btnPrimary}>
          <Plus size={14} /> Nuevo Docente
        </button>
      </div>

      <div style={{ background:'white', borderRadius:10, border:'1px solid #e2e8f0', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background: C.grayLight }}>
              {['Nombre','Tipo','Especialidad','Email','Hrs Mín/Máx','Acciones'].map(h => (
                <th key={h} style={thStyle}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:20, color:'#94a3b8', fontSize:13 }}>Sin docentes registrados</td></tr>
            )}
            {filtrados.map((d, i) => (
              <tr key={d.id} style={{ borderBottom:'1px solid #f1f5f9', background: i%2===0 ? 'white' : '#f8fafc' }}>
                <td style={tdStyle}><span style={{ fontWeight:'bold', color:C.navy, fontSize:13 }}>{d.nombre}</span></td>
                <td style={tdStyle}>
                  <span style={{ background: d.tipo?.includes('Militar') ? '#dcfce7' : '#dbeafe', color: d.tipo?.includes('Militar') ? '#166534' : '#1e40af', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:'bold' }}>
                    {d.tipo}
                  </span>
                </td>
                <td style={tdStyle}><span style={{ fontSize:12, color:C.gray }}>{d.especialidad}</span></td>
                <td style={tdStyle}><span style={{ fontSize:12, color:C.gray }}>{d.email}</span></td>
                <td style={{ ...tdStyle, textAlign:'center' }}>
                  <span style={{ fontWeight:'bold', color:C.navy }}>{d.minHoras ?? d.min_horas}–{d.maxHoras ?? d.max_horas} h</span>
                </td>
                <td style={tdStyle}>
                  <button onClick={() => setModal({ ...d, maxHoras: d.maxHoras ?? d.max_horas, minHoras: d.minHoras ?? d.min_horas, disponibilidad: d.disponibilidad || [0,1,2,3,4] })} style={btnSmall}><Pencil size={12} /></button>
                  <button onClick={() => eliminar(d.id)} style={{ ...btnSmall, marginLeft:6, color:'#dc2626', borderColor:'#fecaca' }}><Trash2 size={12} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <FormModal titulo={modal.id ? 'Editar Docente' : 'Nuevo Docente'} onClose={() => setModal(null)} onGuardar={() => guardar(modal)}>
          <FormField label="Nombre Completo">
            <input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} />
          </FormField>
          <FormField label="Tipo">
            <select value={modal.tipo} onChange={e => setModal(m => ({ ...m, tipo: e.target.value }))} style={inputStyle}>
              {['Civil','Militar Activo','Militar Reserva'].map(t => <option key={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Especialidad">
            <input value={modal.especialidad} onChange={e => setModal(m => ({ ...m, especialidad: e.target.value }))} style={inputStyle} />
          </FormField>
          <FormField label="Email Institucional">
            <input value={modal.email} onChange={e => setModal(m => ({ ...m, email: e.target.value }))} style={inputStyle} />
          </FormField>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <FormField label="Mín. Horas/Semana">
              <input type="number" min={1} max={40} value={modal.minHoras} onChange={e => setModal(m => ({ ...m, minHoras: +e.target.value }))} style={inputStyle} />
            </FormField>
            <FormField label="Máx. Horas/Semana">
              <input type="number" min={1} max={40} value={modal.maxHoras} onChange={e => setModal(m => ({ ...m, maxHoras: +e.target.value }))} style={inputStyle} />
            </FormField>
          </div>
          <FormField label="Días disponibles">
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {DIAS.map((dia, idx) => (
                <button key={dia} type="button"
                  onClick={() => setModal(m => ({
                    ...m,
                    disponibilidad: m.disponibilidad.includes(idx)
                      ? m.disponibilidad.filter(d => d !== idx)
                      : [...m.disponibilidad, idx],
                  }))}
                  style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${modal.disponibilidad.includes(idx) ? C.navy : '#e2e8f0'}`, background: modal.disponibilidad.includes(idx) ? C.navy : 'white', color: modal.disponibilidad.includes(idx) ? 'white' : C.gray, fontSize:12, cursor:'pointer' }}>
                  {dia.slice(0,3)}
                </button>
              ))}
            </div>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MATERIAS — conectado a BD con horas T/P/L
// ══════════════════════════════════════════════════════════════════════════════
function MateriasView({ materias, setMaterias, docentes }) {
  const [filtroSem, setFiltroSem] = useState('Todos');
  const [modal,     setModal]     = useState(null);

  const recargar = async () => {
    const res  = await fetch(`${API}/materias`);
    const data = await res.json();
    setMaterias(Array.isArray(data) ? data.map(normalizarMateria) : []);
  };

  const guardar = async (datos) => {
    // Calcular periodos totales = T + P + L si no viene explícito
    const periodos = datos.periodos ||
      (Number(datos.horas_teoria) + Number(datos.horas_practica) + Number(datos.horas_laboratorio));

    // tipo_aula: si tiene horas_laboratorio > 0 → 'Laboratorio', si no → 'Aula'
    const tipoAula = Number(datos.horas_laboratorio) > 0 ? 'Laboratorio' : 'Aula';

    const body = {
      nombre:            datos.nombre,
      semestre:          datos.semestre,
      periodos,
      horas_teoria:      Number(datos.horas_teoria)      || 0,
      horas_practica:    Number(datos.horas_practica)     || 0,
      horas_laboratorio: Number(datos.horas_laboratorio)  || 0,
      docente_id:        datos.docenteId || null,
      tipo_aula:         tipoAula,
      critica:           datos.critica || false,
      horas_semanales:   periodos,
      creditos:          datos.creditos || 0,
    };

    const method = datos.id ? 'PUT' : 'POST';
    const url    = datos.id ? `${API}/materias/${datos.id}` : `${API}/materias`;
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(`Error: ${err.error || res.statusText}`);
      return;
    }
    await recargar();
    setModal(null);
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta materia?')) return;
    await fetch(`${API}/materias/${id}`, { method: 'DELETE' });
    await recargar();
  };

  const filtradas = filtroSem === 'Todos' ? materias : materias.filter(m => m.semestre === parseInt(filtroSem));

  // Materia vacía para "Nueva"
  const modalVacio = {
    nombre:'', semestre:3, periodos:5,
    horas_teoria:3, horas_practica:2, horas_laboratorio:0,
    docenteId: docentes[0]?.id || '',
    tipoAula:'Aula', critica:false, creditos:0,
  };

  // Calcular periodos totales del modal en tiempo real
  const periodosModal = modal
    ? (Number(modal.horas_teoria) + Number(modal.horas_practica) + Number(modal.horas_laboratorio)) || modal.periodos || 0
    : 0;

  return (
    <div>
      {/* Alertas de materias sin docente */}
      {materias.filter(m => !m.docenteId).length > 0 && (
        <div style={{ background:'#fef9c3', border:'1px solid #fde68a', borderRadius:8, padding:'8px 14px', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
          <AlertTriangle size={14} color="#92400e" />
          <span style={{ fontSize:12, color:'#92400e' }}>
            <strong>{materias.filter(m => !m.docenteId).length} materia(s)</strong> sin docente asignado — no serán programadas por el AG.
            {' '}{materias.filter(m => !m.docenteId).map(m => m.nombre).join(', ')}
          </span>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14, gap:10 }}>
        <select value={filtroSem} onChange={e => setFiltroSem(e.target.value)} style={{ ...inputStyle, width:'auto', minWidth:200 }}>
          <option value="Todos">Todos los Semestres</option>
          {[3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}° Semestre</option>)}
        </select>
        <button onClick={() => setModal(modalVacio)} style={btnPrimary}>
          <Plus size={14} /> Nueva Materia
        </button>
      </div>

      <div style={{ background:'white', borderRadius:10, border:'1px solid #e2e8f0', overflow:'hidden', maxHeight:'62vh', overflowY:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead style={{ position:'sticky', top:0, zIndex:1 }}>
            <tr style={{ background:C.grayLight }}>
              {['Materia','Sem.','Periodos','T','P','L','Tipo Aula','Crítica','Docente Asignado','Acciones'].map(h => (
                <th key={h} style={{ ...thStyle, fontSize:10 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign:'center', padding:20, color:'#94a3b8', fontSize:13 }}>
                Sin materias para este semestre
              </td></tr>
            )}
            {filtradas.map((m, i) => {
              const doc = docentes.find(d => d.id === m.docenteId);
              return (
                <tr key={m.id} style={{ borderBottom:'1px solid #f1f5f9', background: i%2===0 ? 'white' : '#f8fafc' }}>
                  <td style={tdStyle}><span style={{ fontWeight:'bold', fontSize:12, color:C.navy }}>{m.nombre}</span></td>
                  <td style={{ ...tdStyle, textAlign:'center' }}>
                    <span style={{ background:C.navy, color:C.gold, padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:'bold' }}>{m.semestre}°</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign:'center', fontWeight:'bold', color:C.navy }}>{m.periodos}</td>
                  {/* Horas T / P / L */}
                  <td style={{ ...tdStyle, textAlign:'center' }}>
                    <span style={{ background:'#e0f2fe', color:'#075985', padding:'1px 6px', borderRadius:4, fontSize:11, fontWeight:700 }}>{m.horas_teoria}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign:'center' }}>
                    <span style={{ background:'#fef3c7', color:'#92400e', padding:'1px 6px', borderRadius:4, fontSize:11, fontWeight:700 }}>{m.horas_practica}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign:'center' }}>
                    <span style={{ background: m.horas_laboratorio > 0 ? '#ede9fe' : '#f1f5f9', color: m.horas_laboratorio > 0 ? '#6d28d9' : '#94a3b8', padding:'1px 6px', borderRadius:4, fontSize:11, fontWeight:700 }}>
                      {m.horas_laboratorio}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ background: m.tipoAula === 'Laboratorio' ? '#ede9fe' : '#f1f5f9', color: m.tipoAula === 'Laboratorio' ? '#6d28d9' : '#475569', padding:'2px 8px', borderRadius:20, fontSize:11 }}>
                      {m.tipoAula}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign:'center' }}>
                    {m.critica
                      ? <span style={{ color:'#dc2626', fontWeight:'bold', fontSize:14 }}>★</span>
                      : <span style={{ color:'#cbd5e1' }}>—</span>}
                  </td>
                  <td style={tdStyle}>
                    {doc
                      ? <span style={{ fontSize:12, color:C.gray }}>{doc.nombre}</span>
                      : <span style={{ fontSize:11, color:'#dc2626', fontWeight:'bold' }}>⚠ Sin docente</span>}
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => setModal({ ...m })} style={btnSmall}><Pencil size={12} /></button>
                    <button onClick={() => eliminar(m.id)} style={{ ...btnSmall, marginLeft:6, color:'#dc2626', borderColor:'#fecaca' }}><Trash2 size={12} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <FormModal titulo={modal.id ? 'Editar Materia' : 'Nueva Materia'} onClose={() => setModal(null)} onGuardar={() => guardar(modal)}>
          <FormField label="Nombre de la Materia">
            <input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} />
          </FormField>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <FormField label="Semestre">
              <select value={modal.semestre} onChange={e => setModal(m => ({ ...m, semestre: +e.target.value }))} style={inputStyle}>
                {[3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}°</option>)}
              </select>
            </FormField>
            <FormField label="Total Periodos/Semana">
              <input
                type="number" readOnly
                value={periodosModal}
                style={{ ...inputStyle, background:'#f8fafc', color:C.navy, fontWeight:'bold' }}
                title="Se calcula automáticamente: T + P + L"
              />
            </FormField>
          </div>

          {/* Horas desglosadas T / P / L */}
          <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:12, fontWeight:'bold', color:C.navy, marginBottom:12 }}>
              Horas semanales por tipo de periodo
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              <FormField label="(T) Teoría">
                <input type="number" min={0} max={8}
                  value={modal.horas_teoria}
                  onChange={e => setModal(m => ({ ...m, horas_teoria: +e.target.value }))}
                  style={{ ...inputStyle, borderColor:'#bae6fd', background:'#e0f2fe' }}
                />
              </FormField>
              <FormField label="(P) Práctica">
                <input type="number" min={0} max={8}
                  value={modal.horas_practica}
                  onChange={e => setModal(m => ({ ...m, horas_practica: +e.target.value }))}
                  style={{ ...inputStyle, borderColor:'#fde68a', background:'#fef3c7' }}
                />
              </FormField>
              <FormField label="(L) Laboratorio">
                <input type="number" min={0} max={8}
                  value={modal.horas_laboratorio}
                  onChange={e => setModal(m => ({ ...m, horas_laboratorio: +e.target.value }))}
                  style={{ ...inputStyle, borderColor:'#ddd6fe', background:'#ede9fe' }}
                />
              </FormField>
            </div>
            <div style={{ marginTop:10, fontSize:11, color:'#64748b', display:'flex', gap:16 }}>
              <span>Total: <strong style={{ color:C.navy }}>{periodosModal} periodos</strong></span>
              <span style={{ color:'#0369a1' }}>T={modal.horas_teoria} · P={modal.horas_practica} · L={modal.horas_laboratorio}</span>
              {Number(modal.horas_laboratorio) > 0 && (
                <span style={{ color:'#7c3aed', fontWeight:'bold' }}>→ Requiere Laboratorio</span>
              )}
            </div>
          </div>

          <FormField label="Docente Asignado">
            <select value={modal.docenteId || ''} onChange={e => setModal(m => ({ ...m, docenteId: e.target.value || null }))} style={inputStyle}>
              <option value="">— Sin docente asignado —</option>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre} [{d.tipo}]</option>)}
            </select>
          </FormField>

          <FormField label="Materia Crítica (prioridad en el AG)">
            <select value={modal.critica ? 'si' : 'no'} onChange={e => setModal(m => ({ ...m, critica: e.target.value === 'si' }))} style={inputStyle}>
              <option value="si">★ Sí — se asigna primero y en horarios tempranos</option>
              <option value="no">No — prioridad normal</option>
            </select>
          </FormField>

          {!modal.docenteId && (
            <div style={{ background:'#fef9c3', border:'1px solid #fde68a', borderRadius:6, padding:'8px 12px', fontSize:12, color:'#92400e', display:'flex', gap:6 }}>
              <AlertTriangle size={14} style={{ flexShrink:0 }} />
              Sin docente asignado esta materia no será programada por el Algoritmo Genético.
            </div>
          )}
        </FormModal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// AULAS
// ══════════════════════════════════════════════════════════════════════════════
function AulasView({ aulas, setAulas }) {
  const [modal, setModal] = useState(null);

  const recargar = async () => {
    const res = await fetch(`${API}/aulas`);
    setAulas(await res.json());
  };

  const guardar = async (datos) => {
    const method = datos.id ? 'PUT' : 'POST';
    const url    = datos.id ? `${API}/aulas/${datos.id}` : `${API}/aulas`;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numero_aula: datos.nombre || datos.numero_aula,
        tipo:        datos.tipo,
        capacidad:   datos.capacidad,
        edificio:    datos.edificio,
        disponible:  datos.disponible,
      }),
    });
    await recargar();
    setModal(null);
  };

  const toggleDisponible = async (a) => {
    await fetch(`${API}/aulas/${a.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...a, numero_aula: a.nombre || a.numero_aula, disponible: !a.disponible }),
    });
    await recargar();
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta aula?')) return;
    await fetch(`${API}/aulas/${id}`, { method: 'DELETE' });
    await recargar();
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ display:'flex', gap:10 }}>
          {['Aula','Laboratorio','Auditorio','Sala'].map(t => {
            const cnt = aulas.filter(a => a.tipo === t).length;
            return (
              <div key={t} style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 14px', textAlign:'center', minWidth:70 }}>
                <div style={{ fontWeight:'bold', color:C.navy, fontSize:18 }}>{cnt}</div>
                <div style={{ fontSize:10, color:C.gray }}>{t}s</div>
              </div>
            );
          })}
        </div>
        <button onClick={() => setModal({ nombre:'', tipo:'Aula', capacidad:40, edificio:'3', disponible:true })} style={btnPrimary}>
          <Plus size={14} /> Nueva Aula
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:12 }}>
        {aulas.map(a => (
          <div key={a.id} style={{ background:'white', borderRadius:10, border:`1px solid ${a.disponible ? '#e2e8f0' : '#fecaca'}`, padding:14, opacity: a.disponible ? 1 : 0.75 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div>
                <div style={{ fontWeight:'bold', color:C.navy, fontSize:14 }}>{a.nombre || a.numero_aula}</div>
                <div style={{ fontSize:11, color:C.gray }}>Edificio {a.edificio}</div>
              </div>
              <span style={{ background: a.tipo === 'Laboratorio' ? '#ede9fe' : a.tipo === 'Auditorio' ? '#fef9c3' : '#f1f5f9', color: a.tipo === 'Laboratorio' ? '#6d28d9' : a.tipo === 'Auditorio' ? '#92400e' : '#475569', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:'bold' }}>
                {a.tipo}
              </span>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <div style={{ flex:1, background:C.grayLight, borderRadius:6, padding:6, textAlign:'center' }}>
                <div style={{ fontWeight:'bold', color:C.navy }}>{a.capacidad}</div>
                <div style={{ fontSize:10, color:C.gray }}>Capacidad</div>
              </div>
              <div style={{ flex:1, background: a.disponible ? '#dcfce7' : '#fee2e2', borderRadius:6, padding:6, textAlign:'center' }}>
                <div style={{ fontWeight:'bold', color: a.disponible ? '#166534' : '#dc2626' }}>
                  {a.disponible ? 'Disponible' : 'No Disp.'}
                </div>
                <div style={{ fontSize:10, color:C.gray }}>Estado</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => toggleDisponible(a)} style={{ ...btnSmall, flex:1, justifyContent:'center' }}>
                {a.disponible ? 'Deshabilitar' : 'Habilitar'}
              </button>
              <button onClick={() => setModal({ ...a, nombre: a.nombre || a.numero_aula })} style={btnSmall}><Pencil size={12} /></button>
              <button onClick={() => eliminar(a.id)} style={{ ...btnSmall, color:'#dc2626', borderColor:'#fecaca' }}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <FormModal titulo={modal.id ? 'Editar Aula' : 'Nueva Aula'} onClose={() => setModal(null)} onGuardar={() => guardar(modal)}>
          <FormField label="Nombre del Aula (ej: Aula 311)">
            <input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} placeholder="Aula 311" />
          </FormField>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <FormField label="Tipo">
              <select value={modal.tipo} onChange={e => setModal(m => ({ ...m, tipo: e.target.value }))} style={inputStyle}>
                {['Aula','Laboratorio','Auditorio','Sala'].map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Edificio">
              <input value={modal.edificio} onChange={e => setModal(m => ({ ...m, edificio: e.target.value }))} style={inputStyle} />
            </FormField>
          </div>
          <FormField label="Capacidad (estudiantes)">
            <input type="number" min={1} value={modal.capacidad} onChange={e => setModal(m => ({ ...m, capacidad: +e.target.value }))} style={inputStyle} />
          </FormField>
          <FormField label="Disponible">
            <select value={modal.disponible ? 'si' : 'no'} onChange={e => setModal(m => ({ ...m, disponible: e.target.value === 'si' }))} style={inputStyle}>
              <option value="si">Sí</option><option value="no">No</option>
            </select>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GRUPOS
// ══════════════════════════════════════════════════════════════════════════════
function GruposView({ grupos, setGrupos, aulas }) {
  const [modal,     setModal]     = useState(null);
  const [errorAula, setErrorAula] = useState('');

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
        <button onClick={() => setModal({ nombre:'', semestre:3, numEstudiantes:30, aulaFijaId:null })} style={btnPrimary}>
          <Plus size={14} /> Nuevo Grupo
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))', gap:12 }}>
        {grupos.map(g => {
          const aulaFija = aulas.find(a => a.id === g.aulaFijaId);
          return (
            <div key={g.id} style={{ background:'white', borderRadius:10, border:'1px solid #e2e8f0', padding:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:'bold', color:C.navy }}>{g.nombre}</div>
                  <div style={{ fontSize:11, color:C.gray }}>{g.numEstudiantes} estudiantes</div>
                </div>
                <span style={{ background:C.navy, color:C.gold, padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:'bold' }}>{g.semestre}°</span>
              </div>
              {aulaFija && (
                <div style={{ fontSize:11, color:C.blue, background:C.blueLight || '#eff6ff', padding:'3px 8px', borderRadius:6, marginBottom:8 }}>
                  📍 Aula fija: {aulaFija.nombre || aulaFija.numero_aula}
                </div>
              )}
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => setModal({ ...g })} style={{ ...btnSmall, flex:1, justifyContent:'center' }}>
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={() => setGrupos(prev => prev.filter(x => x.id !== g.id))} style={{ ...btnSmall, color:'#dc2626', borderColor:'#fecaca' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <FormModal
          titulo={modal.id ? 'Editar Grupo' : 'Nuevo Grupo'}
          onClose={() => { setModal(null); setErrorAula(''); }}
          onGuardar={() => {
            if (modal.aulaFijaId) {
              const aulaSeleccionada = aulas.find(a => a.id === modal.aulaFijaId);
              if (aulaSeleccionada && modal.numEstudiantes > aulaSeleccionada.capacidad) {
                setErrorAula(`"${aulaSeleccionada.nombre || aulaSeleccionada.numero_aula}" tiene cap. ${aulaSeleccionada.capacidad}, el grupo tiene ${modal.numEstudiantes} estudiantes.`);
                return;
              }
            }
            setErrorAula('');
            if (modal.id) setGrupos(prev => prev.map(g => g.id === modal.id ? modal : g));
            else          setGrupos(prev => [...prev, { ...modal, id: `g${Date.now()}` }]);
            setModal(null);
          }}
        >
          <FormField label="Nombre del Grupo">
            <input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} placeholder="Ej: 3° A" />
          </FormField>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <FormField label="Semestre">
              <select value={modal.semestre} onChange={e => setModal(m => ({ ...m, semestre: +e.target.value }))} style={inputStyle}>
                {[3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}°</option>)}
              </select>
            </FormField>
            <FormField label="N° Estudiantes">
              <input type="number" min={1} value={modal.numEstudiantes}
                onChange={e => { setErrorAula(''); setModal(m => ({ ...m, numEstudiantes: +e.target.value })); }}
                style={inputStyle} />
            </FormField>
          </div>
          <FormField label="Aula Fija (opcional)">
            <select value={modal.aulaFijaId || ''} onChange={e => { setErrorAula(''); setModal(m => ({ ...m, aulaFijaId: e.target.value || null })); }} style={inputStyle}>
              <option value="">Sin aula fija</option>
              {aulas.filter(a => a.disponible !== false).map(a => (
                <option key={a.id} value={a.id}>{a.nombre || a.numero_aula} — Cap. {a.capacidad}</option>
              ))}
            </select>
          </FormField>
          {errorAula && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:6, padding:'8px 12px', fontSize:12, color:'#991b1b', display:'flex', gap:8 }}>
              <span style={{ flexShrink:0 }}>⚠</span><span>{errorAula}</span>
            </div>
          )}
        </FormModal>
      )}
    </div>
  );
}