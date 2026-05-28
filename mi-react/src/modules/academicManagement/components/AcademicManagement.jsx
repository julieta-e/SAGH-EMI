import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Users, BookOpen, Building2, Layers } from 'lucide-react';
import { C, DIAS } from '../../../shared/constants';
import { FormModal, FormField } from '../../../shared/components/Forms';
import { inputStyle, btnPrimary, btnSmall, thStyle, tdStyle } from '../../../shared/styles/inlineStyles';
import '../styles/academicManagement.css';

export function Mod2GestionAcadView({ docentes, setDocentes, materias, setMaterias, aulas, setAulas, grupos, setGrupos }) {
  const [subTab, setSubTab] = useState('docentes');

  const subTabs = [
    { id: 'docentes', label: 'Docentes', icon: <Users size={14}/> },
    { id: 'materias', label: 'Materias', icon: <BookOpen size={14}/> },
    { id: 'aulas', label: 'Aulas', icon: <Building2 size={14}/> },
    { id: 'grupos', label: 'Grupos', icon: <Layers size={14}/> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {subTabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', background: subTab === t.id ? C.navy : '#e2e8f0', color: subTab === t.id ? C.gold : C.gray }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {subTab === 'docentes' && <DocentesView docentes={docentes} setDocentes={setDocentes} />}
      {subTab === 'materias' && <MateriasView materias={materias} setMaterias={setMaterias} docentes={docentes} />}
      {subTab === 'aulas' && <AulasView aulas={aulas} setAulas={setAulas} />}
      {subTab === 'grupos' && <GruposView grupos={grupos} setGrupos={setGrupos} aulas={aulas} />}
    </div>
  );
}

function DocentesView({ docentes, setDocentes }) {
  const [modal, setModal] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const API = 'http://localhost:3001/api';

const guardar = async (datos) => {
  const method = datos.id ? 'PUT' : 'POST';
  const url = datos.id ? `${API}/docentes/${datos.id}` : `${API}/docentes`;
  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: datos.nombre,
      tipo: datos.tipo,
      especialidad: datos.especialidad,
      email: datos.email,
      max_horas: datos.maxHoras,
      min_horas: datos.minHoras,
      disponibilidad: datos.disponibilidad
    })
  });
  const res = await fetch(`${API}/docentes`);
  setDocentes(await res.json());
  setModal(null);
};

// Para eliminar:
const eliminar = async (id) => {
  await fetch(`${API}/docentes/${id}`, { method: 'DELETE' });
  const res = await fetch(`${API}/docentes`);
  setDocentes(await res.json());
};

  const filtrados = docentes.filter(d => d.nombre.toLowerCase().includes(busqueda.toLowerCase()) || d.especialidad.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 260 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: 9, color: C.gray }} />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar docente..." style={{ ...inputStyle, paddingLeft: 30 }} />
        </div>
        <button onClick={() => setModal({ nombre: '', tipo: 'Civil', maxHoras: 25, minHoras: 10, especialidad: '', email: '', disponibilidad: [0,1,2,3,4] })} style={btnPrimary}>
          <Plus size={14} /> Nuevo Docente
        </button>
      </div>
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.grayLight }}>
              {['Nombre', 'Tipo', 'Especialidad', 'Email', 'Hrs Mín/Máx', 'Acciones'].map(h => <th key={h} style={thStyle}>{h.toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                <td style={tdStyle}><span style={{ fontWeight: 'bold', color: C.navy, fontSize: 13 }}>{d.nombre}</span></td>
                <td style={tdStyle}><span style={{ background: d.tipo.includes('Militar') ? '#dcfce7' : '#dbeafe', color: d.tipo.includes('Militar') ? '#166534' : '#1e40af', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{d.tipo}</span></td>
                <td style={tdStyle}><span style={{ fontSize: 13, color: C.gray }}>{d.especialidad}</span></td>
                <td style={tdStyle}><span style={{ fontSize: 12, color: C.gray }}>{d.email}</span></td>
                <td style={{ ...tdStyle, textAlign: 'center' }}><span style={{ fontWeight: 'bold', color: C.navy }}>{d.minHoras}–{d.maxHoras} h</span></td>
                <td style={tdStyle}>
                  <button onClick={() => setModal({ ...d })} style={btnSmall}><Pencil size={12} /></button>
                  <button onClick={() => setDocentes(prev => prev.filter(x => x.id !== d.id))} style={{ ...btnSmall, marginLeft: 6, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={12} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal !== null && (
        <FormModal titulo={modal.id ? 'Editar Docente' : 'Nuevo Docente'} onClose={() => setModal(null)} onGuardar={() => guardar(modal)}>
          <FormField label="Nombre Completo"><input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} /></FormField>
          <FormField label="Tipo">
            <select value={modal.tipo} onChange={e => setModal(m => ({ ...m, tipo: e.target.value }))} style={inputStyle}>
              {['Civil', 'Militar Activo', 'Militar Reserva'].map(t => <option key={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Especialidad"><input value={modal.especialidad} onChange={e => setModal(m => ({ ...m, especialidad: e.target.value }))} style={inputStyle} /></FormField>
          <FormField label="Email Institucional"><input value={modal.email} onChange={e => setModal(m => ({ ...m, email: e.target.value }))} style={inputStyle} /></FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Mín. Horas/Semana"><input type="number" min={1} max={40} value={modal.minHoras} onChange={e => setModal(m => ({ ...m, minHoras: +e.target.value }))} style={inputStyle} /></FormField>
            <FormField label="Máx. Horas/Semana"><input type="number" min={1} max={40} value={modal.maxHoras} onChange={e => setModal(m => ({ ...m, maxHoras: +e.target.value }))} style={inputStyle} /></FormField>
          </div>
          <FormField label="Disponibilidad (días)">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DIAS.map((dia, idx) => (
                <button key={dia} type="button" onClick={() => setModal(m => ({ ...m, disponibilidad: m.disponibilidad.includes(idx) ? m.disponibilidad.filter(d => d !== idx) : [...m.disponibilidad, idx] }))}
                  style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${modal.disponibilidad.includes(idx) ? C.navy : '#e2e8f0'}`, background: modal.disponibilidad.includes(idx) ? C.navy : 'white', color: modal.disponibilidad.includes(idx) ? 'white' : C.gray, fontSize: 12, cursor: 'pointer' }}>
                  {dia.slice(0, 3)}
                </button>
              ))}
            </div>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}

function MateriasView({ materias, setMaterias, docentes }) {
  const [filtro, setFiltro] = useState('Todos');
  const [modal, setModal] = useState(null);

  const guardar = (datos) => {
    if (datos.id) setMaterias(prev => prev.map(m => m.id === datos.id ? datos : m));
    else setMaterias(prev => [...prev, { ...datos, id: `m_${Date.now()}` }]);
    setModal(null);
  };

  const filtradas = filtro === 'Todos' ? materias : materias.filter(m => m.semestre === parseInt(filtro));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
        <select value={filtro} onChange={e => setFiltro(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 180 }}>
          <option value="Todos">Todos los Semestres</option>
          {[3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}° Semestre</option>)}
        </select>
        <button onClick={() => setModal({ nombre: '', semestre: 3, periodos: 2, docenteId: docentes[0]?.id || '', tipoAula: 'Aula', critica: false })} style={btnPrimary}>
          <Plus size={14} /> Nueva Materia
        </button>
      </div>
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', maxHeight: '60vh', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr style={{ background: C.grayLight }}>
              {['Materia', 'Sem.', 'Periodos', 'Tipo Aula', 'Crítica', 'Docente Asignado', 'Acciones'].map(h => <th key={h} style={thStyle}>{h.toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtradas.map((m, i) => {
              const doc = docentes.find(d => d.id === m.docenteId);
              return (
                <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                  <td style={tdStyle}><span style={{ fontWeight: 'bold', fontSize: 13, color: C.navy }}>{m.nombre}</span></td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}><span style={{ background: C.navy, color: C.gold, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{m.semestre}°</span></td>
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', color: C.navy }}>{m.periodos}</td>
                  <td style={tdStyle}><span style={{ background: m.tipoAula === 'Laboratorio' ? '#ede9fe' : '#f1f5f9', color: m.tipoAula === 'Laboratorio' ? '#6d28d9' : '#475569', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{m.tipoAula}</span></td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{m.critica ? <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 12 }}>★</span> : <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                  <td style={tdStyle}><span style={{ fontSize: 12, color: C.gray }}>{doc?.nombre || '—'}</span></td>
                  <td style={tdStyle}>
                    <button onClick={() => setModal({ ...m })} style={btnSmall}><Pencil size={12} /></button>
                    <button onClick={() => setMaterias(prev => prev.filter(x => x.id !== m.id))} style={{ ...btnSmall, marginLeft: 6, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={12} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {modal && (
        <FormModal titulo={modal.id ? 'Editar Materia' : 'Nueva Materia'} onClose={() => setModal(null)} onGuardar={() => guardar(modal)}>
          <FormField label="Nombre de la Materia"><input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} /></FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Semestre">
              <select value={modal.semestre} onChange={e => setModal(m => ({ ...m, semestre: +e.target.value }))} style={inputStyle}>
                {[3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}°</option>)}
              </select>
            </FormField>
            <FormField label="Periodos/Semana"><input type="number" min={1} max={8} value={modal.periodos} onChange={e => setModal(m => ({ ...m, periodos: +e.target.value }))} style={inputStyle} /></FormField>
          </div>
          <FormField label="Tipo de Aula">
            <select value={modal.tipoAula} onChange={e => setModal(m => ({ ...m, tipoAula: e.target.value }))} style={inputStyle}>
              {['Aula', 'Laboratorio', 'Auditorio', 'Sala'].map(t => <option key={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Docente Asignado">
            <select value={modal.docenteId} onChange={e => setModal(m => ({ ...m, docenteId: e.target.value }))} style={inputStyle}>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </FormField>
          <FormField label="Materia Crítica">
            <select value={modal.critica ? 'si' : 'no'} onChange={e => setModal(m => ({ ...m, critica: e.target.value === 'si' }))} style={inputStyle}>
              <option value="si">Sí — prioridad alta en el AG</option>
              <option value="no">No</option>
            </select>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}

function AulasView({ aulas, setAulas }) {
  const [modal, setModal] = useState(null);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Aula', 'Laboratorio', 'Auditorio', 'Sala'].map(t => {
            const cnt = aulas.filter(a => a.tipo === t).length;
            return (
              <div key={t} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', color: C.navy }}>{cnt}</div>
                <div style={{ fontSize: 11, color: C.gray }}>{t}s</div>
              </div>
            );
          })}
        </div>
        <button onClick={() => setModal({ nombre: '', tipo: 'Aula', capacidad: 30, edificio: 'A', disponible: true })} style={btnPrimary}>
          <Plus size={14} /> Nueva Aula
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {aulas.map(a => (
          <div key={a.id} style={{ background: 'white', borderRadius: 10, border: `1px solid ${a.disponible ? '#e2e8f0' : '#fecaca'}`, padding: 14, opacity: a.disponible ? 1 : 0.75 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 14 }}>{a.nombre}</div>
                <div style={{ fontSize: 11, color: C.gray }}>Edificio {a.edificio}</div>
              </div>
              <span style={{ background: a.tipo === 'Laboratorio' ? '#ede9fe' : a.tipo === 'Auditorio' ? '#fef9c3' : '#f1f5f9', color: a.tipo === 'Laboratorio' ? '#6d28d9' : a.tipo === 'Auditorio' ? '#92400e' : '#475569', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{a.tipo}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, background: C.grayLight, borderRadius: 6, padding: 6, textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', color: C.navy }}>{a.capacidad}</div>
                <div style={{ fontSize: 10, color: C.gray }}>Capacidad</div>
              </div>
              <div style={{ flex: 1, background: a.disponible ? '#dcfce7' : '#fee2e2', borderRadius: 6, padding: 6, textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', color: a.disponible ? '#166534' : '#dc2626' }}>{a.disponible ? 'Disponible' : 'No Disp.'}</div>
                <div style={{ fontSize: 10, color: C.gray }}>Estado</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setAulas(prev => prev.map(x => x.id === a.id ? { ...x, disponible: !x.disponible } : x))} style={{ ...btnSmall, flex: 1, justifyContent: 'center' }}>
                {a.disponible ? 'Deshabilitar' : 'Habilitar'}
              </button>
              <button onClick={() => setModal({ ...a })} style={btnSmall}><Pencil size={12} /></button>
              <button onClick={() => setAulas(prev => prev.filter(x => x.id !== a.id))} style={{ ...btnSmall, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <FormModal titulo={modal.id ? 'Editar Aula' : 'Nueva Aula'} onClose={() => setModal(null)} onGuardar={() => {
          if (modal.id) setAulas(prev => prev.map(a => a.id === modal.id ? modal : a));
          else setAulas(prev => [...prev, { ...modal, id: `a_${Date.now()}` }]);
          setModal(null);
        }}>
          <FormField label="Nombre del Aula"><input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} /></FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Tipo">
              <select value={modal.tipo} onChange={e => setModal(m => ({ ...m, tipo: e.target.value }))} style={inputStyle}>
                {['Aula', 'Laboratorio', 'Auditorio', 'Sala'].map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Edificio"><input value={modal.edificio} onChange={e => setModal(m => ({ ...m, edificio: e.target.value }))} style={inputStyle} /></FormField>
          </div>
          <FormField label="Capacidad"><input type="number" min={1} value={modal.capacidad} onChange={e => setModal(m => ({ ...m, capacidad: +e.target.value }))} style={inputStyle} /></FormField>
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

function GruposView({ grupos, setGrupos, aulas }) {
  const [modal, setModal] = useState(null);
  const [errorAula, setErrorAula] = useState('');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button onClick={() => setModal({ nombre: '', semestre: 3, numEstudiantes: 30, aulaFijaId: null })} style={btnPrimary}>
          <Plus size={14} /> Nuevo Grupo
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {grupos.map(g => {
          const aulaFija = aulas.find(a => a.id === g.aulaFijaId);
          return (
            <div key={g.id} style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: C.navy }}>{g.nombre}</div>
                  <div style={{ fontSize: 11, color: C.gray }}>{g.numEstudiantes} estudiantes</div>
                </div>
                <span style={{ background: C.navy, color: C.gold, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{g.semestre}°</span>
              </div>
              {aulaFija && <div style={{ fontSize: 11, color: C.blue, background: C.blueLight, padding: '3px 8px', borderRadius: 6, marginBottom: 8 }}>📍 Aula fija: {aulaFija.nombre}</div>}
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setModal({ ...g })} style={{ ...btnSmall, flex: 1, justifyContent: 'center' }}><Pencil size={12} /> Editar</button>
                <button onClick={() => setGrupos(prev => prev.filter(x => x.id !== g.id))} style={{ ...btnSmall, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={12} /></button>
              </div>
            </div>
          );
        })}
      </div>
      {modal && (
        <FormModal titulo={modal.id ? 'Editar Grupo' : 'Nuevo Grupo'} onClose={() => { setModal(null); setErrorAula(''); }} onGuardar={() => {
            if (modal.aulaFijaId) {
              const aulaSeleccionada = aulas.find(a => a.id === modal.aulaFijaId);
              if (aulaSeleccionada && modal.numEstudiantes > aulaSeleccionada.capacidad) {
                setErrorAula(`El aula "${aulaSeleccionada.nombre}" tiene capacidad para ${aulaSeleccionada.capacidad} estudiantes, pero el grupo tiene ${modal.numEstudiantes}. Seleccioná un aula con mayor capacidad o reducí el número de estudiantes.`);
                return;
              }
            }
            setErrorAula('');
            if (modal.id) setGrupos(prev => prev.map(g => g.id === modal.id ? modal : g));
            else setGrupos(prev => [...prev, { ...modal, id: `g${Date.now()}` }]);
            setModal(null);
          }}>
          <FormField label="Nombre del Grupo"><input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} /></FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Semestre">
              <select value={modal.semestre} onChange={e => setModal(m => ({ ...m, semestre: +e.target.value }))} style={inputStyle}>
                {[3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}°</option>)}
              </select>
            </FormField>
            <FormField label="N° Estudiantes"><input type="number" min={1} value={modal.numEstudiantes} onChange={e => { setErrorAula(''); setModal(m => ({ ...m, numEstudiantes: +e.target.value })); }} style={inputStyle} /></FormField>
          </div>
          <FormField label="Aula Fija">
            <select value={modal.aulaFijaId || ''} onChange={e => { setErrorAula(''); setModal(m => ({ ...m, aulaFijaId: e.target.value || null })); }} style={inputStyle}>
              <option value="">Sin aula fija</option>
              {aulas.filter(a => a.disponible).map(a => <option key={a.id} value={a.id}>{a.nombre} — Cap. {a.capacidad}</option>)}
            </select>
          </FormField>
          {errorAula && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#991b1b', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0, fontWeight: 'bold' }}>⚠</span>
              <span>{errorAula}</span>
            </div>
          )}
        </FormModal>
      )}
    </div>
  );
}

// ==========================================
// MOD-3: GENERACIÓN DE HORARIOS
// ==========================================