import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const LOCATIONS = ['Congleton', 'Manchester'];

export async function getWeatherForDigest() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const results = [];

  for (const location of LOCATIONS) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${apiKey}`;
    const res = await fetch(url);
    const json = await res.json();

    const now = new Date();
    const start = new Date(now);
    start.setHours(9, 0, 0, 0); // today at 09:00

    const end = new Date(start);
    end.setDate(start.getDate() + 1); // tomorrow at 09:00

    const filtered = json.list.filter(entry => {
      const time = new Date(entry.dt * 1000);
      return time >= start && time <= end;
    });

    const hourly = filtered.map(entry => {
      const time = new Date(entry.dt * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const temp = entry.main.temp.toFixed(1);
      const rainChance = entry.pop ? Math.round(entry.pop * 100) : 0;
      const emoji = rainChance > 50 ? '🌧️' : '🌤️';
      return `${time}: ${temp}°C, ${emoji} ${rainChance}% chance of rain`;
    });

    results.push(`<strong>${location} Forecast:</strong><br>${hourly.join('<br>')}`);
  }

  return results;
}