import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const BASE_BBC = 'https://www.bbc.co.uk';
const BBC_URL = `${BASE_BBC}/news/uk`;
const BBC_WORLD_URL = `${BASE_BBC}/news/world`;
const SKY_URL = 'https://news.sky.com/uk';
const SKY_WORLD_URL = 'https://news.sky.com/world';
const YAHOO_FINANCE_URL = 'https://uk.finance.yahoo.com/';

export default async function getArticles() {
  const [bbcUK, skyUK] = await Promise.all([getBBCArticles(BBC_URL), getSkyArticles(SKY_URL)]);
  const [bbcWorld, skyWorld] = await Promise.all([getBBCArticles(BBC_WORLD_URL), getSkyArticles(SKY_WORLD_URL)]);
  const finance = await getYahooFinanceArticle();

  return {
    uk: [...bbcUK, ...skyUK],
    world: [...bbcWorld, ...skyWorld],
    finance
  };
}

// Generic BBC Article Fetcher
async function getBBCArticles(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const articles = [];

    // Select headline and subsidiary articles
    $('a.ssrcss-gvf9zo-PromoLink, a.ssrcss-5wtq5v-PromoLink').each((i, el) => {
      if (articles.length >= 3) return;
      const title = $(el).text().trim();
      const href = $(el).attr('href');
      if (!title || !href) return;
      const fullUrl = href.startsWith('http') ? href : `${BASE_BBC}${href}`;
      articles.push({ title, url: fullUrl });
    });

    return articles;
  } catch (error) {
    console.error(`Error fetching BBC articles from ${url}:`, error);
    return [];
  }
}

// Generic Sky News Article Fetcher
async function getSkyArticles(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const articles = [];

    // Select top stories
    $('a.sdc-site-tile__headline-link').each((i, el) => {
      if (articles.length >= 3) return;
      const title = $(el).text().trim();
      const href = $(el).attr('href');
      if (!title || !href) return;
      const fullUrl = href.startsWith('http') ? href : `https://news.sky.com${href}`;
      articles.push({ title, url: fullUrl });
    });

    return articles;
  } catch (error) {
    console.error(`Error fetching Sky News articles from ${url}:`, error);
    return [];
  }
}

// Yahoo Finance Article Fetcher
async function getYahooFinanceArticle() {
  try {
    const res = await fetch(YAHOO_FINANCE_URL);
    const html = await res.text();
    const $ = cheerio.load(html);
    const articles = [];

    $('a.titles-link').each((i, el) => {
      const title = $(el).find('h3, h2').first().text().trim();
      const href = $(el).attr('href');
      if (!title || !href) return;
      const fullUrl = href.startsWith('http') ? href : `https://uk.finance.yahoo.com${href}`;
      articles.push({ title, url: fullUrl });
      return false; // Stop after first article
    });

    return articles;
  } catch (error) {
    console.error('Error fetching Yahoo Finance article:', error);
    return [];
  }
}