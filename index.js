// index.js
import getNews from './scraper.js';
import summarizeArticle from './summarizer.js';

const delay = ms => new Promise(res => setTimeout(res, ms));

const run = async () => {
  const headlines = await getNews();

  console.log("📬 BBC News Digest:\n");

  for (const { title, link } of headlines) {
    console.log(`📰 ${title}`);
    console.log(`🔗 ${link}`);

    const summary = await summarizeArticle(link).catch((err) => {
      console.error('Error summarizing text:', err.message);
      return '[Summary unavailable]';
    });

    console.log(`📝 Summary: ${summary}\n`);

    // Add a delay to prevent hitting rate limits
    await delay(2000); // Wait 2 seconds
  }
};

run();