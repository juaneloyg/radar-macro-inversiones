import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  Target,
  AlertCircle,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

import { getStatusFromScore, indicatorsData as fallbackIndicators } from '../data';
import IndicatorCard from '../components/IndicatorCard';
import RegimeMap from '../components/RegimeMap';

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getMacroInterpretation(score, inflation, growth) {
  if (score >= 65) {
    if (inflation <= 45 && growth >= 60) {
      return 'El entorno macroeconómico presenta condiciones expansivas y relativamente equilibradas. La liquidez es favorable, el crecimiento aguanta y la inflación no está generando una presión excesiva. El contexto acompaña una búsqueda más abierta de oportunidades en renta variable.';
    }
    return 'El entorno macroeconómico es favorable, aunque no perfecto. Hay soporte para asumir riesgo de forma moderada, pero conviene vigilar especialmente la inflación y la evolución del crecimiento para evitar complacencia.';
  }

  if (score >= 45) {
    if (inflation > 55 && growth < 50) {
      return 'El mercado se encuentra en una zona intermedia pero incómoda: crecimiento debilitándose e inflación todavía exigente. La selección de activos debe ser más rigurosa, priorizando calidad, caja y margen de seguridad.';
    }
    return 'El entorno es mixto. Existen elementos de apoyo, pero también focos de incertidumbre. Tiene sentido mantener una postura selectiva, combinando prudencia con búsqueda táctica de valor donde el castigo sea excesivo.';
  }

  return 'Las condiciones macro son defensivas. La combinación de presión financiera, menor soporte de liquidez o dudas sobre crecimiento e inflación aconseja proteger capital y elevar mucho la exigencia en cualquier inversión nueva.';
}

function getInflationLabel(inflation) {
  if (inflation >= 65) return 'Presión elevada';
  if (inflation >= 45) return 'Zona intermedia';
  return 'Controlada';
}

function getGrowthLabel(growth) {
  if (growth >= 65) return 'Sólido';
  if (growth >= 45) return 'Mixto';
  return 'Débil';
}

function generateMacroPrompt(data, score, statusText) {
  const interpretation =
    score >= 65
      ? 'Entorno favorable para asumir riesgo de forma moderada.'
      : score >= 45
        ? 'Entorno neutral o mixto: conviene ser selectivo y exigir mayor margen de seguridad.'
        : 'Entorno defensivo: priorizar preservación de capital y negocios muy resistentes.';

  const regimeLine =
    data.regime
      ? `- Régimen de mercado actual: ${data.regime}`
      : '- Régimen de mercado actual: no determinado';

  return `CONTEXTO MACRO ACTUAL

- Score macro: ${score}/100
- Estado general: ${statusText}
${regimeLine}
- Liquidez: ${data.liquidity}
- Volatilidad (VIX): ${data.vix}
- Crédito (spreads): ${data.credit_spreads}
- Tipos de interés: ${data.interest_rates}
- Curva de tipos: ${data.yield_curve}
- Dólar (DXY): ${data.dxy}
- Inflación / expectativas: ${data.inflation}
- Crecimiento / sorpresa macro: ${data.growth}

LECTURA DEL ENTORNO
${interpretation}

INSTRUCCIONES PARA LA BÚSQUEDA
Usa este contexto macro para adaptar la búsqueda de oportunidades value globales.

Reglas de adaptación:
- Si el entorno es favorable, puedes permitir algo más de exposición a negocios cíclicos o en recuperación, siempre que mantengan balance sólido, generación de caja y margen de seguridad.
- Si el entorno es neutral, prioriza empresas de calidad, con descuento claro, caja consistente y baja deuda.
- Si el entorno es defensivo, prioriza compañías muy sólidas, poco apalancadas, con fuerte flujo de caja y menor sensibilidad al ciclo.

OBJETIVO
Busca acciones globales infravaloradas injustamente según criterios value, incluyendo grandes, medianas y pequeñas capitalizaciones, pero ajustando el perfil de riesgo al contexto macro actual indicado arriba.`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [macroData, setMacroData] = useState(null);
  const [macroHistory, setMacroHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

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
        console.error('Error cargando datos snapshot:', error);
        setErrorMsg(error.message || 'Error de conexión a la base de datos');
      } else {
        setMacroData(data?.[0] ?? null);
      }

      // Descargamos los últimos 800 puntos del historial (unos 100 días para cada uno de los 8 indicadores)
      const { data: histData, error: histError } = await supabase
        .from('macro_history')
        .select('date, indicator_id, value')
        .order('date', { ascending: false })
        .limit(800);

      if (histData) {
        const grouped = {};
        // Invertimos para que el gráfico vaya de antiguo a nuevo
        histData.reverse().forEach(row => {
          if (!grouped[row.indicator_id]) grouped[row.indicator_id] = [];
          grouped[row.indicator_id].push({ date: row.date, value: row.value });
        });
        setMacroHistory(grouped);
      } else if (histError) {
        console.error('Error cargando historial:', histError);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const derived = useMemo(() => {
    if (!macroData) return null;

    const liquidity = safeNumber(macroData.liquidity);
    const vix = safeNumber(macroData.vix);
    const credit = safeNumber(macroData.credit_spreads);
    const rates = safeNumber(macroData.interest_rates);
    const curve = safeNumber(macroData.yield_curve);
    const dxy = safeNumber(macroData.dxy);
    const inflation = safeNumber(macroData.inflation, 50);
    const growth = safeNumber(macroData.growth, 50);

    // Score extendido con 8 factores
    const computedScore = clampScore(
      liquidity * 0.20 +
      (100 - vix) * 0.15 +
      (100 - credit) * 0.10 +
      rates * 0.10 +
      curve * 0.10 +
      (100 - dxy) * 0.10 +
      (100 - inflation) * 0.10 +
      growth * 0.15
    );

    const status = getStatusFromScore(computedScore);

    const weightedBreakdown = [
      { id: 'liquidez', name: 'Liquidez Global', weight: 20, scoreBase: liquidity, contribution: ((liquidity * 20) / 100).toFixed(1) },
      { id: 'vix', name: 'Volatilidad (VIX)', weight: 15, scoreBase: (100 - vix), contribution: (((100 - vix) * 15) / 100).toFixed(1) },
      { id: 'credito', name: 'Crédito (Spreads)', weight: 10, scoreBase: (100 - credit), contribution: (((100 - credit) * 10) / 100).toFixed(1) },
      { id: 'tipos', name: 'Tipos de Interés', weight: 10, scoreBase: rates, contribution: ((rates * 10) / 100).toFixed(1) },
      { id: 'curva', name: 'Curva de Tipos', weight: 10, scoreBase: curve, contribution: ((curve * 10) / 100).toFixed(1) },
      { id: 'dolar', name: 'Dólar (DXY)', weight: 10, scoreBase: (100 - dxy), contribution: (((100 - dxy) * 10) / 100).toFixed(1) },
      { id: 'inflacion', name: 'Inflación / Expectativas', weight: 10, scoreBase: (100 - inflation), contribution: (((100 - inflation) * 10) / 100).toFixed(1) },
      { id: 'crecimiento', name: 'Crecimiento / Sorpresa Macro', weight: 15, scoreBase: growth, contribution: ((growth * 15) / 100).toFixed(1) },
    ];

    const prompt = generateMacroPrompt(
      {
        ...macroData,
        liquidity,
        vix,
        credit_spreads: credit,
        interest_rates: rates,
        yield_curve: curve,
        dxy,
        inflation,
        growth
      },
      computedScore,
      status.text
    );

    return {
      liquidity,
      vix,
      credit,
      rates,
      curve,
      dxy,
      inflation,
      growth,
      computedScore,
      status,
      weightedBreakdown,
      prompt
    };
  }, [macroData]);

  if (loading) {
    return (
      <div
        className="dashboard-wrapper"
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <Activity size={48} color="var(--brand-primary)" style={{ opacity: 0.5, marginBottom: '24px' }} />
        <h2 style={{ color: 'var(--text-secondary)' }}>Sincronizando con Supabase...</h2>
      </div>
    );
  }

  if (errorMsg || !macroData || !derived) {
    return (
      <div className="dashboard-wrapper">
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '64px',
            margin: '64px auto',
            maxWidth: '600px',
            borderColor: 'var(--status-defensive)'
          }}
        >
          <AlertCircle size={64} color="var(--status-defensive)" style={{ marginBottom: '24px' }} />
          <h2 style={{ marginBottom: '16px', fontSize: '2rem' }}>Terminal Desconectada</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            {errorMsg
              ? `Error devuelto: ${errorMsg}`
              : 'No se encontraron registros en la tabla macro_snapshots. Asegúrate de insertar datos para continuar.'}
          </p>
        </div>
      </div>
    );
  }

  const score = derived.computedScore;
  const status = derived.status;

  const getInterpretationText = () => {
    return getMacroInterpretation(score, derived.inflation, derived.growth);
  };

  const realIndicators = fallbackIndicators.map((ind) => {
    let realValue = ind.value;
    let subscore = ind.subscore;

    if (ind.id === 'liquidez') {
      realValue = derived.liquidity;
      subscore = derived.liquidity;
    }
    if (ind.id === 'vix') {
      realValue = derived.vix;
      subscore = 100 - derived.vix;
    }
    if (ind.id === 'credito') {
      realValue = derived.credit;
      subscore = 100 - derived.credit;
    }
    if (ind.id === 'tipos') {
      realValue = derived.rates;
      subscore = derived.rates;
    }
    if (ind.id === 'curva') {
      realValue = derived.curve;
      subscore = derived.curve;
    }
    if (ind.id === 'dolar') {
      realValue = derived.dxy;
      subscore = 100 - derived.dxy;
    }
    if (ind.id === 'inflacion') {
      realValue = derived.inflation;
      subscore = 100 - derived.inflation;
    }
    if (ind.id === 'crecimiento') {
      realValue = derived.growth;
      subscore = derived.growth;
    }

    const hist = macroHistory?.[ind.id] || ind.history;
    const latestDate = hist?.[hist.length - 1]?.date;

    // Calcular variación de últimos 7 días
    let changeText = ind.change;
    let changeType = ind.changeType;

    if (macroHistory && macroHistory[ind.id] && macroHistory[ind.id].length > 0) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - 7);

      let closest = hist[0];
      let minDiff = Infinity;
      for (const h of hist) {
        const diff = Math.abs(new Date(h.date) - targetDate);
        if (diff < minDiff) {
          minDiff = diff;
          closest = h;
        }
      }

      const oldVal = closest.value;
      const currentVal = hist[hist.length - 1]?.value;
      if (oldVal && oldVal !== 0 && currentVal !== undefined) {
        const diff = currentVal - oldVal;
        const pct = (diff / oldVal) * 100;

        if (Math.abs(pct) < 0.001) {
          changeType = 'flat';
        } else {
          changeType = pct > 0 ? 'up' : 'down';
        }

        // Siempre usamos porcentaje para consistencia
        changeText = `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%`;
      }
    }

    return { ...ind, value: realValue, subscore, history: hist, change: changeText, changeType: changeType, date: latestDate };
  });

  // Calcular la fecha de la última sincronización general
  const lastSyncDate = useMemo(() => {
    if (!macroHistory) return null;
    let maxTime = 0;
    Object.values(macroHistory).forEach(hArray => {
      if (hArray.length) {
        const last = new Date(hArray[hArray.length - 1].date).getTime();
        if (last > maxTime) maxTime = last;
      }
    });
    if (maxTime === 0) return null;
    return new Date(maxTime).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }, [macroHistory]);

  const liquidezInd = realIndicators.find((i) => i.id === 'liquidez');
  const otherIndicators = realIndicators.filter((i) => i.id !== 'liquidez');

  const getChangeColor = (ind) => {
    switch (ind.changeType) {
      case 'up':
        return ind.id === 'vix' ? 'var(--status-defensive)' : 'var(--status-favorable)';
      case 'down':
        return ind.id === 'vix' ? 'var(--status-favorable)' : 'var(--status-defensive)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const IconChange = ({ ind }) => {
    switch (ind.changeType) {
      case 'up':
        return <ArrowUpRight size={20} color={getChangeColor(ind)} />;
      case 'down':
        return <ArrowDownRight size={20} color={getChangeColor(ind)} />;
      default:
        return <Minus size={20} color={getChangeColor(ind)} />;
    }
  };

  const visualX = Math.min(100, Math.max(0, score + 10));
  const visualY = Math.min(100, Math.max(0, 100 - score + 10));

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(derived.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error('No se pudo copiar el prompt:', error);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-modern" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 className="dashboard-title">Radar Macro</h1>
          <p className="dashboard-subtitle">
            Análisis del contexto de mercado y posicionamiento recomendado
          </p>
        </div>

        {lastSyncDate && (
          <div className="last-sync-badge" style={{
            background: 'var(--surface-highlight)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid var(--border-light)',
            marginBottom: '8px',
            fontWeight: 600
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-favorable)', boxShadow: '0 0 8px var(--status-favorable)' }}></div>
            Sincronizado: {lastSyncDate}
          </div>
        )}
      </div>

      <div className="score-hero">
        <div className="hero-left">
          <h2
            style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
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
            {getInterpretationText()}
          </p>
        </div>

        <div className="hero-right">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Desglose Ponderado
          </h3>

          <div style={{ paddingRight: '20px' }}>
            {derived.weightedBreakdown.map((ind) => (
              <div className="breakdown-row" key={ind.id}>
                <div>
                  <div style={{ fontWeight: 600 }}>{ind.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Peso: {ind.weight}%
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  +{ind.contribution}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="middle-section">
        <div className="card" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} color="var(--brand-primary)" />
              <h3 style={{ margin: 0 }}>Prompt para tu GEM</h3>
            </div>

            <button
              onClick={handleCopyPrompt}
              style={{
                border: '1px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--text-primary)',
                borderRadius: '10px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <textarea
            value={derived.prompt}
            readOnly
            style={{
              width: '100%',
              flex: 1,
              minHeight: '200px',
              background: 'rgba(255,255,255,0.03)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px',
              resize: 'none',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              lineHeight: 1.5
            }}
          />
        </div>

        <div>
          <RegimeMap x={visualX} y={visualY} regimeText={macroData.regime} />
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <h2 className="section-title">
          <Activity size={24} color="var(--text-secondary)" />
          Indicadores del Sistema
        </h2>

        <div className="modern-grid">
          {/* Liquidez Global ahora es el primero de la lista */}
          {realIndicators.map((ind) => (
            <IndicatorCard key={ind.id} indicator={ind} />
          ))}
        </div>
      </div>
    </div>
  );
}