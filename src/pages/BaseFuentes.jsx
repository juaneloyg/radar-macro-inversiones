import React from 'react';
import { Target, Brain, Database, RefreshCw, Terminal, CheckCircle, ArrowRight, Activity } from 'lucide-react';

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
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Yahoo Finance: VIX (Volatilidad S&P), MOVE (Volatilidad de Bonos), Dólar DXY y Tipos de Interés (TNX).</p>
                        </div>
                        <div style={{ background: 'var(--surface-highlight)', padding: '20px', borderRadius: '12px' }}>
                            <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Renta Fija y Crédito</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>FRED (FED St. Louis): Spreads de High Yield (US, EU, EM) actuando como proxies de CDS, y Curvas de Tipos (10Y-2Y).</p>
                        </div>
                        <div style={{ background: 'var(--surface-highlight)', padding: '20px', borderRadius: '12px' }}>
                            <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Métricas Económicas</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>FRED: Balance de la FED (WALCL - Liquidez), Expectativas de Inflación (T5YIFR) y Crecimiento Real (CFNAI).</p>
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
                            <Terminal size={40} style={{ marginBottom: '12px', opacity: 0.8 }} />
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

                {/* Sección: Integridad */}
                <div className="card" style={{ gridColumn: 'span 2', borderLeft: '4px solid var(--brand-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>🛡️ Garantía e Integridad de Datos</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>
                        Para garantizar tu tranquilidad, el sistema incluye mecanismos de verificación:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <li style={{ background: 'var(--surface-highlight)', padding: '16px', borderRadius: '12px' }}>
                            <strong>Transparencia:</strong> El código es 100% auditable. Puedes verificar el proceso de descarga en nuestro repositorio de GitHub.
                        </li>
                        <li style={{ background: 'var(--surface-highlight)', padding: '16px', borderRadius: '12px' }}>
                            <strong>Fuentes Oficiales:</strong> No usamos datos de terceros desconocidos; conectamos directamente con Yahoo Finance y la FED de St. Louis (FRED).
                        </li>
                        <li style={{ background: 'var(--surface-highlight)', padding: '16px', borderRadius: '12px' }}>
                            <strong>Control de Frescura:</strong> Si los datos tienen más de 48 horas de antigüedad, el sistema te avisará visualmente con una alerta en naranja.
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    );
}
