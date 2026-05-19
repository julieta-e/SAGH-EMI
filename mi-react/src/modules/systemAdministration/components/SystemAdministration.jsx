import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Search, CheckCircle, X, Users, Settings, Shield } from 'lucide-react';
import { C, ROLES, PERMISOS_ROL } from '../../../shared/constants';
import { FormModal, FormField } from '../../../shared/components/Forms';
import { DashboardView } from '../../../shared/components/Dashboard';
import { inputStyle, btnPrimary, btnSmall, thStyle, tdStyle } from '../../../shared/styles/inlineStyles';
import { registerUser, updateUser, deleteUser, toggleUserStatus, generateUserCredentials } from '../backend/systemAdministrationService';
import '../styles/systemAdministration.css';

export function Mod1AdminView({ usuarios, setUsuarios, docentes, materias, aulas, grupos, horarioData, estadoHorario, historial, addNotif, onNavigate }) {
  const [subTab, setSubTab] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const guardarUsuario = (datos) => {
    if (datos.id) setUsuarios(prev => updateUser(prev, datos.id, datos));
    else {
      const userData = { ...datos, ...generateUserCredentials(datos), mustChangePassword: true };
      setUsuarios(prev => registerUser(prev, userData));
    }
    addNotif(datos.id ? 'Usuario actualizado' : 'Usuario creado', 'success');
    setModal(null);
  };

  const eliminarUsuario = (id) => {
    setUsuarios(prev => deleteUser(prev, id));
    addNotif('Usuario eliminado', 'info');
    setModal(null);
  };

  const toggleActivo = (id) => {
    setUsuarios(prev => toggleUserStatus(prev, id));
  };

  const filtrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.usuario.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['dashboard', 'Dashboard', <Shield size={14}/>], ['usuarios', 'Usuarios', <Users size={14}/>], ['roles', 'Roles y Permisos', <Shield size={14}/>], ['configuracion', 'Configuraci?n', <Settings size={14}/>]].map(([id, label, icon]) => (
          <button key={id} onClick={() => setSubTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', background: subTab === id ? C.navy : '#e2e8f0', color: subTab === id ? C.gold : C.gray }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {subTab === 'dashboard' && (
        <DashboardView
          docentes={docentes}
          materias={materias}
          aulas={aulas}
          grupos={grupos}
          horarioData={horarioData}
          estadoHorario={estadoHorario}
          historial={historial}
          onNavigate={onNavigate}
        />
      )}

      {subTab === 'usuarios' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 260 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: 9, color: C.gray }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar usuario..." style={{ ...inputStyle, paddingLeft: 30 }} />
            </div>
            <button onClick={() => setModal({ nombre: '', usuario: '', password: '', rol: 'DDE', email: '', activo: true, docenteId: null })} style={btnPrimary}>
              <Plus size={14} /> Nuevo Usuario
            </button>
          </div>

          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.grayLight }}>
                  {['Nombre', 'Usuario', 'Rol', 'Email', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={thStyle}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                    <td style={tdStyle}><span style={{ fontWeight: 'bold', color: C.navy }}>{u.nombre}</span></td>
                    <td style={tdStyle}><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{u.usuario}</code></td>
                    <td style={tdStyle}><RolBadge rol={u.rol} /></td>
                    <td style={tdStyle}><span style={{ fontSize: 12, color: C.gray }}>{u.email}</span></td>
                    <td style={tdStyle}>
                      <button onClick={() => toggleActivo(u.id)} style={{ background: u.activo ? '#dcfce7' : '#fee2e2', color: u.activo ? '#16a34a' : '#dc2626', border: 'none', borderRadius: 12, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 'bold' }}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => setModal({ ...u })} style={btnSmall}><Pencil size={12} /></button>
                      <button onClick={() => eliminarUsuario(u.id)} style={{ ...btnSmall, marginLeft: 6, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'roles' && (
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.grayLight }}>
                <th style={thStyle}>ROL</th>
                {['MOD-1 Admin', 'MOD-2 Acad.', 'MOD-3 Generación', 'MOD-4 Horarios', 'MOD-5 Valid.', 'MOD-6 Reportes'].map(m => (
                  <th key={m} style={thStyle}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((rol, i) => {
                const perms = PERMISOS_ROL[rol] || [];
                return (
                  <tr key={rol} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                    <td style={tdStyle}><RolBadge rol={rol} /></td>
                    {['mod1','mod2','mod3','mod4','mod5','mod6'].map(m => (
                      <td key={m} style={{ ...tdStyle, textAlign: 'center' }}>
                        {perms.includes(m) ? <CheckCircle size={15} color="#16a34a" /> : <X size={15} color="#cbd5e1" />}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'configuracion' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Gestión Activa', valor: 'I/2026', desc: 'Periodo académico actual' },
            { label: 'Carrera', valor: 'Ing. de Sistemas', desc: 'Unidad académica' },
            { label: 'Semestres Activos', valor: '3°, 4°, 5°, 6°, 7°, 8°, 9°, 10°', desc: 'Semestres en el sistema' },
            { label: 'Horario', valor: '07:45 – 14:15', desc: 'Rango de clases diario' },
            { label: 'Periodos por día', valor: '8 periodos + 2 recesos', desc: 'Estructura de la jornada' },
            { label: 'Reglamento', valor: 'RAC-03', desc: 'Normativa aplicada' },
          ].map(c => (
            <div key={c.label} style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 18px' }}>
              <div style={{ fontSize: 11, color: C.gray, marginBottom: 4 }}>{c.desc}</div>
              <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 14 }}>{c.label}</div>
              <div style={{ color: C.gold, fontWeight: 'bold', marginTop: 4 }}>{c.valor}</div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <FormModal titulo={modal.id ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={() => setModal(null)} onGuardar={() => guardarUsuario(modal)}>
          <FormField label="Nombre Completo"><input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} /></FormField>
          <FormField label="Rol">
            <select value={modal.rol} onChange={e => setModal(m => ({ ...m, rol: e.target.value }))} style={inputStyle}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </FormField>
          {modal.id ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Usuario"><input value={modal.usuario} onChange={e => setModal(m => ({ ...m, usuario: e.target.value }))} style={inputStyle} /></FormField>
              <FormField label="Contrase?a"><input type="password" value={modal.password} onChange={e => setModal(m => ({ ...m, password: e.target.value }))} style={inputStyle} /></FormField>
            </div>
          ) : (
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, padding: 10, fontSize: 12, color: C.gray }}>
              Al guardar se generar?n autom?ticamente el usuario y la clave temporal a partir del nombre y rol.
            </div>
          )}
          <FormField label="Email Institucional"><input value={modal.email} onChange={e => setModal(m => ({ ...m, email: e.target.value }))} style={inputStyle} /></FormField>
          <FormField label="Asociar con Docente (HU-08)">
            <select value={modal.docenteId || ''} onChange={e => setModal(m => ({ ...m, docenteId: e.target.value || null }))} style={inputStyle}>
              <option value="">Sin docente asociado</option>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </FormField>
          <FormField label="Estado">
            <select value={modal.activo ? 'activo' : 'inactivo'} onChange={e => setModal(m => ({ ...m, activo: e.target.value === 'activo' }))} style={inputStyle}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}

export function RolBadge({ rol }) {
  const colors = { 'Administrador': [C.navy, C.gold], 'Jefe de Carrera': [C.green, '#dcfce7'], 'DDE': [C.blue, C.blueLight], 'Docente': [C.gray, C.grayLight] };
  const [bg, fg] = colors[rol] || [C.gray, C.grayLight];
  return <span style={{ background: fg, color: bg, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{rol}</span>;
}

// ==========================================
// MOD-2: GESTIÓN ACADÉMICA
// ==========================================
