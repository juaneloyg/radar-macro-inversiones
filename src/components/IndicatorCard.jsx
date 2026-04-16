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

  // Detectar si el dato es antiguo (más de 48h)
  const isStale = React.useMemo(() => {
    if (!indicator.date) return false;
    const date = new Date(indicator.date);
    const now = new Date();
    const diffHours = Math.abs(now - date) / (1000 * 60 * 60);
    return diffHours > 48;
  }, [indicator.date]);

  const formattedDate = indicator.date
    ? new Date(indicator.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    : null;

  return (
    <div className="card indicator-card" onClick={() => navigate(`/indicator/${indicator.id}`)}>
      <div className="indicator-card-header" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 className="indicator-card-title" style={{ margin: 0 }}>{indicator.name}</h3>
          {formattedDate && (
            <div style={{
              fontSize: '0.7rem',
              color: isStale ? 'var(--status-defensive)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '2px',
              fontWeight: isStale ? 700 : 500
            }}>
              {isStale && <AlertCircle size={10} />}
              Dato del {formattedDate} {isStale && '(Antiguo)'}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>los últimos 7 días</span>
          <span className="indicator-card-weight" style={{ margin: 0 }}>Peso: {indicator.weight}%</span>
        </div>
      </div>

      <div className="indicator-card-value-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="indicator-card-value">{indicator.value}</span>
        <div className="indicator-card-change" style={{ color: getChangeColor(), display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.9rem', fontWeight: 600 }}>
          <IconChange /> {indicator.change} <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: '2px' }}>7d</span>
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
