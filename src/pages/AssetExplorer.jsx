import React, { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, Activity, DollarSign, Percent, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { assetsData, getStatusFromScore } from '../data';
import { supabase } from '../lib/supabaseClient';

const TIME_RANGES = [
  { label: '1M', days: 30, desc: '1 mes' },
  { label: '6M', days: 180, desc: '6 meses' },
  { label: '1A', days: 365, desc: '1 año' },
  { label: '2A', days: 730, desc: '2 años' },
  { label: '3A', days: 1095, desc: '3 años' },
  { label: '5A', days: 1825, desc: '5 años' },
  { label: '10A', days: 3650, desc: '10 años' },
];

const categories = ["Todos", "Materias primas", "Macro Global", "Ciclo y Riesgo", "Ratios Macro", "Índices", "Bonos", "Criptomonedas"];

export default function AssetExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedAssetId, setSelectedAssetId] = useState(assetsData[0].id);
  const [activeRange, setActiveRange] = useState(TIME_RANGES[1]);
  const [dbHistory, setDbHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mapeo de ID de activo a ID de indicador en Supabase
  const assetSyncMap = {
    'gold': 'asset_gold',
    'silver': 'asset_silver',
    'copper': 'asset_copper',
    'brent': 'asset_brent',
    'crude': 'asset_crude',
    'natgas': 'asset_natgas',
    'wheat': 'asset_wheat',
    'corn': 'asset_corn',
    'soy': 'asset_soy',
    'btc': 'asset_btc',
    'ndx': 'asset_ndx',
    'sp500': 'asset_sp500',
    'vix': 'vix',
    'dxy': 'dolar',
    'us10y': 'tipos',
    'ffr': 'tipos' // Aproximación
  };

  const selectedAsset = assetsData.find(a => a.id === selectedAssetId);

  useEffect(() => {
    async function fetchHistory() {
      const syncId = assetSyncMap[selectedAssetId];
      if (!syncId) {
        setDbHistory([]);
        return;
      }

      setLoading(true);
      try {
        const ranges = [
          [0, 999], [1000, 1999], [2000, 2999], [3000, 3999], [4000, 4999],
          [5000, 5999], [6000, 6999], [7000, 7999], [8000, 8999], [9000, 9999]
        ];

        const results = await Promise.all(ranges.map(([from, to]) =>
          supabase
            .from('macro_history')
            .select('date, value')
            .eq('indicator_id', syncId)
            .order('date', { ascending: false })
            .range(from, to)
        ));

        let allHist = [];
        for (const { data, error } of results) {
          if (error) throw error;
          if (data) allHist = [...allHist, ...data];
        }

        setDbHistory(allHist.sort((a, b) => new Date(a.date) - new Date(b.date)));
      } catch (err) {
        console.error("Error fetching asset history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [selectedAssetId]);

  const chartData = useMemo(() => {
    if (!dbHistory.length) return [];

    // Filtrar por rango
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - activeRange.days);

    const filtered = dbHistory.filter(h => new Date(h.date) >= targetDate);

    // Muestreo para mayor rendimiento
    const MAX_POINTS = 200;
    if (filtered.length > MAX_POINTS) {
      const step = Math.ceil(filtered.length / MAX_POINTS);
      return filtered.filter((_, i) => i % step === 0);
    }
    return filtered;
  }, [dbHistory, activeRange]);

  const filteredAssets = assetsData.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "Todos" || asset.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getTrendIcon = (type) => {
    switch (type) {
      case 'up': return <TrendingUp size={18} className="change-up" />;
      case 'down': return <TrendingDown size={18} className="change-down" />;
      default: return <Minus size={18} className="change-flat" />;
    }
  };

  const getTrendColor = (type) => {
    switch (type) {
      case 'up': return 'var(--status-favorable)';
      case 'down': return 'var(--status-defensive)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-modern" style={{ marginBottom: '40px' }}>
        <h1 className="dashboard-title">Explorador de Activos</h1>
        <p className="dashboard-subtitle">Analiza el comportamiento esperado de activos ante el contexto macro actual</p>
      </div>

      {/* Top Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o ticker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 16px 16px 48px',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-color)',
              background: 'var(--surface-color)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--brand-primary)' : 'var(--border-color)',
                backgroundColor: selectedCategory === cat ? 'var(--brand-primary-dim)' : 'transparent',
                color: selectedCategory === cat ? 'var(--brand-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all var(--transition-speed)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Top Detail Panel (Selected Asset) */}
      {selectedAsset && (
        <div className="asset-detail-panel-top card" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px' }}>

            {/* Left Column: Summary & Behavior */}
            <div style={{ flex: '1 1 400px' }}>
              <div className="detail-panel-header" style={{ border: 'none', marginBottom: '20px', padding: 0 }}>
                <div className="detail-title-row">
                  <h2 className="detail-ticker">{selectedAsset.ticker}</h2>
                  <span className="detail-cat-badge">
                    {selectedAsset.category}
                  </span>
                </div>
                <p className="detail-asset-name" style={{ fontSize: '1.2rem', fontWeight: 600 }}>{selectedAsset.name}</p>
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)', marginBottom: '24px' }}>
                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  📌 {selectedAsset.id === 'gold' ? 'El oro sube con el miedo y baja cuando suben los tipos o el dólar.' : selectedAsset.expectedBehavior.split('.')[0] + '.'}
                </p>
              </div>

              <h4 className="detail-section-subtitle" style={{ fontSize: '0.9rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comportamiento Esperado</h4>
              <div className="behavior-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                <p className="behavior-text" style={{ fontSize: '0.95rem', margin: 0 }}>
                  {selectedAsset.expectedBehavior}
                </p>
              </div>

              {/* GRÁFICA DE EVOLUCIÓN */}
              <div className="asset-chart-container" style={{ background: 'var(--surface-highlight)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} /> Evolución del Precio
                  </h4>
                  <div className="range-picker-mini" style={{ display: 'flex', gap: '4px' }}>
                    {TIME_RANGES.map(r => (
                      <button
                        key={r.label}
                        onClick={() => setActiveRange(r)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.7rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          background: activeRange.label === r.label ? 'var(--brand-primary)' : 'transparent',
                          color: activeRange.label === r.label ? 'white' : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ width: '100%', height: '200px' }}>
                  {loading ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="loading-spinner-small"></div>
                    </div>
                  ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="assetGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                          dataKey="date"
                          stroke="var(--text-muted)"
                          fontSize={10}
                          tickFormatter={(val) => {
                            const d = new Date(val);
                            if (activeRange.days <= 180) return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                            return d.getFullYear();
                          }}
                          minTickGap={60} // Mayor brecha para evitar duplicados visuales del año
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          hide
                          domain={['auto', 'auto']}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                          labelFormatter={(val) => new Date(val).toLocaleDateString()}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="var(--brand-primary)"
                          strokeWidth={2}
                          fill="url(#assetGradient)"
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No hay datos históricos disponibles para este activo.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column: Visual Reactivity (Causa -> Efecto) */}
            <div style={{ flex: '1 1 350px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💡 Qué mueve {selectedAsset.id === 'gold' ? 'el oro' : `este activo`}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Bloque Bajista */}
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--status-defensive)' }}>
                  <h4 style={{ color: 'var(--status-defensive)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>🔴 Presión bajista</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '1rem' }}>
                    <div title="Tipos altos hacen menos atractivo el activo (no genera rendimiento)">⬆️ Tipos de interés → ⬇️ {selectedAsset.name} {selectedAsset.intRateRelation.includes('fuerte') ? '(fuerte)' : ''}</div>
                    <div title="Un dólar fuerte presiona el precio del activo">⬆️ Dólar → ⬇️ {selectedAsset.name} {selectedAsset.usdRelation.includes('fuerte') ? '(fuerte)' : ''}</div>
                  </div>
                </div>

                {/* Bloque Alcista */}
                <div style={{ background: 'rgba(34, 197, 94, 0.05)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--status-favorable)' }}>
                  <h4 style={{ color: 'var(--status-favorable)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>🟢 Presión alcista</h4>
                  <div style={{ fontSize: '1rem' }} title="El activo sube cuando hay miedo extremo en los mercados">
                    ⬆️ Miedo / crisis (VIX) → ⬆️ {selectedAsset.name} {selectedAsset.vixRelation === 'Directa en extremos' ? '(en pánico)' : ''}
                  </div>
                </div>
              </div>

              {/* Visual Bars Section */}
              <div style={{ marginTop: '24px' }}>
                <h4 className="detail-section-subtitle" style={{ fontSize: '0.85rem', opacity: 0.8 }}>📊 Reacción {selectedAsset.id === 'gold' ? 'del oro' : 'estimada'}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem' }}>Tipos de interés</span>
                    <span style={{ color: 'var(--status-defensive)', fontWeight: 700 }}>🔴⬇️⬇️⬇️</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem' }}>Dólar (DXY)</span>
                    <span style={{ color: 'var(--status-defensive)', fontWeight: 700 }}>🔴⬇️⬇️⬇️</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem' }}>Miedo (VIX)</span>
                    <span style={{ color: 'var(--status-favorable)', fontWeight: 700 }}>🟢⬆️⬆️ {selectedAsset.id === 'gold' ? '(solo crisis)' : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Humanized Tags */}
            <div style={{ flex: '0 0 240px' }}>
              <h4 className="detail-section-subtitle" style={{ fontSize: '0.9rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Etiquetas Macro</h4>
              <div className="detail-tags" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedAsset.tags.map(tag => {
                  let humanTag = tag;
                  if (tag === 'Refugio') humanTag = '🛡️ Refugio en crisis';
                  if (tag === 'Anti-fiat') humanTag = '💸 Protección devaluación';
                  if (tag === 'Inflación') humanTag = '🔥 Cobertura inflación';
                  if (tag === 'Industrial') humanTag = '🏗️ Demanda industrial';
                  if (tag === 'Pro-cíclico') humanTag = '📈 Sube con economía';

                  return (
                    <span key={tag} className="detail-tag" style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      {humanTag}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Assets */}
      <div className="asset-list-container">
        {filteredAssets.length === 0 ? (
          <div className="no-results">
            No se encontraron activos para esta búsqueda.
          </div>
        ) : (
          filteredAssets.map(asset => (
            <div
              key={asset.id}
              className={`asset-list-card card ${selectedAssetId === asset.id ? 'selected' : ''}`}
              onClick={() => setSelectedAssetId(asset.id)}
            >
              <div className="asset-card-header">
                <div>
                  <h3 className="asset-name">{asset.name}</h3>
                  <span className="asset-meta">{asset.ticker} &bull; {asset.category}</span>
                </div>
                <div className="asset-price-tag">
                  {asset.price}
                </div>
              </div>

              <div className="asset-card-footer">
                <div className="asset-sensitivity-tag">
                  {asset.macroSensitivity}
                </div>
                <div className={`asset-trend-val ${asset.trendType}`}>
                  {getTrendIcon(asset.trendType)} {asset.trend}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
