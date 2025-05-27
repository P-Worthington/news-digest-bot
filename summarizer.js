import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import 'dotenv/config';

export default async function summarizeArticle(url) {
  const html = await fetch(url).then(res => res.text());
  const $ = cheerio.load(html);

  // Extract paragraphs
  const paragraphs = $('p')
    .map((i, el) => $(el).text())
    .get()
    .join(' ')
    .slice(0, 4000); // Trim to avoid token limit

  const prompt = `Summarize the following BBC or Sky News article in less than 500 characters and in 3-4 bullet points with key information only:\n\n${paragraphs}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Error summarizing text: ${error}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}