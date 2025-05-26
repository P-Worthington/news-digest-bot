import getArticles from './scraper.js';
import summarizeArticle from './summarizer.js';

const allArticles = await getArticles();

for (const [category, articles] of Object.entries(allArticles)) {
  console.log(`\n🔹 ${category.toUpperCase()} NEWS:\n`);

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
    } catch (err) {
      console.error(`❌ Failed to summarize: ${article.url}\n  Error: ${err.message}\n`);
    }
  }
}
