import React from 'react';

export default function RegimeMap({ x = 50, y = 50, regimeText = "" }) {
  // Aseguramos que el punto quede dentro del mapa 0-100%
  const safeX = Math.max(0, Math.min(100, x));
  const safeY = Math.max(0, Math.min(100, y));

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
         <div>
           <h3 className="indicator-card-title" style={{ marginBottom: '4px' }}>Régimen de Mercado</h3>
           <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Estructura de Liquidez vs Volatilidad</p>
         </div>
      </div>
      
      <div className="regime-wrapper">
        <div className="regime-y-axis">Alta<br/>Vol.</div>
        <div className="regime-matrix">
          <div className="quadrant q-tl">Estrés</div>
          <div className="quadrant q-tr">Oportunidad Contraria</div>
          <div className="quadrant q-bl">Risk-on Débil</div>
          <div className="quadrant q-br">Risk-on</div>
          
          <div 
            className="position-marker"
            style={{ 
              left: `${safeX}%`,
              bottom: `${safeY}%`
            }}
          >
             <div className="marker-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="regime-x-axis">
        <span>Baja Liquidez</span>
        <span>Alta Liquidez</span>
      </div>

      {regimeText && (
        <div style={{ marginTop: '16px', textAlign: 'center', fontWeight: '600', color: 'var(--brand-primary)' }}>
          DB: {regimeText}
        </div>
      )}
    </div>
  );
}
