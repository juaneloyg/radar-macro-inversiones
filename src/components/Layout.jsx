import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, TrendingUp, DollarSign, Activity, Percent, Compass, Flame, LineChart, Menu, X } from 'lucide-react';
import { indicatorsData } from '../data';

const iconMap = {
  liquidez: <DollarSign size={18} />,
  vix: <Activity size={18} />,
  credito: <TrendingUp size={18} />,
  tipos: <Percent size={18} />,
  curva: <BarChart3 size={18} />,
  dolar: <DollarSign size={18} />,
  inflacion: <Flame size={18} />,
  crecimiento: <LineChart size={18} />
};

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Cerrar el menú automáticamente cuando cambia la ruta (navegación)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <div className={`app-container ${isMenuOpen ? 'menu-open' : ''}`}>
      {/* Mobile Header Bar */}
      <header className="mobile-header">
        <div className="sidebar-title">
          <Activity color="var(--brand-primary)" />
          Radar Macro
        </div>
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Overlay for mobile menu */}
      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}

      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <Activity color="var(--brand-primary)" />
            Radar Macro
          </div>
        </div>
        <nav className="sidebar-nav">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            end
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink 
            to="/assets" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            <Compass size={18} />
            Explorador de Activos
          </NavLink>
          
          <div style={{ marginTop: '20px', marginBottom: '8px', paddingLeft: '12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Indicadores
          </div>
          
          {indicatorsData.map((ind) => (
            <NavLink
              key={ind.id}
              to={`/indicator/${ind.id}`}
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              {iconMap[ind.id]}
              {ind.name}
            </NavLink>
          ))}
        </nav>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
