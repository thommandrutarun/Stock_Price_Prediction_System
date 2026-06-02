import Chart from 'react-apexcharts';

const ApexChartComponent = ({ prices, chartType, symbol }) => {
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

  const isCandle = chartType === 'candlestick';

  // Format data for ApexCharts
  const seriesData = prices.map((p) => {
    const xVal = new Date(p.date).getTime();
    if (isCandle) {
      return {
        x: xVal,
        y: [p.open, p.high, p.low, p.close],
      };
    } else {
      return {
        x: xVal,
        y: p.close,
      };
    }
  });

  const series = [{
    name: `${symbol} Price`,
    data: seriesData,
  }];

  const options = {
    chart: {
      id: 'stock-history',
      type: chartType,
      background: 'transparent',
      foreColor: '#94a3b8',
      toolbar: {
        show: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
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
        speed: 500,
      },
    },
    title: {
      text: `${symbol.toUpperCase()} Historical Price Chart`,
      align: 'left',
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#fff',
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
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        formatter: (val) => val.toFixed(2),
        style: {
          colors: '#94a3b8',
        },
      },
    },
    theme: {
      mode: 'dark',
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.06)',
    },
    stroke: {
      width: isCandle ? 1 : 3,
      colors: isCandle ? undefined : ['#3b82f6'],
    },
    tooltip: {
      shared: true,
      y: {
        formatter: (val) => `$${val.toFixed(2)}`,
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#10b981',   // emerald green
          downward: '#ef4444', // red
        },
      },
    },
  };

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <div className="apex-chart-wrap" style={{ width: '100%', height: '100%', minHeight: isMobile ? '300px' : '380px' }}>
      <Chart
        options={options}
        series={series}
        type={chartType}
        height={isMobile ? '300px' : '380px'}
      />
    </div>
  );
};

export default ApexChartComponent;
