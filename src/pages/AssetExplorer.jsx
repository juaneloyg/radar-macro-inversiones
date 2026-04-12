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
      <div className="asset-explorer-split">
        
        {/* Left List Grid */}
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

        {/* Right Detail Panel */}
        {selectedAsset && (
          <div className="asset-detail-panel card">
            <div className="detail-panel-header">
              <div className="detail-title-row">
                <h2 className="detail-ticker">{selectedAsset.ticker}</h2>
                <span className="detail-cat-badge">
                  {selectedAsset.category}
                </span>
              </div>
              <p className="detail-asset-name">{selectedAsset.name}</p>
            </div>

            <h4 className="detail-section-subtitle">Matriz de Sensibilidad</h4>
            <div className="sensitivity-rows">
              <div className="sensitivity-row">
                <span className="sensitivity-label">
                  <Percent size={16} /> Tipos de Interés
                </span>
                <span className="sensitivity-value">{selectedAsset.intRateRelation}</span>
              </div>
              <div className="sensitivity-row">
                <span className="sensitivity-label">
                  <Activity size={16} /> VIX (Volatilidad)
                </span>
                <span className="sensitivity-value">{selectedAsset.vixRelation}</span>
              </div>
              <div className="sensitivity-row">
                <span className="sensitivity-label">
                  <DollarSign size={16} /> Dólar (DXY)
                </span>
                <span className="sensitivity-value">{selectedAsset.usdRelation}</span>
              </div>
            </div>

            <h4 className="detail-section-subtitle">Comportamiento Esperado</h4>
            <div className="behavior-box">
              <p className="behavior-text">
                {selectedAsset.expectedBehavior}
              </p>
            </div>

            <h4 className="detail-section-subtitle">Etiquetas Macro</h4>
            <div className="detail-tags">
              {selectedAsset.tags.map(tag => (
                <span key={tag} className="detail-tag">
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
