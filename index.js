import getArticles from './scraper.js';
import summarizeArticle from './summarizer.js';
import { getWeatherForDigest } from './weather.js';
import { sendDigestEmail } from './mailer.js';

async function runDigest() {
  const allArticles = await getArticles();
  const weatherReports = await getWeatherForDigest();

  let digest = '';

  for (const [category, articles] of Object.entries(allArticles)) {
    console.log(`\n🔹 ${category.toUpperCase()} NEWS:\n`);
    digest += `\n🔹 ${category.toUpperCase()} NEWS:\n\n`;

    for (const article of articles) {
      if (!article.url || !article.url.startsWith('http')) {
        console.warn('⚠️ Skipping invalid URL:', article.url);
        continue;
      }

      try {
        console.log(`🗞️ ${article.title}`);
        console.log(`🔗 ${article.url}`);
        const summary = await summarizeArticle(article.url);
        console.log(`📝 ${summary}\n`);

        digest += `🗞️ ${article.title}\n🔗 ${article.url}\n📝 ${summary}\n\n`;
      } catch (err) {
        console.error(`❌ Failed to summarize: ${article.url}\n  Error: ${err.message}\n`);
        digest += `🗞️ ${article.title}\n🔗 ${article.url}\n❌ Summary failed.\n\n`;
      }
    }
  }

  console.log(`🌤️ Weather Forecast:\n`);
  digest += `\n🌤️ Weather Forecast:\n`;
  for (const report of weatherReports) {
    console.log(`${report}\n`);
    digest += `📍 ${report}\n`;
  }

  await sendDigestEmail('Daily News Digest', digest);
}

runDigest().catch(err => {
  console.error('❌ Digest run failed:', err);
});