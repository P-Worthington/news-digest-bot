import fetch from 'node-fetch';

const locations = [
  { name: 'Congleton', lat: 53.1638, lon: -2.2140 },
  { name: 'Manchester', lat: 53.4808, lon: -2.2426 }
];

function formatHour(hourStr) {
  const hour = new Date(hourStr).getHours();
  return `${hour}:00`;
}

export async function getWeatherForDigest() {
  const results = [];

  for (const { name, lat, lon } of locations) {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,weathercode&timezone=Europe%2FLondon`
    );

    if (!res.ok) {
      results.push(`❌ Could not fetch weather for ${name}`);
      continue;
    }

    const data = await res.json();
    const now = new Date();
    const next24 = [];

    for (let i = 0; i < data.hourly.time.length; i++) {
      const timestamp = new Date(data.hourly.time[i]);

      if (timestamp > now && timestamp - now <= 24 * 60 * 60 * 1000) {
        next24.push({
          time: formatHour(data.hourly.time[i]),
          temp: data.hourly.temperature_2m[i],
          rain: data.hourly.precipitation_probability[i]
        });
      }
    }

    const reportLines = next24.map(f =>
      `${f.time}: ${f.temp}°C, 🌧️ ${f.rain}% chance of rain`
    );

    results.push(
      `📍 ${name} 24-hour forecast:\n${reportLines.slice(0, 6).join('\n')}` // Limit to next 6 hours for brevity
    );
  }

  return results;
}