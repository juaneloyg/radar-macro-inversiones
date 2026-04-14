// initial mock data and configuration para Radar Macro

export const weights = {
  liquidez: 20, 
  vix: 15,      
  credito: 10,  
  tipos: 10,    
  curva: 10,    
  dolar: 10,
  inflacion: 10,
  crecimiento: 15
};

// Funciones helpers para generar historico ficticio a 25 años
const generateTrendData = (start, years, trend = 0, volatility = 1) => {
  const points = years * 365;
  let current = start;
  const data = [];
  const today = new Date();
  
  for (let i = points; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    current = current + (Math.random() - 0.5) * volatility + trend;
    
    // Evitar valores negativos si no tiene sentido o ajustarlo natural
    if(current < 0.1 && volatility > 0.5) current = 0.5;

    data.push({ 
      date: d.toISOString().split('T')[0], 
      timestamp: d.getTime(),
      value: Number(current.toFixed(2)) 
    });
  }
  return data;
};

export const indicatorsData = [
  {
    id: "liquidez",
    name: "Liquidez Global",
    detailName: "Índice de Liquidez Global ($)",
    value: "$103.4 B",
    change: "+1.2%",
    changeType: "up", // up, down, flat
    status: "favorable", // favorable, neutral, defensive
    subscore: 85, // Sobre 100
    weight: weights.liquidez,
    description: "Medida aproximada de la liquidez monetaria global de los bancos centrales. Niveles altos suelen ser favorables para activos de riesgo.",
    history: generateTrendData(50, 25, 0.005, 1.5),
  },
  {
    id: "vix",
    name: "Volatilidad (VIX)",
    detailName: "Índice de Volatilidad CBOE (VIX)",
    value: "14.20",
    change: "-5.4%",
    changeType: "down", // en el VIX, bajar es favorable
    status: "favorable", 
    subscore: 75,
    weight: weights.vix,
    description: "Mide la expectativa de volatilidad del mercado de opciones del S&P 500. Valores por debajo de 20 indican un entorno de bajo estrés.",
    history: generateTrendData(20, 25, -0.001, 1),
  },
  {
    id: "credito",
    name: "Crédito (Spreads)",
    detailName: "High Yield Credit Spreads (OAS)",
    value: "3.45%",
    change: "+2 bps",
    changeType: "flat",
    status: "neutral",
    subscore: 60,
    weight: weights.credito,
    description: "Es lo que el mercado te cobra de mas por prestarle dinero a empresas con riesgo en lugar de a un gobierno seguro. Ejemplo sencillo: Si al gobierno le prestas al 3% y a una empresa arriesgada al 6%, ese +3% extra es el spread. Cómo leerlo: Bajo significa que todo va bien, no hay miedo. Alto significa cuidado, pueden venir problemas. En la práctica: Si sube mucho, el mercado está nervioso; si baja, hay confianza y ganas de asumir riesgo.",
    history: generateTrendData(5, 25, -0.0002, 0.1),
  },
  {
    id: "tipos",
    name: "Tipos de Interés",
    detailName: "US Treasury 10-Year Yield",
    value: "4.15%",
    change: "+4 bps",
    changeType: "up",
    status: "neutral",
    subscore: 50,
    weight: weights.tipos,
    description: "Rendimiento del bono estadounidense a 10 años. Es el termómetro global del coste del dinero. Cuando este sube, pedir prestado se vuelve más caro para todos: desde una familia que busca una hipoteca hasta una empresa tecnológica que necesita crédito para innovar. Históricamente, unos tipos altos actúan como un freno para la bolsa, ya que los inversores prefieren la seguridad de la renta fija frente al riesgo de las acciones. Además, un repunte en los rendimientos suele fortalecer al dólar, encareciendo las exportaciones y presionando a los mercados emergentes.",
    history: generateTrendData(3.5, 25, 0.0001, 0.05),
  },
  {
    id: "curva",
    name: "Curva de Tipos",
    detailName: "Spread Curva 10Y-2Y",
    value: "-0.25%",
    change: "+12 bps",
    changeType: "up",
    status: "defensive",
    subscore: 30,
    weight: weights.curva,
    description: "La diferencia de rendimiento entre el bono a 10 años y el bono a 2 años. Una curva invertida (valores negativos) ha sido históricamente un indicador de recesión.",
    history: generateTrendData(1, 25, -0.0002, 0.05),
  },
  {
    id: "dolar",
    name: "Dólar (DXY)",
    detailName: "US Dollar Index (DXY)",
    value: "104.30",
    change: "-0.1%",
    changeType: "down",
    status: "neutral",
    subscore: 55,
    weight: weights.dolar,
    description: "Medida del valor del dólar frente a una cesta de monedas extranjeras. Un dólar fuerte puede presionar las ganancias de multinacionales de EEUU.",
    history: generateTrendData(90, 25, 0.001, 0.5),
  },
  {
    id: "inflacion",
    name: "Inflación / Expectativas",
    detailName: "Métricas y Expectativas de Inflación",
    value: "3.2%",
    change: "+0.1%",
    changeType: "up",
    status: "defensive",
    subscore: 40,
    weight: weights.inflacion,
    description: "Mide la presión de los precios y las expectativas a futuro. Una inflación alta presiona negativamente las valoraciones (múltiplos) y afecta agresivamente a activos de media y larga duración (bonos), además de forzar a bancos centrales a drenar liquidez.",
    history: generateTrendData(3.5, 25, 0.001, 0.1),
  },
  {
    id: "crecimiento",
    name: "Crecimiento / Sorpresa Macro",
    detailName: "Sorpresa Económica y Crecimiento Real",
    value: "52.4",
    change: "+1.2",
    changeType: "up",
    status: "favorable",
    subscore: 55,
    weight: weights.crecimiento,
    description: "Evalúa la solidez del ciclo industrial y del consumidor frente al consenso. Un crecimiento robusto estabiliza la macro y beneficia a empresas pro-cíclicas, separando fases reales de expansión frente a meros rebotes de liquidez.",
    history: generateTrendData(50, 25, 0.01, 2),
  }
];

export const getMarketScore = () => {
  let totalScore = 0;
  indicatorsData.forEach((indicator) => {
    totalScore += (indicator.subscore * indicator.weight) / 100;
  });
  return Math.round(totalScore);
};

export const getStatusFromScore = (score) => {
  if (score >= 65) return { text: "Favorable", class: "favorable" };
  if (score >= 45) return { text: "Neutral", class: "neutral" };
  return { text: "Defensivo", class: "defensive" };
};

export const assetsData = [
  // Acciones
  { id: "asml", name: "ASML Holding N.V.", ticker: "ASML", category: "Acciones", price: "910.40", trend: "+1.5%", trendType: "up", macroSensitivity: "Tecnología / Semi", intRateRelation: "Inversa", vixRelation: "Inversa", usdRelation: "Mixta", expectedBehavior: "Sensible al ciclo global de semiconductores. Posee un fuerte poder de fijación de precios (monopolio estructural).", tags: ["Growth", "Europa"] },
  { id: "msft", name: "Microsoft Corporation", ticker: "MSFT", category: "Acciones", price: "415.50", trend: "+0.8%", trendType: "up", macroSensitivity: "Calidad global e IA", intRateRelation: "Inversa moderada", vixRelation: "Inversa", usdRelation: "Inversa moderada", expectedBehavior: "Resiliente estructuralmente, sostenida por flujos constantes hacia IA e ingresos recurrentes de Cloud.", tags: ["Quality", "Gran Cap"] },
  { id: "nvda", name: "NVIDIA Corporation", ticker: "NVDA", category: "Acciones", price: "880.20", trend: "+3.2%", trendType: "up", macroSensitivity: "Alta beta Growth", intRateRelation: "Inversa", vixRelation: "Fuertemente inversa", usdRelation: "Inversa moderada", expectedBehavior: "El proxy definitivo del capex en Inteligencia Artificial. Muy expuesta a dinámicas de exceso de liquidez.", tags: ["Momentum", "Hardware"] },
  { id: "aapl", name: "Apple Inc.", ticker: "AAPL", category: "Acciones", price: "172.40", trend: "-1.1%", trendType: "down", macroSensitivity: "Calidad global", intRateRelation: "Inversa moderada", vixRelation: "Inversa", usdRelation: "Inversa", expectedBehavior: "Propiedades defensivas dentro de Growth gracias a una generación de caja masiva y recompras continuas.", tags: ["Quality", "Gran Cap"] },
  { id: "itx", name: "Inditex", ticker: "ITX", category: "Acciones", price: "44.50", trend: "+0.3%", trendType: "up", macroSensitivity: "Retail europeo", intRateRelation: "Mixta", vixRelation: "Inversa", usdRelation: "Directa leve", expectedBehavior: "Sólida generación de caja e inventario ágil, beneficiándose de un consumidor fuerte a nivel global.", tags: ["Valor", "Consumo cíclico"] },

  // Índices
  { id: "sp500", name: "S&P 500", ticker: "SPX", category: "Índices", price: "5,123.41", trend: "+1.2%", trendType: "up", macroSensitivity: "Sensible a liquidez", intRateRelation: "Inversa moderada", vixRelation: "Fuertemente inversa", usdRelation: "Inversa leve", expectedBehavior: "Perfil alcista ante liquidez expansiva. Vulnerable a sorpresas de inflación que repunten los tipos.", tags: ["Pro-cíclico", "Diversificado"] },
  { id: "ndx", name: "Nasdaq 100", ticker: "NDX", category: "Índices", price: "18,240.20", trend: "+2.1%", trendType: "up", macroSensitivity: "Muy sensible a tipos", intRateRelation: "Fuertemente inversa", vixRelation: "Fuertemente inversa", usdRelation: "Inversa moderada", expectedBehavior: "Rinde excepcionalmente en pausas de ciclos monetarios combinadas con grandes montos de liquidez global.", tags: ["Growth", "Alta Beta"] },
  { id: "stoxx50", name: "Euro Stoxx 50", ticker: "SX5E", category: "Índices", price: "4,980.15", trend: "+0.4%", trendType: "up", macroSensitivity: "Valor y ciclo industrial", intRateRelation: "Directa leve", vixRelation: "Inversa", usdRelation: "Directa", expectedBehavior: "Elevado peso bancario e industrial. Se beneficia típicamente con curvas empinadas y ciclo industrial fuerte.", tags: ["Value", "Europa"] },

  // Bonos
  { id: "us10y", name: "US Treasury 10Y", ticker: "US10Y", category: "Bonos", price: "4.35%", trend: "+2 bps", trendType: "down", macroSensitivity: "Tipos reales", intRateRelation: "Directa a expectativas", vixRelation: "Inversa a rendimientos", usdRelation: "Directa", expectedBehavior: "Referencia global libre de riesgo. Sus rendimientos suben con presiones inflacionarias o crecimiento fuerte económico.", tags: ["Referencia", "Soberano"] },
  { id: "bund", name: "Bund Alemán 10Y", ticker: "BUND", category: "Bonos", price: "2.40%", trend: "-1 bps", trendType: "up", macroSensitivity: "Riesgo Eurozona", intRateRelation: "Directa a expectativas BCE", vixRelation: "Inversa a rendimientos", usdRelation: "Inversa leve", expectedBehavior: "Principal activo refugio de la Eurozona. Funciona como paraguas ante estrés político o riesgos recesivos en la UE.", tags: ["Refugio EUR", "Soberano"] },

  // Materias primas
  { id: "gold", name: "Oro", ticker: "XAU", category: "Materias primas", price: "2,350.10", trend: "+0.5%", trendType: "up", macroSensitivity: "Sensible a tipos reales", intRateRelation: "Inversa a yields reales", vixRelation: "Directa en extremos", usdRelation: "Fuertemente inversa", expectedBehavior: "Actúa como refugio geopolítico defensivo y cobertura histórica ante el envilecimiento (devaluación fiduciaria).", tags: ["Refugio", "Anti-fiat"] },
  { id: "crude", name: "Petróleo (WTI)", ticker: "CL", category: "Materias primas", price: "85.60", trend: "+1.2%", trendType: "up", macroSensitivity: "Crecimiento y OPEP", intRateRelation: "Mixta", vixRelation: "Inversa", usdRelation: "Inversa", expectedBehavior: "Muy correlacionado con el ciclo económico real expansivo, la demanda de China y decisiones de la OPEP+.", tags: ["Energía", "Pro-inflación"] },

  // Criptomonedas
  { id: "btc", name: "Bitcoin", ticker: "BTC", category: "Criptomonedas", price: "67,400.00", trend: "+4.5%", trendType: "up", macroSensitivity: "Proxy purista de M2", intRateRelation: "Inversa moderada", vixRelation: "Inversa moderada", usdRelation: "Fuertemente inversa", expectedBehavior: "Alta beta frente a inyecciones de masas monetarias centrales. Elevada volatilidad y alta reactividad al dólar débil.", tags: ["Extremo riesgo", "Pura liquidez"] },
  { id: "eth", name: "Ethereum", ticker: "ETH", category: "Criptomonedas", price: "3,550.80", trend: "+2.8%", trendType: "up", macroSensitivity: "Liquidez y adopción On-chain", intRateRelation: "Inversa", vixRelation: "Inversa fuerte", usdRelation: "Inversa", expectedBehavior: "Matriz similar a BTC pero sumando un componente tecnológico tipo 'software equity'. Elevadísima volatilidad.", tags: ["Plataforma web3", "Alta Beta"] }
];
