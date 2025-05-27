import { JSDOM } from 'jsdom';

export default async function extractMainContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const articleTags = ['article', 'main', 'section'];
  for (const tag of articleTags) {
    const el = document.querySelector(tag);
    if (el) return el.textContent.trim();
  }

  // fallback to full body text
  return document.body.textContent.trim();
}