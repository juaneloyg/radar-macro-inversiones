import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus, Activity, Target } from 'lucide-react';
import { getMarketScore, getStatusFromScore, indicatorsData } from '../data';
import IndicatorCard from '../components/IndicatorCard';

import RegimeMap from '../components/RegimeMap';

export default function Dashboard() {
  const navigate = useNavigate();
  const score = getMarketScore();
  const status = getStatusFromScore(score);

  const getInterpretationText = (st) => {
    if (st.class === 'favorable') {
      return "El entorno macroeconómico presenta condiciones expansivas óptimas. La liquidez y los indicadores de estrés apoyan de manera sólida un posicionamiento ofensivo en renta variable y activos de crecimiento.";
    }
    if (st.class === 'neutral') {
      return "El mercado se encuentra en una fase de transición. Las señales mixtas sugieren mantener posiciones diversificadas, equilibrando la exposición táctica con activos defensivos para preservar capital.";
    }
    return "Condiciones macroeconómicas restrictivas y un notable estrés latente en el mercado. Se recomienda encarecidamente priorizar la preservación de capital y reducir la exposición a la volatilidad.";
  };

  const liquidezInd = indicatorsData.find(i => i.id === 'liquidez');
  const otherIndicators = indicatorsData.filter(i => i.id !== 'liquidez');

  const getChangeColor = (ind) => {
    switch (ind.changeType) {
      case 'up': return ind.id === 'vix' ? 'var(--status-defensive)' : 'var(--status-favorable)';
      case 'down': return ind.id === 'vix' ? 'var(--status-favorable)' : 'var(--status-defensive)';
      default: return 'var(--text-secondary)';
    }
  };

  const IconChange = ({ ind }) => {
    switch (ind.changeType) {
      case 'up': return <ArrowUpRight size={20} color={getChangeColor(ind)} />;
      case 'down': return <ArrowDownRight size={20} color={getChangeColor(ind)} />;
      default: return <Minus size={20} color={getChangeColor(ind)} />;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-modern">
        <h1 className="dashboard-title">Radar Macro</h1>
        <p className="dashboard-subtitle">Análisis del contexto de mercado y posicionamiento recomendado</p>
      </div>

      {/* 1. HERO MAIN ELEMENT - SCORE TOTAL */}
      <div className="score-hero">
        <div className="hero-left">
          <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Score de Mercado
          </h2>
          <div className={`score-giant-value score-${status.class}`}>
            {score}
          </div>
          <div>
            <span className={`status-badge ${status.class}`}>
              Escenario {status.text}
            </span>
          </div>
          <p className="interpretation-text">
            {getInterpretationText(status)}
          </p>
        </div>
        
        <div className="hero-right">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: 'var(--text-primary)' }}>
            Desglose Ponderado
          </h3>
          <div style={{ paddingRight: '20px' }}>
            {indicatorsData.map(ind => {
              const contribution = ((ind.subscore * ind.weight) / 100).toFixed(1);
              return (
                <div className="breakdown-row" key={ind.id}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{ind.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Peso: {ind.weight}%</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    +{contribution}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION (Featured Card + Regime Map) */}
      <div className="middle-section">
        {liquidezInd && (
          <div>
            <h2 className="section-title">
              <Target size={24} color="var(--brand-primary)" />
              Monitor Principal
            </h2>
            <div className="featured-card" onClick={() => navigate(`/indicator/liquidez`)}>
              <div className="featured-info">
                <span className="indicator-card-weight">Peso en Score: {liquidezInd.weight}%</span>
                <h3 className="indicator-card-title">{liquidezInd.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '12px', marginBottom: '8px' }}>
                  <span className="indicator-card-value">{liquidezInd.value}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: getChangeColor(liquidezInd), fontWeight: 600 }}>
                  <IconChange ind={liquidezInd} /> {liquidezInd.change}
                </div>
              </div>
              <div className="featured-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={liquidezInd.history}>
                    <defs>
                      <linearGradient id="colorLiquidez" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis domain={['auto', 'auto']} hide />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--brand-primary)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorLiquidez)" 
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* REGIME MAP */}
        <div>
          <h2 className="section-title" style={{ opacity: 0 }}>
            {/* Espaciador para alinear con el título de Monitor Principal */}
            .
          </h2>
          <RegimeMap />
        </div>
      </div>

      {/* 3. SECONDARY INDICATORS GRID */}
      <div>
        <h2 className="section-title">
          <Activity size={24} color="var(--text-secondary)" />
          Indicadores Complementarios
        </h2>
        <div className="modern-grid">
          {otherIndicators.map((ind) => (
            <IndicatorCard key={ind.id} indicator={ind} />
          ))}
        </div>
      </div>
    </div>
  );
}
