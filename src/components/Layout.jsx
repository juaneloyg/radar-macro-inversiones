import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart3, TrendingUp, DollarSign, Activity, Percent, Compass } from 'lucide-react';
import { indicatorsData } from '../data';

const iconMap = {
  liquidez: <DollarSign size={18} />,
  vix: <Activity size={18} />,
  credito: <TrendingUp size={18} />,
  tipos: <Percent size={18} />,
  curva: <BarChart3 size={18} />,
  dolar: <DollarSign size={18} />
};

export default function Layout() {
  return (
    <div className="app-container">
      <aside className="sidebar">
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
