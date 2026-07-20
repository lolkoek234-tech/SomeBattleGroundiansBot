import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const width = 800;
const height = 400;
const canvas = new ChartJSNodeCanvas({ width, height, backgroundColour: '#2f3136' });

export const chartGenerator = {
  async moderationChart(casesPerDay) {
    const configuration = {
      type: 'bar',
      data: {
        labels: casesPerDay.map(d => d.date),
        datasets: [{
          label: 'Moderation Actions',
          data: casesPerDay.map(d => d.count),
          backgroundColor: '#5865F2',
          borderColor: '#4752C4',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: false,
        plugins: {
          legend: { labels: { color: 'white' } },
        },
        scales: {
          x: { ticks: { color: 'white' } },
          y: { ticks: { color: 'white', stepSize: 1 } },
        },
      },
    };
    return canvas.renderToBuffer(configuration);
  },

  async warningPieChart(warnData) {
    const configuration = {
      type: 'pie',
      data: {
        labels: warnData.map(d => d.label),
        datasets: [{
          data: warnData.map(d => d.count),
          backgroundColor: ['#ED4245', '#FEE75C', '#57F287', '#5865F2', '#EB459E'],
        }],
      },
      options: {
        responsive: false,
        plugins: {
          legend: { labels: { color: 'white' } },
        },
      },
    };
    return canvas.renderToBuffer(configuration);
  },

  async saveToFile(buffer, filename) {
    const assetsDir = join(process.cwd(), 'assets');
    const filepath = join(assetsDir, filename);
    await writeFile(filepath, buffer);
    return filepath;
  },
};
