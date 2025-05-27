import getArticles from './scraper.js';
import summarizeArticle from './summarizer.js';
import { getWeatherForDigest } from './weather.js';
import { sendDigestEmail } from './mailer.js';

const allArticles = await getArticles();

let digestHtml = `
  <h1>📰 Daily News Digest</h1>
  <hr>
`;

for (const [category, articles] of Object.entries(allArticles)) {
  digestHtml += `<h2>🔹 ${category.toUpperCase()} News</h2>`;

  for (const article of articles) {
    if (!article.url || !article.url.startsWith('http')) continue;

    try {
      const summary = await summarizeArticle(article.url);
      digestHtml += `
        <p>
          <strong>🗞️ ${article.title}</strong><br>
          <a href="${article.url}">🔗 Read full article</a><br>
          📝 ${summary}
        </p>
        <hr>
      `;
    } catch {
      digestHtml += `
        <p>
          <strong>🗞️ ${article.title}</strong><br>
          <a href="${article.url}">🔗 Read full article</a><br>
          ❌ Summary failed.
        </p>
        <hr>
      `;
    }
  }
}

const weatherReports = await getWeatherForDigest();
digestHtml += `<h2>🌤️ Weather Forecast</h2>`;
digestHtml += weatherReports.map(w => `<p>${w}</p>`).join('\n');

await sendDigestEmail('🗞️ Daily News Digest', digestHtml);