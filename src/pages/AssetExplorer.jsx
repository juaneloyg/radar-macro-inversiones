import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, Activity, DollarSign, Percent } from 'lucide-react';
import { assetsData } from '../data';

const categories = ["Todos", "Acciones", "Índices", "Bonos", "Materias primas", "Criptomonedas"];

export default function AssetExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedAssetId, setSelectedAssetId] = useState(assetsData[0].id);

  const filteredAssets = assetsData.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "Todos" || asset.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const selectedAsset = assetsData.find(a => a.id === selectedAssetId);

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

      {/* Split Layout */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        
        {/* Left List Grid */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {filteredAssets.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', padding: '40px', textAlign: 'center' }}>
              No se encontraron activos para esta búsqueda.
            </div>
          ) : (
            filteredAssets.map(asset => (
              <div 
                key={asset.id} 
                className="card"
                onClick={() => setSelectedAssetId(asset.id)}
                style={{ 
                  cursor: 'pointer', 
                  padding: '20px',
                  borderColor: selectedAssetId === asset.id ? 'var(--brand-primary)' : 'var(--border-light)',
                  boxShadow: selectedAssetId === asset.id ? '0 0 0 1px var(--brand-primary)' : 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{asset.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{asset.ticker} &bull; {asset.category}</span>
                  </div>
                  <div style={{ background: 'var(--surface-highlight)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {asset.price}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                    {asset.macroSensitivity}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: getTrendColor(asset.trendType) }}>
                    {getTrendIcon(asset.trendType)} {asset.trend}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Detail Panel */}
        {selectedAsset && (
          <div className="card" style={{ width: '400px', position: 'sticky', top: '24px', padding: '32px' }}>
            <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{selectedAsset.ticker}</h2>
                <span className="status-badge favorable" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: 'none' }}>
                  {selectedAsset.category}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{selectedAsset.name}</p>
            </div>

            <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Matriz de Sensibilidad</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Percent size={16} /> Tipos de Interés
                </span>
                <span style={{ fontWeight: 600 }}>{selectedAsset.intRateRelation}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={16} /> VIX (Volatilidad)
                </span>
                <span style={{ fontWeight: 600 }}>{selectedAsset.vixRelation}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={16} /> Dólar (DXY)
                </span>
                <span style={{ fontWeight: 600 }}>{selectedAsset.usdRelation}</span>
              </div>
            </div>

            <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Comportamiento Esperado</h4>
            <div style={{ background: 'var(--surface-highlight)', padding: '16px', borderRadius: '12px', marginBottom: '32px' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {selectedAsset.expectedBehavior}
              </p>
            </div>

            <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Etiquetas Macro</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedAsset.tags.map(tag => (
                <span key={tag} style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
