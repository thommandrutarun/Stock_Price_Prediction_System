import Chart from 'react-apexcharts';

// Helper: Calculate Simple Moving Average (SMA)
const calculateSMA = (data, period) => {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, val) => acc + val, 0);
      sma.push(sum / period);
    }
  }
  return sma;
};

// Helper: Calculate Bollinger Bands
const calculateBollinger = (data, period = 20, k = 2) => {
  const sma = calculateSMA(data, period);
  const upper = [];
  const lower = [];
  for (let i = 0; i < data.length; i++) {
    if (sma[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const squareDiffs = slice.map(val => Math.pow(val - mean, 2));
      const variance = squareDiffs.reduce((acc, val) => acc + val, 0) / period;
      const sd = Math.sqrt(variance);
      upper.push(mean + k * sd);
      lower.push(mean - k * sd);
    }
  }
  return { sma, upper, lower };
};

// Helper: Calculate Welles Wilder Relative Strength Index (RSI)
const calculateRSI = (data, period = 14) => {
  const rsi = [];
  if (data.length < period) return Array(data.length).fill(null);

  const gains = [];
  const losses = [];
  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsi.push(null);
    } else {
      const idx = i - 1;
      if (i > period) {
        avgGain = (avgGain * (period - 1) + gains[idx]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[idx]) / period;
      }
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - 100 / (1 + rs));
      }
    }
  }
  return rsi;
};

// Helper: Calculate EMA with null safety
const calculateEMA = (data, period) => {
  const ema = [];
  const k = 2 / (period + 1);
  let firstValidIdx = -1;

  for (let i = 0; i < data.length; i++) {
    if (data[i] !== null && data[i] !== undefined) {
      firstValidIdx = i;
      break;
    }
  }

  if (firstValidIdx === -1 || (data.length - firstValidIdx) < period) {
    return Array(data.length).fill(null);
  }

  let sum = 0;
  for (let i = firstValidIdx; i < firstValidIdx + period; i++) {
    sum += data[i];
  }
  let currentEma = sum / period;

  for (let i = 0; i < data.length; i++) {
    if (i < firstValidIdx + period - 1) {
      ema.push(null);
    } else if (i === firstValidIdx + period - 1) {
      ema.push(currentEma);
    } else {
      if (data[i] === null || data[i] === undefined) {
        ema.push(null);
      } else {
        currentEma = data[i] * k + currentEma * (1 - k);
        ema.push(currentEma);
      }
    }
  }
  return ema;
};

const ApexChartComponent = ({ prices, chartType, symbol, activeIndicator = 'none' }) => {
  if (!prices || prices.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '380px', color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff', fontWeight: '500' }}>
          {symbol ? `No Price Data for ${symbol}` : 'No Stock Selected'}
        </p>
        <p style={{ fontSize: '0.95rem', color: '#94a3b8', maxWidth: '400px', lineHeight: '1.5' }}>
          {symbol 
            ? 'We could not fetch historical price data. Please verify the stock symbol and try again.' 
            : 'Enter a stock symbol above (e.g., TCS.NS, AAPL) or select one from your watchlist to load the real-time chart.'}
        </p>
      </div>
    );
  }

  const closes = prices.map(p => p.close);
  const dates = prices.map(p => new Date(p.date).getTime());
  
  let series = [];
  let chartOptionsType = chartType;
  let customYAxis = {
    tooltip: { enabled: true },
    labels: {
      formatter: (val) => val.toFixed(2),
      style: { colors: '#94a3b8' },
    },
  };
  let customAnnotations = {};

  if (activeIndicator === 'rsi') {
    const rsiValues = calculateRSI(closes);
    chartOptionsType = 'line';
    series = [{
      name: 'RSI (14)',
      type: 'line',
      data: prices.map((p, idx) => ({ x: dates[idx], y: rsiValues[idx] }))
    }];
    customYAxis = {
      min: 0,
      max: 100,
      tickAmount: 4,
      labels: {
        formatter: (val) => val.toFixed(0),
        style: { colors: '#94a3b8' },
      },
    };
    customAnnotations = {
      yaxis: [
        {
          y: 70,
          borderColor: 'rgba(239, 68, 68, 0.4)',
          label: {
            borderColor: 'rgba(239, 68, 68, 0.6)',
            style: { color: '#fff', background: '#ef4444' },
            text: 'Overbought (70)',
          }
        },
        {
          y: 30,
          borderColor: 'rgba(16, 185, 129, 0.4)',
          label: {
            borderColor: 'rgba(16, 185, 129, 0.6)',
            style: { color: '#fff', background: '#10b981' },
            text: 'Oversold (30)',
          }
        }
      ]
    };
  } else if (activeIndicator === 'macd') {
    const ema12 = calculateEMA(closes, 12);
    const ema26 = calculateEMA(closes, 26);
    const macdLine = ema12.map((val, idx) => (val === null || ema26[idx] === null) ? null : val - ema26[idx]);
    const signalLine = calculateEMA(macdLine, 9);
    const histogram = macdLine.map((val, idx) => (val === null || signalLine[idx] === null) ? null : val - signalLine[idx]);

    chartOptionsType = 'line';
    series = [
      {
        name: 'Histogram',
        type: 'bar',
        data: prices.map((p, idx) => ({ x: dates[idx], y: histogram[idx] }))
      },
      {
        name: 'MACD (12, 26)',
        type: 'line',
        data: prices.map((p, idx) => ({ x: dates[idx], y: macdLine[idx] }))
      },
      {
        name: 'Signal (9)',
        type: 'line',
        data: prices.map((p, idx) => ({ x: dates[idx], y: signalLine[idx] }))
      }
    ];
    customYAxis = {
      labels: {
        formatter: (val) => val.toFixed(2),
        style: { colors: '#94a3b8' },
      },
    };
  } else if (activeIndicator === 'bollinger') {
    const { sma, upper, lower } = calculateBollinger(closes);
    series = [
      {
        name: `${symbol} Price`,
        type: chartType,
        data: prices.map((p, idx) => ({
          x: dates[idx],
          y: chartType === 'candlestick' ? [p.open, p.high, p.low, p.close] : p.close
        }))
      },
      {
        name: 'BB Upper',
        type: 'line',
        data: prices.map((p, idx) => ({ x: dates[idx], y: upper[idx] }))
      },
      {
        name: 'BB Basis (SMA 20)',
        type: 'line',
        data: prices.map((p, idx) => ({ x: dates[idx], y: sma[idx] }))
      },
      {
        name: 'BB Lower',
        type: 'line',
        data: prices.map((p, idx) => ({ x: dates[idx], y: lower[idx] }))
      }
    ];
  } else {
    // Default View: Candles or Line
    series = [{
      name: `${symbol} Price`,
      type: chartType,
      data: prices.map((p, idx) => ({
        x: dates[idx],
        y: chartType === 'candlestick' ? [p.open, p.high, p.low, p.close] : p.close
      }))
    }];
  }

  const isCandle = chartType === 'candlestick' && activeIndicator !== 'rsi' && activeIndicator !== 'macd';

  const options = {
    chart: {
      id: 'stock-history',
      type: chartOptionsType,
      background: 'transparent',
      foreColor: '#94a3b8',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 400,
      },
    },
    title: {
      text: `${symbol.toUpperCase()} - Technical Chart (${activeIndicator.toUpperCase()})`,
      align: 'left',
      style: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#f8fafc',
        fontFamily: 'var(--font-display)',
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        style: {
          colors: '#94a3b8',
          fontSize: '11px',
        },
      },
    },
    yaxis: customYAxis,
    annotations: customAnnotations,
    theme: {
      mode: 'dark',
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.05)',
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } }
    },
    stroke: {
      width: activeIndicator === 'macd' ? [0, 2, 2] : (activeIndicator === 'bollinger' ? [isCandle ? 1 : 2, 1.5, 1.5, 1.5] : [isCandle ? 1 : 2.5]),
      dashArray: activeIndicator === 'bollinger' ? [0, 5, 0, 5] : [0],
      colors: activeIndicator === 'macd' 
        ? [undefined, '#4edea3', '#adc6ff'] 
        : (activeIndicator === 'bollinger' 
          ? [undefined, 'rgba(59, 130, 246, 0.7)', 'rgba(168, 85, 247, 0.7)', 'rgba(59, 130, 246, 0.7)']
          : (chartType === 'line' ? ['#4edea3'] : undefined))
    },
    colors: activeIndicator === 'macd' ? ['#ef4444', '#4edea3', '#adc6ff'] : undefined,
    tooltip: {
      shared: true,
      y: {
        formatter: (val) => val !== null ? `$${val.toFixed(2)}` : 'N/A',
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#10b981',   // emerald green
          downward: '#ef4444', // red
        },
      },
      bar: {
        colors: {
          ranges: [
            { from: -100000, to: 0, color: 'rgba(239, 68, 68, 0.85)' },
            { from: 0.00001, to: 100000, color: 'rgba(16, 185, 129, 0.85)' }
          ]
        },
        columnWidth: '80%'
      }
    },
  };

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <div className="apex-chart-wrap" style={{ width: '100%', height: '100%', minHeight: isMobile ? '300px' : '400px' }}>
      <Chart
        options={options}
        series={series}
        type={chartOptionsType}
        height={isMobile ? '300px' : '400px'}
      />
    </div>
  );
};

export default ApexChartComponent;
