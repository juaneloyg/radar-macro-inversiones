import React from 'react';
import { indicatorsData } from '../data';

export default function RegimeMap() {
  const liquidezInd = indicatorsData.find(i => i.id === 'liquidez');
  const vixInd = indicatorsData.find(i => i.id === 'vix');

  // subscore es de 0 a 100, mayor es más favorable.
  // Liquidez X: 0 = baja, 100 = alta
  const x = liquidezInd?.subscore || 50; 
  
  // Volatilidad Y: 0 = baja volatilidad, 100 = alta volatilidad
  // El VIX subscore mayor = favorable = baja volatilidad. Por ende invertimos para sacar la "volatilidad" bruta.
  const y = 100 - (vixInd?.subscore || 50);

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
              left: `${x}%`,
              bottom: `${y}%`
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
    </div>
  );
}
