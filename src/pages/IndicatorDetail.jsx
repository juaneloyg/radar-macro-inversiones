import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { indicatorsData, getStatusFromScore } from '../data';
import { supabase } from '../lib/supabaseClient';

const TIME_RANGES = [
  { label: '1S', days: 7, desc: '1 semana' },
  { label: '1M', days: 30, desc: '1 mes' },
  { label: '3M', days: 90, desc: '3 meses' },
  { label: '6M', days: 180, desc: '6 meses' },
  { label: 'YTD', days: 'YTD', desc: 'Year-to-Date' },
  { label: '1A', days: 365, desc: '1 año' },
  { label: '2A', days: 730, desc: '2 años' },
  { label: '3A', days: 1095, desc: '3 años' },
  { label: '5A', days: 1825, desc: '5 años' },
  { label: '10A', days: 3650, desc: '10 años' },
  { label: '25A', days: 9125, desc: '25 años' },
];

export default function IndicatorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeRange, setActiveRange] = useState(TIME_RANGES[1]); // Default 1M
  const [dbData, setDbData] = useState(null);
  const [fullHistory, setFullHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const baseIndicator = useMemo(() => indicatorsData.find(ind => ind.id === id), [id]);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // 1. Snapshot actual
      const { data: snapData } = await supabase.from('macro_snapshots').select('*').order('created_at', { ascending: false }).limit(1);
      if (snapData && snapData[0]) setDbData(snapData[0]);

      // 2. Historial de este indicador (max 9500 dias / 25 yrs)
      let allRows = [];
      let from = 0;
      let step = 1000;
      while (allRows.length < 9500) {
         const { data: hist } = await supabase
           .from('macro_history')
           .select('date, value')
           .eq('indicator_id', id)
           .order('date', { ascending: false })
           .range(from, from + step - 1);
           
         if (!hist || hist.length === 0) break;
         allRows = allRows.concat(hist);
         if (hist.length < step) break;
         from += step;
      }
      
      allRows.reverse();
      setFullHistory(allRows);
      setLoading(false);
    }
    
    if (id) fetchData();
  }, [id]);

  const indicator = useMemo(() => {
    if (!baseIndicator || !dbData) return baseIndicator;
    let realValue = baseIndicator.value;
    let subscore = baseIndicator.subscore;

    if (id === 'liquidez') { realValue = dbData.liquidity; subscore = dbData.liquidity; }
    if (id === 'vix') { realValue = dbData.vix; subscore = 100 - dbData.vix; }
    if (id === 'credito') { realValue = dbData.credit_spreads; subscore = 100 - dbData.credit_spreads; }
    if (id === 'tipos') { realValue = dbData.interest_rates; subscore = dbData.interest_rates; }
    if (id === 'curva') { realValue = dbData.yield_curve; subscore = dbData.yield_curve; }
    if (id === 'dolar') { realValue = dbData.dxy; subscore = 100 - dbData.dxy; }
    if (id === 'inflacion') { realValue = dbData.inflation; subscore = 100 - dbData.inflation; }
    if (id === 'crecimiento') { realValue = dbData.growth; subscore = dbData.growth; }

    return { ...baseIndicator, value: realValue, subscore };
  }, [baseIndicator, dbData, id]);

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

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-secondary)' }}>Cargando datos históricos de mercado...</div>;
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

  // Process data for the chart: slicing and downsampling
  const chartData = useMemo(() => {
    if (!fullHistory || fullHistory.length === 0) return [];
    
    let targetDays = activeRange.days;
    if (targetDays === 'YTD') {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      targetDays = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
    }
    
    const totalData = fullHistory.length;
    const itemsToTake = Math.min(targetDays, totalData);
    
    let sliced = fullHistory.slice(-itemsToTake);
    
    // Downsample to max 300 points to keep animations and SVG rendering super fast
    const MAX_POINTS = 300;
    if (sliced.length > MAX_POINTS) {
      const step = Math.ceil(sliced.length / MAX_POINTS);
      sliced = sliced.filter((_, i) => i % step === 0);
    }
    
    return sliced;
  }, [fullHistory, activeRange]);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Evolución Histórica ({activeRange.desc})</h3>
          
          <div style={{ display: 'flex', gap: '4px', background: 'var(--surface-color)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            {TIME_RANGES.map((range) => (
              <button
                key={range.label}
                onClick={() => setActiveRange(range)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: activeRange.label === range.label ? 'var(--brand-primary)' : 'transparent',
                  color: activeRange.label === range.label ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all var(--transition-speed)'
                }}
                title={range.desc}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartFillColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartFillColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
            <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={80} padding={{ top: 20, bottom: 20 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
              itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
              labelStyle={{ color: 'var(--text-secondary)', marginBottom: '8px' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={chartColor} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
