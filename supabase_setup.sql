-- 1. Crear tabla de historial principal
CREATE TABLE macro_history (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    indicator_id VARCHAR(50) NOT NULL,
    value NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Asegurarnos de que funcione la búsqueda rápida (índices)
CREATE INDEX idx_macro_history_date ON macro_history(date);
CREATE INDEX idx_macro_history_indicator ON macro_history(indicator_id);

-- 3. IMPORTANTE: Desactivar momentáneamente la seguridad RLS 
-- para permitir que el script de Python pueda inyectar datos
-- usando solo la clave anónima. Una vez esté listo, puedes volver a activarla
-- o crear políticas si lo prefieres.
ALTER TABLE macro_history DISABLE ROW LEVEL SECURITY;
