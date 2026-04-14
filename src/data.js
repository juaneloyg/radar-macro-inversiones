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
    description: "Este indicador mide la diferencia de salud entre el corto y el largo plazo económico. En una economía sana, el bono a 10 años paga más que el de 2 años (curva positiva). Si el spread cae por debajo de cero, hablamos de una curva invertida, lo que significa que el mercado ve más riesgo hoy que mañana; este fenómeno ha predicho casi todas las recesiones modernas. Por ejemplo, una inversión de la curva dificulta que los bancos concedan crédito, ya que ellos 'compran' dinero a corto plazo y lo prestan a largo; si el margen desaparece, el flujo de dinero a la economía real se frena en seco.",
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
    description: "El DXY mide la fuerza del dólar frente a una cesta de las seis divisas más importantes del mundo (especialmente el Euro). Es el activo refugio por excelencia: cuando hay miedo o incertidumbre, el DXY suele subir. Un dólar fuerte actúa como una aspiradora de liquidez global, lo que suele castigar a las materias primas (como el oro o el petróleo) y a los mercados emergentes, ya que estos activos se cotizan en dólares y se vuelven más caros para el resto del mundo. Por ejemplo, si el DXY sube con fuerza, las multinacionales tecnológicas pueden ver reducidos sus beneficios al convertir sus ventas internacionales a una moneda local ahora más costosa.",
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
    description: "Este indicador rastrea el aumento del coste de la vida y lo que el mercado espera que ocurra en el futuro. Una inflación alta es el peor enemigo del ahorrador, ya que erosiona el poder adquisitivo del dinero estático. Para los inversores, es clave porque obliga a los bancos centrales a subir tipos de interés para enfriar la economía, lo que suele castigar las valoraciones de las acciones. Por ejemplo, en un entorno de alta inflación, los bonos pierden valor rápidamente y las empresas con márgenes estrechos sufren para trasladar los costes al consumidor, afectando directamente a sus beneficios.",
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
    description: "Este indicador mide la diferencia entre los datos económicos publicados (como el PIB o el empleo) y lo que los analistas habían pronosticado. Una sorpresa positiva (gráfico subiendo) indica que la economía está más fuerte de lo previsto, lo que suele impulsar a las acciones \"cíclicas\" como bancos o industria. Por contra, sorpresas negativas constantes sugieren que el mercado es demasiado optimista y se acerca un enfriamiento. Es el mejor termómetro para saber si el crecimiento real respalda las subidas de la bolsa o si solo estamos ante una burbuja de liquidez.",
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

  // ── 1. MATERIAS PRIMAS (Commodities) ──────────────────────────────────────
  {
    id: "gold", name: "Oro", ticker: "XAU/USD", category: "Materias primas",
    price: "2,350", trend: "+0.5%", trendType: "up",
    macroSensitivity: "Tipos reales y refugio",
    intRateRelation: "Fuertemente inversa", vixRelation: "Directa en extremos", usdRelation: "Fuertemente inversa",
    expectedBehavior: "Activo refugio por excelencia. Sube cuando los tipos reales bajan, el dólar se debilita o hay miedo geopolítico. Es el termómetro del miedo a la devaluación monetaria.",
    tags: ["Refugio", "Anti-fiat", "Inflación"]
  },
  {
    id: "silver", name: "Plata", ticker: "XAG/USD", category: "Materias primas",
    price: "27.40", trend: "+1.2%", trendType: "up",
    macroSensitivity: "Industrial + refugio",
    intRateRelation: "Inversa", vixRelation: "Directa moderada", usdRelation: "Inversa",
    expectedBehavior: "Híbrido entre metal refugio y metal industrial. Se beneficia del ciclo industrial fuerte y de entornos de dólar débil. Más volátil que el oro.",
    tags: ["Refugio", "Industrial", "Alta Beta"]
  },
  {
    id: "copper", name: "Cobre (LME)", ticker: "HG/USD", category: "Materias primas",
    price: "4.35", trend: "+0.8%", trendType: "up",
    macroSensitivity: "Barómetro del ciclo industrial",
    intRateRelation: "Inversa moderada", vixRelation: "Inversa", usdRelation: "Inversa",
    expectedBehavior: "Llamado 'el economista con doctorado'. Sube cuando el crecimiento global acelera (especialmente China) y cae cuando se anticipa recesión. Líder adelantado del ciclo.",
    tags: ["Pro-cíclico", "China", "Industrial"]
  },
  {
    id: "aluminium", name: "Aluminio (LME)", ticker: "ALI/USD", category: "Materias primas",
    price: "2,410", trend: "+0.3%", trendType: "up",
    macroSensitivity: "Ciclo industrial global",
    intRateRelation: "Inversa moderada", vixRelation: "Inversa", usdRelation: "Inversa",
    expectedBehavior: "Sensible al coste energético y al ciclo manufacturero. Se ve presionado por la fortaleza del dólar y se beneficia de la demanda industrial de autos eléctricos e infraestructura.",
    tags: ["Industrial", "Energía", "Transición verde"]
  },
  {
    id: "brent", name: "Petróleo Brent", ticker: "BRN/USD", category: "Materias primas",
    price: "87.60", trend: "+1.1%", trendType: "up",
    macroSensitivity: "Crecimiento global y OPEP",
    intRateRelation: "Mixta", vixRelation: "Inversa", usdRelation: "Inversa",
    expectedBehavior: "Referencia global del crudo. Sube con expansión económica, tensiones geopolíticas en Oriente Medio o recortes de la OPEP+. Su precio impacta directamente en la inflación.",
    tags: ["Energía", "Pro-inflación", "Geopolítica"]
  },
  {
    id: "natgas", name: "Gas Natural", ticker: "NG/USD", category: "Materias primas",
    price: "1.95", trend: "-2.1%", trendType: "down",
    macroSensitivity: "Estacional y geopolítico",
    intRateRelation: "Neutral", vixRelation: "Directa en crisis", usdRelation: "Inversa leve",
    expectedBehavior: "Muy volátil. Sensible a la temperatura, el invierno europeo, la capacidad de almacenamiento y las tensiones con Rusia. Factor clave para la inflación energética europea.",
    tags: ["Energía", "Europa", "Estacional"]
  },
  {
    id: "wheat", name: "Trigo (Chicago)", ticker: "ZW/USD", category: "Materias primas",
    price: "5.42", trend: "-0.4%", trendType: "down",
    macroSensitivity: "Geopolítico y climático",
    intRateRelation: "Neutral", vixRelation: "Directa en crisis", usdRelation: "Inversa",
    expectedBehavior: "Muy sensible a conflictos (Ucrania-Rusia), sequías y la política agrícola global. Afecta directamente al IPC de alimentos y a países emergentes importadores.",
    tags: ["Alimentos", "Geopolítica", "Inflación"]
  },
  {
    id: "corn", name: "Maíz (Chicago)", ticker: "ZC/USD", category: "Materias primas",
    price: "4.38", trend: "+0.2%", trendType: "up",
    macroSensitivity: "Demanda energética y alimentaria",
    intRateRelation: "Neutral", vixRelation: "Neutral", usdRelation: "Inversa",
    expectedBehavior: "Clave para la alimentación animal y el etanol. Correlacionado con el precio del petróleo (biocombustibles) y la demanda de China. Factor de inflación en mercados emergentes.",
    tags: ["Alimentos", "Bioenergía", "Emergentes"]
  },
  {
    id: "soy", name: "Soja (Chicago)", ticker: "ZS/USD", category: "Materias primas",
    price: "11.85", trend: "-0.6%", trendType: "down",
    macroSensitivity: "Demanda China y clima",
    intRateRelation: "Neutral", vixRelation: "Neutral", usdRelation: "Inversa",
    expectedBehavior: "El mercado de la soja es uno de los más ligados a China como importador y a Brasil/Argentina como productores. Sube con la debilidad del dólar y la demanda proteica global.",
    tags: ["Alimentos", "China", "Emergentes"]
  },
  {
    id: "fao", name: "Índice FAO Alimentos", ticker: "FAO", category: "Materias primas",
    price: "118.3", trend: "-0.5%", trendType: "down",
    macroSensitivity: "Inflación alimentaria global",
    intRateRelation: "Neutral", vixRelation: "Directa en crisis", usdRelation: "Inversa",
    expectedBehavior: "Mide el precio promedio global de cereales, aceites, lácteos, carnes y azúcar. Predictor adelantado de inflación en economías emergentes y presión social.",
    tags: ["Alimentos", "Inflación", "Emergentes"]
  },

  // ── 2. MACRO GLOBAL ────────────────────────────────────────────────────────
  {
    id: "pib_mundial", name: "PIB Mundial (YoY)", ticker: "GDP-WORLD", category: "Macro Global",
    price: "+2.8%", trend: "-0.2%", trendType: "down",
    macroSensitivity: "Ciclo económico global",
    intRateRelation: "Directa", vixRelation: "Inversa", usdRelation: "Mixta",
    expectedBehavior: "La medida más amplia del crecimiento real. Una desaceleración global impacta a activos cíclicos, materias primas y emergentes. Determina el tono general del ciclo de inversión.",
    tags: ["Macro", "Ciclo", "Global"]
  },
  {
    id: "pib_eeuu", name: "PIB EE.UU. (YoY)", ticker: "GDP-US", category: "Macro Global",
    price: "+2.4%", trend: "+0.1%", trendType: "up",
    macroSensitivity: "Motor de la economía global",
    intRateRelation: "Directa a decisiones Fed", vixRelation: "Inversa", usdRelation: "Directa",
    expectedBehavior: "El crecimiento de EEUU es el ancla global. Un PIB robusto presiona a la Fed a mantener tipos altos. Beneficia al sector financiero y a los cíclicos americanos.",
    tags: ["Macro", "EEUU", "Fed"]
  },
  {
    id: "pib_eurozona", name: "PIB Eurozona (YoY)", ticker: "GDP-EUR", category: "Macro Global",
    price: "+0.4%", trend: "-0.1%", trendType: "down",
    macroSensitivity: "Ciclo europeo",
    intRateRelation: "Directa a decisiones BCE", vixRelation: "Inversa", usdRelation: "Inversa leve",
    expectedBehavior: "La eurozona crece poco. Muy dependiente de Alemania e industria pesada. Afectada por energía cara y comercio global débil. Impacta directamente al Euro Stoxx y al EUR/USD.",
    tags: ["Macro", "Europa", "BCE"]
  },
  {
    id: "pib_china", name: "PIB China (YoY)", ticker: "GDP-CN", category: "Macro Global",
    price: "+4.9%", trend: "+0.3%", trendType: "up",
    macroSensitivity: "Motor de commodities y emergentes",
    intRateRelation: "Neutral", vixRelation: "Inversa", usdRelation: "Inversa leve",
    expectedBehavior: "China es el principal comprador global de materias primas. Un repunte del PIB chino dispara cobre, soja y petróleo. Un enfriamiento penaliza a emergentes y materias primas.",
    tags: ["Macro", "China", "Commodities"]
  },
  {
    id: "ipc_eeuu", name: "IPC EE.UU. (YoY)", ticker: "CPI-US", category: "Macro Global",
    price: "+3.2%", trend: "-0.1%", trendType: "down",
    macroSensitivity: "Decisiones de la Fed",
    intRateRelation: "Directa fuerte", vixRelation: "Directa en surpresas", usdRelation: "Directa",
    expectedBehavior: "El dato de inflación más vigilado del mundo. Una sorpresa al alza fuerza a la Fed a endurecer política monetaria, lo que penaliza bonos y growth. A la baja, abre la puerta a recortes.",
    tags: ["Inflación", "Fed", "EEUU"]
  },
  {
    id: "ipc_eurozona", name: "IPC Eurozona (YoY)", ticker: "CPI-EUR", category: "Macro Global",
    price: "+2.4%", trend: "-0.3%", trendType: "down",
    macroSensitivity: "Decisiones del BCE",
    intRateRelation: "Directa", vixRelation: "Neutral", usdRelation: "Inversa leve",
    expectedBehavior: "Governa las decisiones del BCE. Una inflación pegajosa retrasa los recortes de tipos en Europa, presionando el crédito y la renta variable de calidad.",
    tags: ["Inflación", "BCE", "Europa"]
  },
  {
    id: "ffr", name: "Fed Funds Rate", ticker: "FFR", category: "Macro Global",
    price: "5.25%", trend: "0 bps", trendType: "flat",
    macroSensitivity: "Precio del dinero en EEUU",
    intRateRelation: "Directa (es la referencia)", vixRelation: "Directa en cambios", usdRelation: "Directa",
    expectedBehavior: "La palanca macroeconómica más poderosa del mundo. Cada subida restringe crédito global y fortalece el dólar. Cada bajada expande liquidez y beneficia a activos de riesgo.",
    tags: ["Fed", "Política monetaria", "EEUU"]
  },
  {
    id: "bce_rate", name: "Tipo de Interés BCE", ticker: "ECB-RATE", category: "Macro Global",
    price: "4.00%", trend: "0 bps", trendType: "flat",
    macroSensitivity: "Precio del dinero en Europa",
    intRateRelation: "Directa", vixRelation: "Neutral", usdRelation: "Inversa (EUR/USD)",
    expectedBehavior: "Referencia para el crédito en la eurozona. Su trayectoria marca el diferencial con la Fed y por tanto el EUR/USD. Recortes del BCE favorecen bolsas europeas y debilitan al Euro.",
    tags: ["BCE", "Política monetaria", "Europa"]
  },
  {
    id: "real_rate_us", name: "Tipo Real EEUU (10Y-Breakeven)", ticker: "TIPS-10Y", category: "Macro Global",
    price: "+1.85%", trend: "+5 bps", trendType: "up",
    macroSensitivity: "Coste real del capital",
    intRateRelation: "Directa (es el tipo real)", vixRelation: "Inversa", usdRelation: "Directa",
    expectedBehavior: "El tipo más importante para los activos reales. Cuando sube, el oro y el growth sufren. Cuando baja (tipos nominales bajan o expectativas inflación suben), el oro y los emergentes se benefician.",
    tags: ["Tipos reales", "Oro", "EEUU"]
  },

  // ── 3. CICLO ECONÓMICO Y RIESGO ────────────────────────────────────────────
  {
    id: "pmi_global", name: "PMI Manufacturero Global", ticker: "PMI-WORLD", category: "Ciclo y Riesgo",
    price: "50.3", trend: "+0.4", trendType: "up",
    macroSensitivity: "Salud del ciclo industrial",
    intRateRelation: "Inversa leve", vixRelation: "Inversa", usdRelation: "Mixta",
    expectedBehavior: "Por encima de 50 = expansión. Por debajo = contracción. Es el indicador líder más seguido del ciclo fabril global. Su cruce arriba o abajo de 50 mueve fuerte a cíclicos y commodities.",
    tags: ["Ciclo", "Manufactura", "Global"]
  },
  {
    id: "pmi_eeuu", name: "PMI Manufacturero EE.UU.", ticker: "PMI-US", category: "Ciclo y Riesgo",
    price: "51.9", trend: "+1.2", trendType: "up",
    macroSensitivity: "Ciclo industrial americano",
    intRateRelation: "Inversa leve", vixRelation: "Inversa", usdRelation: "Directa",
    expectedBehavior: "Indicador líder del sector fabril de EEUU. Su recuperación impulsa a industriales, materiales y energía. Cuando se desinfla, suele anticipar revisiones de beneficios a la baja.",
    tags: ["Ciclo", "EEUU", "Industrial"]
  },
  {
    id: "pmi_eurozona", name: "PMI Manufacturero Eurozona", ticker: "PMI-EUR", category: "Ciclo y Riesgo",
    price: "46.5", trend: "+0.8", trendType: "up",
    macroSensitivity: "Ciclo industrial europeo",
    intRateRelation: "Inversa leve", vixRelation: "Inversa", usdRelation: "Directa (EUR)",
    expectedBehavior: "En zona de contracción desde hace meses. Arrastrado por Alemania. Su recuperación impulsaría al Euro Stoxx y al sector bancario europeo. Es uno de los riesgos macro más vigilados.",
    tags: ["Ciclo", "Europa", "Recesión"]
  },
  {
    id: "vix", name: "VIX (Volatilidad S&P 500)", ticker: "VIX", category: "Ciclo y Riesgo",
    price: "14.20", trend: "-5.4%", trendType: "down",
    macroSensitivity: "Termómetro del miedo global",
    intRateRelation: "Directa en crisis", vixRelation: "Es el propio VIX", usdRelation: "Directa en extremos",
    expectedBehavior: "Conocido como el índice del miedo. VIX < 20 = calma. VIX > 30 = estrés. Los picos de VIX son oportunidades de compra históricas si el sistema financiero no está en riesgo sistémico.",
    tags: ["Riesgo", "Opciones", "Sentimiento"]
  },
  {
    id: "dxy", name: "Índice Dólar (DXY)", ticker: "DXY", category: "Ciclo y Riesgo",
    price: "104.30", trend: "-0.1%", trendType: "down",
    macroSensitivity: "Liquidez global y refugio",
    intRateRelation: "Directa fuerte", vixRelation: "Directa en crisis", usdRelation: "Es la referencia",
    expectedBehavior: "Un DXY fuerte drena liquidez global: penaliza emergentes, commodities y multinacionales americanas. Un DXY débil expande liquidez y beneficia al oro, emergentes y bolsas internacionales.",
    tags: ["Dólar", "Refugio", "Liquidez"]
  },

  // ── 4. RATIOS MACRO ────────────────────────────────────────────────────────
  {
    id: "ratio_oro_plata", name: "Ratio Oro/Plata", ticker: "GOLD/SILVER", category: "Ratios Macro",
    price: "85.8", trend: "-0.7", trendType: "down",
    macroSensitivity: "Apetito por riesgo y refugio",
    intRateRelation: "Neutral", vixRelation: "Directa", usdRelation: "Neutral",
    expectedBehavior: "Cuando el ratio sube (>85), el mercado prefiere el refugio del oro frente al riesgo industrial de la plata. Cuando baja, hay apetito por activos industriales y optimismo económico.",
    tags: ["Ratio", "Sentimiento", "Refugio"]
  },
  {
    id: "ratio_cobre_oro", name: "Ratio Cobre/Oro", ticker: "COPPER/GOLD", category: "Ratios Macro",
    price: "0.0019", trend: "+0.5%", trendType: "up",
    macroSensitivity: "Ciclo económico vs. refugio",
    intRateRelation: "Directa", vixRelation: "Inversa", usdRelation: "Neutral",
    expectedBehavior: "Uno de los mejores predictores de los tipos a 10 años americanos. Cuando sube, la economía real gana fuerza; cuando baja, el refugio domina. Útil para anticipar movimientos en bonos.",
    tags: ["Ratio", "Ciclo", "Bonos"]
  },
  {
    id: "ratio_oro_dxy", name: "Ratio Oro/Dólar", ticker: "XAU/DXY", category: "Ratios Macro",
    price: "22.5", trend: "+0.6%", trendType: "up",
    macroSensitivity: "Devaluación monetaria",
    intRateRelation: "Inversa", vixRelation: "Directa", usdRelation: "Fuertemente inversa",
    expectedBehavior: "Mide cuánto oro se necesita para comprar una unidad de DXY. Cuando sube, el mercado está desconfiando del sistema fiduciario. Es la señal más limpia de búsqueda de valor real sobre papel.",
    tags: ["Ratio", "Anti-fiat", "Devaluación"]
  },

  // ── 5. OTROS ACTIVOS CLAVE ─────────────────────────────────────────────────
  {
    id: "bund", name: "Bund Alemán 10Y", ticker: "BUND", category: "Bonos",
    price: "2.40%", trend: "-1 bps", trendType: "up",
    macroSensitivity: "Refugio de la Eurozona",
    intRateRelation: "Directa a expectativas BCE", vixRelation: "Inversa a rendimientos", usdRelation: "Inversa leve",
    expectedBehavior: "Principal activo refugio de Europa. Cuando hay tensión política o riesgo de recesión en la UE, el Bund se aprecia (rendimiento baja). Es el ancla de la renta fija europea.",
    tags: ["Refugio EUR", "Soberano", "Europa"]
  },
  {
    id: "us10y", name: "US Treasury 10Y", ticker: "US10Y", category: "Bonos",
    price: "4.35%", trend: "+2 bps", trendType: "down",
    macroSensitivity: "Tipos reales globales",
    intRateRelation: "Directa a expectativas Fed", vixRelation: "Inversa a rendimientos", usdRelation: "Directa",
    expectedBehavior: "La tasa más importante del mundo. Su rendimiento determina el coste del capital global: hipotecas, crédito corporativo y valoración de acciones. Sube con inflación o crecimiento fuerte.",
    tags: ["Referencia", "Soberano", "EEUU"]
  },
  {
    id: "btc", name: "Bitcoin", ticker: "BTC", category: "Criptomonedas",
    price: "67,400", trend: "+4.5%", trendType: "up",
    macroSensitivity: "Proxy de liquidez global (M2)",
    intRateRelation: "Inversa moderada", vixRelation: "Inversa moderada", usdRelation: "Fuertemente inversa",
    expectedBehavior: "El activo más sensible a las inyecciones de liquidez de los bancos centrales. Funciona como un barómetro extremo del exceso monetario. Muy volátil frente a cambios bruscos de tipos o regulación.",
    tags: ["Cripto", "Liquidez", "Alta Beta"]
  },
  {
    id: "crude", name: "Petróleo WTI", ticker: "WTI", category: "Materias primas",
    price: "85.60", trend: "+1.2%", trendType: "up",
    macroSensitivity: "Crecimiento y OPEP",
    intRateRelation: "Mixta", vixRelation: "Inversa", usdRelation: "Inversa",
    expectedBehavior: "Referencia americana del crudo. Correlacionado con el ciclo económico de EEUU y las decisiones de la OPEP+. Su precio impacta directamente a la inflación energética y al consumidor.",
    tags: ["Energía", "Pro-inflación", "EEUU"]
  },
  {
    id: "ndx", name: "Nasdaq 100", ticker: "NDX", category: "Índices",
    price: "18,240", trend: "+2.1%", trendType: "up",
    macroSensitivity: "Muy sensible a tipos",
    intRateRelation: "Fuertemente inversa", vixRelation: "Fuertemente inversa", usdRelation: "Inversa moderada",
    expectedBehavior: "El índice de tecnología y crecimiento más representativo. Rinde excepcionalmente cuando la Fed pausa o baja tipos y hay liquidez global abundante. Muy vulnerable a surpresas de inflación.",
    tags: ["Growth", "Tecnología", "Alta Beta"]
  },
  {
    id: "sp500", name: "S&P 500", ticker: "SPX", category: "Índices",
    price: "5,123", trend: "+1.2%", trendType: "up",
    macroSensitivity: "Sensible a liquidez y ciclo",
    intRateRelation: "Inversa moderada", vixRelation: "Fuertemente inversa", usdRelation: "Inversa leve",
    expectedBehavior: "El índice de referencia global. Alcista ante liquidez expansiva y crecimiento sostenido. Vulnerable a sorpresas de inflación persistente que retrasen los recortes de la Fed.",
    tags: ["Pro-cíclico", "Diversificado", "EEUU"]
  },
];
