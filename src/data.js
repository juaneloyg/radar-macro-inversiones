// initial mock data and configuration para Radar Macro

export const weights = {
  liquidez: 30, // 30%
  vix: 20,      // 20%
  credito: 15,  // 15%
  tipos: 15,    // 15%
  curva: 10,    // 10%
  dolar: 10,    // 10%
};

// Funciones helpers para generar historico ficticio
const generateTrendData = (start, points, trend = 0, volatility = 1) => {
  let current = start;
  return Array.from({ length: points }).map((_, i) => {
    current = current + (Math.random() - 0.5) * volatility + trend;
    return { day: `Día ${i + 1}`, value: Number(current.toFixed(2)) };
  });
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
    history: generateTrendData(100, 30, 0.1, 1),
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
    history: generateTrendData(20, 30, -0.2, 1.5),
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
    description: "Diferencial de rendimiento entre bonos corporativos de alto riesgo y bonos del tesoro sin riesgo. Spreads bajos indican confianza crediticia.",
    history: generateTrendData(3.4, 30, 0.01, 0.05),
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
    description: "Rendimiento del bono estadounidense a 10 años. Unos tipos altos encarecen el coste del capital, limitando a veces la valoración de acciones de crecimiento.",
    history: generateTrendData(4.1, 30, 0.02, 0.03),
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
    history: generateTrendData(-0.4, 30, 0.01, 0.03),
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
    history: generateTrendData(103, 30, 0.05, 0.3),
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
