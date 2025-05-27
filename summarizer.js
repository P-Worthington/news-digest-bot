import fetch from 'node-fetch';
import dotenv from 'dotenv';
import extractMainContent from './extractor.js';

dotenv.config();

export default async function summarizeArticle(url) {
  try {
    const html = await (await fetch(url)).text();
    const fullText = await extractMainContent(html);

    if (!fullText) throw new Error('No content extracted');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Summarise the following news article in 1–2 very short sentences (max 35 words total). Focus only on the most important facts. Avoid filler, background, or commentary.

Article:
${fullText}`,
          },
        ],
        temperature: 0.3, // Lower temperature for more focused results
      }),
    });

    const json = await res.json();
    const message = json.choices?.[0]?.message?.content;
    if (!message) throw new Error('No summary returned');

    return message.replace(/^- /gm, '•').trim();
  } catch (err) {
    console.error(`❌ Failed to summarize: ${url}\n  Error: ${err.message}`);
    throw err;
  }
}