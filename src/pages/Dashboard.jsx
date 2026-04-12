import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus, Activity, Target, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

import { getStatusFromScore, indicatorsData as fallbackIndicators } from '../data';
import IndicatorCard from '../components/IndicatorCard';
import RegimeMap from '../components/RegimeMap';

export default function Dashboard() {
  const navigate = useNavigate();
  const [macroData, setMacroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg('');

      const { data, error } = await supabase
        .from('macro_snapshots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error cargando datos:', error);
        setErrorMsg(error.message || 'Error de conexión a la base de datos');
      } else {
        console.log('Datos de Supabase:', data);
        setMacroData(data?.[0] ?? null);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-wrapper" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Activity size={48} color="var(--brand-primary)" style={{ opacity: 0.5, marginBottom: '24px' }} />
        <h2 style={{ color: 'var(--text-secondary)' }}>Sincronizando con Supabase...</h2>
      </div>
    );
  }

  if (errorMsg || !macroData) {
    return (
      <div className="dashboard-wrapper">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '64px', margin: '64px auto', maxWidth: '600px', borderColor: 'var(--status-defensive)' }}>
          <AlertCircle size={64} color="var(--status-defensive)" style={{ marginBottom: '24px' }} />
          <h2 style={{ marginBottom: '16px', fontSize: '2rem' }}>Terminal Desconectada</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            {errorMsg ? `Error devuelto: ${errorMsg}` : 'No se encontraron registros en la tabla macro_snapshots. Asegúrate de insertar datos para continuar.'}
          </p>
        </div>
      </div>
    );
  }

  // --- Mapeo de Datos Base de Supabase a la Interfaz ---
  const score = macroData.score || 0;
  const status = getStatusFromScore(score);

  const getInterpretationText = (s) => {
    if (s >= 65) return "El entorno macroeconómico presenta condiciones expansivas óptimas. La liquidez y los indicadores de estrés apoyan de manera sólida un posicionamiento ofensivo en renta variable y activos de crecimiento.";
    if (s >= 45) return "El mercado se encuentra en una fase de transición. Las señales mixtas sugieren mantener posiciones diversificadas, equilibrando la exposición táctica con activos defensivos para preservar capital.";
    return "Condiciones macroeconómicas restrictivas y un notable estrés latente en el mercado. Se recomienda encarecidamente priorizar la preservación de capital y reducir la exposición a la volatilidad.";
  };

  // Reconstruimos la plantilla de indicadores inyectando los valores REALES de la base de datos
  const realIndicators = fallbackIndicators.map(ind => {
    let realValue = ind.value;
    if (ind.id === 'liquidez') realValue = macroData.liquidity ?? ind.value;
    if (ind.id === 'vix') realValue = macroData.vix ?? ind.value;
    if (ind.id === 'credito') realValue = macroData.credit_spreads ?? ind.value;
    if (ind.id === 'tipos') realValue = macroData.interest_rates ?? ind.value;
    if (ind.id === 'curva') realValue = macroData.yield_curve ?? ind.value;
    if (ind.id === 'dolar') realValue = macroData.dxy ?? ind.value;
    
    return { ...ind, value: realValue };
  });

  const liquidezInd = realIndicators.find(i => i.id === 'liquidez');
  const otherIndicators = realIndicators.filter(i => i.id !== 'liquidez');

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

  // Parámetros visuales del mapa de régimen. Como no sabemos el rango real de liquidez/vix
  // nos basamos en el score para dar un posicionamiento aproximado en la matriz X/Y
  const visualX = Math.min(100, Math.max(0, score + 10)); // proxy visual
  const visualY = Math.min(100, Math.max(0, 100 - score + 10));

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-modern">
        <h1 className="dashboard-title">Radar Macro</h1>
        <p className="dashboard-subtitle">Análisis del contexto de mercado y posicionamiento recomendado (Datos en vivo)</p>
      </div>

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
            {getInterpretationText(score)}
          </p>
        </div>
        
        <div className="hero-right">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: 'var(--text-primary)' }}>
            Desglose Ponderado
          </h3>
          <div style={{ paddingRight: '20px' }}>
            {realIndicators.map(ind => {
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

        <div>
          <h2 className="section-title" style={{ opacity: 0 }}>.</h2>
          <RegimeMap 
            x={visualX} 
            y={visualY} 
            regimeText={macroData.regime}
          />
        </div>
      </div>

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