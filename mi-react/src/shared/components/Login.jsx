import React, { useState } from 'react';
import { C } from '../constants';
import emiFoto from '../../assets/emi.jpg';

export function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      await onLogin({ usuario, password });
    } catch (err) {
      setError('Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* Imagen de fondo difuminada */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${emiFoto})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(3px) brightness(0.35)',
        transform: 'scale(1.05)',
      }} />

      {/* Overlay azul marino */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 25, 50, 0.65)' }} />

      {/* Línea dorada inferior */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: C.gold, zIndex: 2 }} />

      {/* Contenido */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400, padding: '0 20px' }}>

        {/* Tarjeta del formulario — logo adentro */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '36px 28px 32px',
          backdropFilter: 'blur(12px)',
        }}>

          {/* Logo y título DENTRO de la tarjeta */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 70, height: 70,
              background: C.gold,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              border: '3px solid rgba(200,168,75,0.3)',
              fontSize: 32,
            }}> 📆︎ </div>
            <div style={{ color: C.gold, fontWeight: 'bold', fontSize: 22, letterSpacing: 4, fontFamily: 'Georgia, serif' }}>SAGH — EMI</div>
            <div style={{ color: '#64748b', fontSize: 11, letterSpacing: 2, marginTop: 6 }}>SISTEMA AUTOMÁTICO DE GENERACIÓN DE HORARIOS</div>
            <div style={{ width: 40, height: 2, background: C.gold, margin: '14px auto 0', borderRadius: 1 }} />
          </div>
          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: 18 }}>
              <label style={{ color: '#94a3b8', fontSize: 10, letterSpacing: 2, display: 'block', marginBottom: 8 }}>USUARIO</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 16 }}>👤︎</span>
                <input
                  value={usuario}
                  onChange={e => setUsuario(e.target.value)}
                  placeholder="Ingrese su usuario"
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8, color: 'white', fontSize: 13,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  autoComplete="username"
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ color: '#94a3b8', fontSize: 10, letterSpacing: 2, display: 'block', marginBottom: 8 }}>CONTRASEÑA</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 16 }}>🔒︎</span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8, color: 'white', fontSize: 13,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div style={{ color: '#f87171', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={cargando}
              style={{
                width: '100%', padding: '14px',
                background: C.gold, color: C.navy,
                border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 'bold', letterSpacing: 3,
                cursor: cargando ? 'not-allowed' : 'pointer',
                opacity: cargando ? 0.7 : 1,
              }}
            >
              {cargando ? 'VERIFICANDO...' : 'INGRESAR'}
            </button>

          </form>

          {/* Pie institucional */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <span style={{ color: '#334155', fontSize: 11 }}>Escuela Militar de Ingeniería · La Paz, Bolivia</span>
          </div>
        </div>

      </div>
    </div>
  );
}