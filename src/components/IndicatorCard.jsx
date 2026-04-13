import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function IndicatorCard({ indicator }) {
  const navigate = useNavigate();

  const getChangeColor = () => {
    switch (indicator.changeType) {
      case 'up': return indicator.id === 'vix' ? 'var(--status-defensive)' : 'var(--status-favorable)';
      case 'down': return indicator.id === 'vix' ? 'var(--status-favorable)' : 'var(--status-defensive)';
      default: return 'var(--text-secondary)';
    }
  };

  const IconChange = () => {
    switch (indicator.changeType) {
      case 'up': return <ArrowUpRight size={16} color={getChangeColor()} />;
      case 'down': return <ArrowDownRight size={16} color={getChangeColor()} />;
      default: return <Minus size={16} color={getChangeColor()} />;
    }
  };

  // Determinar color base para gráfico chiquitito basado en su status general
  const getChartColor = () => {
    switch (indicator.status) {
      case 'favorable': return 'var(--status-favorable)';
      case 'neutral': return 'var(--status-neutral)';
      case 'defensive': return 'var(--status-defensive)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="card indicator-card" onClick={() => navigate(`/indicator/${indicator.id}`)}>
      <div className="indicator-card-header" style={{ marginBottom: '12px' }}>
        <h3 className="indicator-card-title">{indicator.name}</h3>
        <span className="indicator-card-weight">Peso: {indicator.weight}%</span>
      </div>
      
      <div className="indicator-card-value-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="indicator-card-value">{indicator.value}</span>
        <div className="indicator-card-change" style={{ color: getChangeColor(), display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.9rem', fontWeight: 600 }}>
          <IconChange /> {indicator.change}
        </div>
      </div>
      
      <div className="indicator-chart-small">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={indicator.history.slice(-30)}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={getChartColor()} 
              strokeWidth={2} 
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
