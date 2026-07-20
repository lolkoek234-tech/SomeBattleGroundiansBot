const QUICKCHART_URL = 'https://quickchart.io/chart';

const buildConfig = (type, data, options) => ({ type, data, options });

export const chartGenerator = {
  async moderationChart(casesPerDay) {
    const config = buildConfig('bar', {
      labels: casesPerDay.map(d => d.date),
      datasets: [{
        label: 'Moderation Actions',
        data: casesPerDay.map(d => d.count),
        backgroundColor: '#5865F2',
        borderColor: '#4752C4',
        borderWidth: 1,
      }],
    }, {
      plugins: { legend: { labels: { color: 'white' } } },
      scales: {
        x: { ticks: { color: 'white' } },
        y: { ticks: { color: 'white', stepSize: 1 } },
      },
    });

    return this._fetchChart(config);
  },

  async warningPieChart(warnData) {
    const config = buildConfig('pie', {
      labels: warnData.map(d => d.label),
      datasets: [{
        data: warnData.map(d => d.count),
        backgroundColor: ['#ED4245', '#FEE75C', '#57F287', '#5865F2', '#EB459E'],
      }],
    }, {
      plugins: { legend: { labels: { color: 'white' } } },
    });

    return this._fetchChart(config);
  },

  async _fetchChart(config) {
    const params = new URLSearchParams({
      c: JSON.stringify({ ...config, options: { ...config.options, responsive: false } }),
      width: '800',
      height: '400',
      backgroundColor: '2f3136',
      format: 'png',
    });

    const res = await fetch(`${QUICKCHART_URL}?${params}`);
    if (!res.ok) throw new Error(`QuickChart error: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  },
};
