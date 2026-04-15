import React, { useMemo, useState, useEffect } from 'react';
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
  { label: '10A', days: 3650, desc: '10 años (Máx)' },
];

const safeNumber = (val, fallback = 0) => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

export default function IndicatorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeRange, setActiveRange] = useState(TIME_RANGES[1]);
  const [dbSnap, setDbSnap] = useState(null);
  const [dbHistory, setDbHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);

  const baseIndicator = useMemo(() => {
    return indicatorsData.find(ind => ind.id === id) || null;
  }, [id]);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      setErrorStatus(null);

      try {
        const { data: snap, error: snapErr } = await supabase
          .from('macro_snapshots')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (snapErr) throw snapErr;
        if (snap && snap[0]) setDbSnap(snap[0]);

        const ranges = [
          [0, 999], [1000, 1999], [2000, 2999], [3000, 3999], [4000, 4999]
        ];

        const results = await Promise.all(ranges.map(([from, to]) =>
          supabase
            .from('macro_history')
            .select('date, value')
            .eq('indicator_id', id)
            .order('date', { ascending: false })
            .range(from, to)
        ));

        let allHist = [];
        for (const { data, error } of results) {
          if (error) throw error;
          if (data) allHist = [...allHist, ...data];
        }

        // Ordenar por fecha ascendente para Recharts
        const sortedHist = allHist.sort((a, b) => new Date(a.date) - new Date(b.date));
        setDbHistory(sortedHist);

      } catch (err) {
        console.error("Critical Fetch Error:", err);
        setErrorStatus("No se pudieron cargar los datos de la base de datos.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const indicator = useMemo(() => {
    if (!baseIndicator) return null;

    let realVal = baseIndicator.value;
    let realScore = baseIndicator.subscore;

    if (dbSnap) {
      const colMap = {
        'liquidez': { v: dbSnap.liquidity, s: dbSnap.liquidity },
        'vix': { v: dbSnap.vix, s: 100 - dbSnap.vix },
        'credito': { v: dbSnap.credit_spreads, s: 100 - dbSnap.credit_spreads },
        'tipos': { v: dbSnap.interest_rates, s: dbSnap.interest_rates },
        'curva': { v: dbSnap.yield_curve, s: dbSnap.yield_curve },
        'dolar': { v: dbSnap.dxy, s: 100 - dbSnap.dxy },
        'inflacion': { v: dbSnap.inflation, s: 100 - dbSnap.inflation },
        'crecimiento': { v: dbSnap.growth, s: dbSnap.growth }
      };

      if (colMap[id]) {
        realVal = colMap[id].v;
        realScore = safeNumber(colMap[id].s);
      }
    }

    // Calcular variación de últimos 7 días
    let changeText = baseIndicator.change;
    let changeType = baseIndicator.changeType;

    if (dbHistory && dbHistory.length > 0) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - 7);

      // Encontrar el registro más cercano a hace 7 días
      let closest = dbHistory[0];
      let minDiff = Infinity;

      for (const h of dbHistory) {
        const diff = Math.abs(new Date(h.date) - targetDate);
        if (diff < minDiff) {
          minDiff = diff;
          closest = h;
        }
      }

      const oldVal = closest.value;
      const currentVal = dbHistory[dbHistory.length - 1]?.value;

      if (oldVal && oldVal !== 0 && currentVal !== undefined) {
        const diff = currentVal - oldVal;
        const pct = (diff / oldVal) * 100;

        if (Math.abs(pct) < 0.01) {
          changeType = 'flat';
        } else {
          changeType = pct > 0 ? 'up' : 'down';
        }

        if (['tipos', 'curva', 'credito'].includes(id)) {
          const bps = Math.round(diff * 100);
          changeText = `${bps > 0 ? '+' : ''}${bps} bps`;
        } else if (id === 'crecimiento') {
          changeText = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`;
        } else {
          changeText = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
        }
      }
    }

    return {
      ...baseIndicator,
      value: realVal,
      subscore: realScore,
      change: changeText,
      changeType: changeType
    };
  }, [baseIndicator, dbSnap, dbHistory, id]);

  const chartData = useMemo(() => {
    if (!dbHistory || dbHistory.length === 0) return [];

    let targetDays = activeRange.days;
    if (targetDays === 'YTD') {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      targetDays = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
    }

    const sliced = dbHistory.slice(-targetDays);

    const MAX = 300;
    if (sliced.length > MAX) {
      const step = Math.ceil(sliced.length / MAX);
      return sliced.filter((_, i) => i % step === 0);
    }
    return sliced;
  }, [dbHistory, activeRange]);

  if (!baseIndicator) {
    return (
      <div className="status-container">
        <h2>Indicador no compatible</h2>
        <button className="back-btn" onClick={() => navigate('/')}>Volver</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="status-container" style={{ marginTop: '100px' }}>
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Sincronizando con Supabase...</p>
      </div>
    );
  }

  if (errorStatus) {
    return (
      <div className="status-container" style={{ color: 'var(--status-defensive)' }}>
        <h3>Error de sistema</h3>
        <p>{errorStatus}</p>
        <button className="back-btn" onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  const currentStatus = getStatusFromScore(indicator.subscore);

  const getChangeColor = () => {
    if (indicator.changeType === 'up') return indicator.id === 'vix' ? 'var(--status-defensive)' : 'var(--status-favorable)';
    if (indicator.changeType === 'down') return indicator.id === 'vix' ? 'var(--status-favorable)' : 'var(--status-defensive)';
    return 'var(--text-secondary)';
  };

  return (
    <div className="detail-view">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/')} title="Cerrar">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="dashboard-title" style={{ marginBottom: '4px' }}>{indicator.detailName}</h1>
          <p className="dashboard-subtitle">{indicator.name}</p>
        </div>
      </div>

      <div className="detail-stats">
        <div className="stat-box">
          <div className="stat-label">Valor Real</div>
          <div className="stat-value">{indicator.value}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Últimos 7 días</div>
          <div className="stat-value" style={{ color: getChangeColor(), display: 'flex', alignItems: 'center', gap: '4px' }}>
            {indicator.changeType === 'up' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
            {indicator.change}
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Interpretación</div>
          <div className="stat-value">
            <span className={`status-badge ${currentStatus.class}`}>
              {currentStatus.text}
            </span>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Subscore vs Peso</div>
          <div className="stat-value">{Math.round(indicator.subscore)}/100</div>
          <div className="stat-subtext">Ponderación: {indicator.weight}%</div>
        </div>
      </div>

      <div className="card description-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={18} color="var(--brand-primary)" />
          Fundamentos del Indicador
        </h3>
        <p>{indicator.description}</p>
      </div>

      <div className="detail-chart-container">
        <div className="chart-controls">
          <h3 className="chart-title">Evolución ({activeRange.desc})</h3>
          <div className="range-picker">
            {TIME_RANGES.map((r) => (
              <button
                key={r.label}
                className={`range-btn ${activeRange.label === r.label ? 'active' : ''}`}
                onClick={() => setActiveRange(r)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: '100%', height: 380 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--status-${currentStatus.class}-dim)`} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={`var(--status-${currentStatus.class}-dim)`} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--text-muted)"
                fontSize={11}
                minTickGap={40}
                tickFormatter={(val) => {
                  try {
                    const d = new Date(val);
                    if (activeRange.days <= 31) return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                    if (activeRange.days <= 366) return d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
                    return d.toLocaleDateString('es-ES', { year: 'numeric' });
                  } catch (e) { return val; }
                }}
              />
              <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" fontSize={11} width={40} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={`var(--status-${currentStatus.class})`}
                strokeWidth={3}
                fill="url(#gradientColor)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {chartData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No hay suficientes datos históricos para este periodo en Supabase.
          </div>
        )}
      </div>
    </div>
  );
}
