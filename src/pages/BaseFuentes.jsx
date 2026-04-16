import React from 'react';
import { Target, Brain, Database, RefreshCw, Github, CheckCircle, ArrowRight } from 'lucide-react';

export default function BaseFuentes() {
    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header-modern" style={{ marginBottom: '40px' }}>
                <h1 className="dashboard-title">Metodología y Fuentes</h1>
                <p className="dashboard-subtitle">Entiende la lógica detrás del Radar Macro y el origen de sus datos</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

                {/* Sección: Objetivo */}
                <div className="card" style={{ height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ background: 'var(--brand-primary-dim)', padding: '12px', borderRadius: '12px' }}>
                            <Target color="var(--brand-primary)" size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Objetivo del Sistema</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>
                        El <strong>Radar Macro</strong> es una herramienta de análisis sistemático diseñada para identificar el <strong>Régimen de Mercado</strong> actual. Su propósito es ayudar al inversor a navegar el mercado basándose en datos objetivos (liquidez, tipos, volatilidad) en lugar de en narrativas o ruido mediático.
                    </p>
                </div>

                {/* Sección: Argumentario */}
                <div className="card" style={{ height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ background: 'var(--brand-primary-dim)', padding: '12px', borderRadius: '12px' }}>
                            <Brain color="var(--brand-primary)" size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>¿Para qué sirve?</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '16px' }}>
                        La rentabilidad de cualquier inversión no ocurre en el vacío; depende del "clima" macroeconómico. Este radar monitoriza los cuatro pilares que mueven el capital global:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {['Liquidez: El combustible de los activos.', 'Volatilidad: El termómetro del estrés.', 'Coste del Dinero: El imán de las valoraciones.', 'Ciclo Real: El motor de los beneficios.'].map((item, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                                <CheckCircle size={16} color="var(--status-favorable)" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Sección: Fuentes */}
                <div className="card" style={{ height: '100%', gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ background: 'var(--brand-primary-dim)', padding: '12px', borderRadius: '12px' }}>
                            <Database color="var(--brand-primary)" size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Fuentes de Información</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                        <div style={{ background: 'var(--surface-highlight)', padding: '20px', borderRadius: '12px' }}>
                            <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Mercados de Capitales</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Yahoo Finance (VIX, Dólar DXY, Materias Primas).</p>
                        </div>
                        <div style={{ background: 'var(--surface-highlight)', padding: '20px', borderRadius: '12px' }}>
                            <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Renta Fija y Tipos</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tesoro de EE.UU., Spreads de crédito High Yield y Curvas soberanas.</p>
                        </div>
                        <div style={{ background: 'var(--surface-highlight)', padding: '20px', borderRadius: '12px' }}>
                            <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Métricas Macro</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Indicadores de liquidez global (M2) y sorpresas económicas centrales.</p>
                        </div>
                    </div>
                </div>

                {/* Sección: Actualización */}
                <div className="card" style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, var(--surface-color), var(--surface-highlight))', border: '1px solid var(--brand-primary-dim)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ background: 'var(--brand-primary-dim)', padding: '12px', borderRadius: '12px' }}>
                            <RefreshCw color="var(--brand-primary)" size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Proceso de Actualización Automática</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <Github size={40} style={{ marginBottom: '12px', opacity: 0.8 }} />
                            <h4>GitHub Actions</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Despierta el proceso diariamente</p>
                        </div>
                        <ArrowRight style={{ opacity: 0.2 }} />
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🐍</div>
                            <h4>Script Python</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Carga y limpia los datos reales</p>
                        </div>
                        <ArrowRight style={{ opacity: 0.2 }} />
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <Database size={40} style={{ marginBottom: '12px', opacity: 0.8 }} />
                            <h4>Supabase DB</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Almacena el historial y snapshots</p>
                        </div>
                        <ArrowRight style={{ opacity: 0.2 }} />
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <Activity size={40} color="var(--status-favorable)" style={{ marginBottom: '12px' }} />
                            <h4>Dashboard Vivo</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Renderiza la visión macro actual</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
