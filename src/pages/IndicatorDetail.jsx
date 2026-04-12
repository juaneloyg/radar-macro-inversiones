import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { indicatorsData, getStatusFromScore } from '../data';

export default function IndicatorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const indicator = useMemo(() => indicatorsData.find(ind => ind.id === id), [id]);

  if (!indicator) {
    return (
      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <h2>Indicador no encontrado</h2>
        <button className="back-btn" onClick={() => navigate('/')} style={{ marginTop: '20px', width: 'auto', padding: '0 20px', borderRadius: '20px' }}>
          Volver al Dashboard
        </button>
      </div>
    );
  }

  const statusInfo = getStatusFromScore(indicator.subscore);

  const getChangeColor = () => {
    switch (indicator.changeType) {
      case 'up': return indicator.id === 'vix' ? 'var(--status-defensive)' : 'var(--status-favorable)';
      case 'down': return indicator.id === 'vix' ? 'var(--status-favorable)' : 'var(--status-defensive)';
      default: return 'var(--text-secondary)';
    }
  };

  const IconChange = () => {
    switch (indicator.changeType) {
      case 'up': return <ArrowUpRight size={20} color={getChangeColor()} />;
      case 'down': return <ArrowDownRight size={20} color={getChangeColor()} />;
      default: return <Minus size={20} color={getChangeColor()} />;
    }
  };

  const chartColor = {
    'favorable': 'var(--status-favorable)',
    'neutral': 'var(--status-neutral)',
    'defensive': 'var(--status-defensive)'
  }[indicator.status] || 'var(--brand-primary)';

  const chartFillColor = {
    'favorable': 'var(--status-favorable-dim)',
    'neutral': 'var(--status-neutral-dim)',
    'defensive': 'var(--status-defensive-dim)'
  }[indicator.status] || 'var(--brand-primary-dim)';

  return (
    <div>
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/')} title="Volver al Dashboard">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="dashboard-title" style={{ marginBottom: 0 }}>{indicator.detailName}</h1>
          <p className="dashboard-subtitle">{indicator.name}</p>
        </div>
      </div>

      <div className="detail-stats">
        <div className="stat-box">
          <div className="stat-label">Valor Actual</div>
          <div className="stat-value">{indicator.value}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Variación 24h</div>
          <div className="stat-value" style={{ color: getChangeColor(), display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IconChange /> {indicator.change}
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Estado</div>
          <div className="stat-value">
            <span className={`status-badge ${indicator.status}`} style={{ fontSize: '1rem', padding: '6px 16px' }}>
              {statusInfo.text}
            </span>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Subscore & Peso</div>
          <div className="stat-value">{indicator.subscore}/100</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Aporta {(indicator.subscore * indicator.weight / 100).toFixed(1)} pts ({indicator.weight}%)
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.1rem' }}>
            <Info size={18} color="var(--brand-primary)" />
            Acerca del Indicador
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {indicator.description}
          </p>
        </div>
      </div>

      <div className="detail-chart-container">
        <h3 style={{ marginBottom: '24px', fontSize: '1.1rem' }}>Evolución Histórica (30 Días)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={indicator.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartFillColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartFillColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={chartColor} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
