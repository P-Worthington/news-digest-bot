import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const BASE_BBC = 'https://www.bbc.co.uk';
const BBC_URL = `${BASE_BBC}/news/uk`;
const SKY_URL = 'https://news.sky.com/uk';
const BBC_WORLD_URL = `${BASE_BBC}/news/world`;
const SKY_WORLD_URL = 'https://news.sky.com/world';

export default async function getArticles() {
  const [bbcUK, skyUK] = await Promise.all([getBBCUKArticles(), getSkyUKArticles()]);
  const [bbcWorld, skyWorld] = await Promise.all([getBBCWorldArticles(), getSkyWorldArticles()]);
  const finance = await getYahooFinanceArticle();

  return {
    uk: [...bbcUK, ...skyUK],
    world: [...bbcWorld, ...skyWorld],
    finance
  };
}

// BBC UK
async function getBBCUKArticles() {
  const res = await fetch(BBC_URL);
  const html = await res.text();
  const $ = cheerio.load(html);
  const articles = [];

  $('a:has(h3)').each((i, el) => {
    if (articles.length >= 3) return;
    const title = $(el).text().trim();
    const href = $(el).attr('href');
    if (!title || !href) return;
    const url = href.startsWith('http') ? href : `${BASE_BBC}${href}`;
    if (url.startsWith('http')) {
      articles.push({ title, url });
    }
  });

  return articles;
}

// Sky UK
async function getSkyUKArticles() {
  const res = await fetch(SKY_URL);
  const html = await res.text();
  const $ = cheerio.load(html);
  const articles = [];

  $('a.ui-story-headline').each((i, el) => {
    if (articles.length >= 3) return;
    const title = $(el).text().trim();
    const href = $(el).attr('href');
    if (!title || !href) return;
    const url = href.startsWith('http') ? href : `https://news.sky.com${href}`;
    if (url.startsWith('http')) {
      articles.push({ title, url });
    }
  });

  return articles;
}

// BBC World
async function getBBCWorldArticles() {
  const res = await fetch(BBC_WORLD_URL);
  const html = await res.text();
  const $ = cheerio.load(html);
  const articles = [];

  $('a:has(h3)').each((i, el) => {
    if (articles.length >= 2) return;
    const title = $(el).text().trim();
    const href = $(el).attr('href');
    if (!title || !href) return;
    const url = href.startsWith('http') ? href : `${BASE_BBC}${href}`;
    if (url.startsWith('http')) {
      articles.push({ title, url });
    }
  });

  return articles;
}

// Sky World
async function getSkyWorldArticles() {
  const res = await fetch(SKY_WORLD_URL);
  const html = await res.text();
  const $ = cheerio.load(html);
  const articles = [];

  $('a.ui-story-headline').each((i, el) => {
    if (articles.length >= 2) return;
    const title = $(el).text().trim();
    const href = $(el).attr('href');
    if (!title || !href) return;
    const url = href.startsWith('http') ? href : `https://news.sky.com${href}`;
    if (url.startsWith('http')) {
      articles.push({ title, url });
    }
  });

  return articles;
}

// Yahoo Finance
async function getYahooFinanceArticle() {
  const YAHOO_FINANCE_URL = 'https://uk.finance.yahoo.com/';
  const res = await fetch(YAHOO_FINANCE_URL);
  const html = await res.text();
  const $ = cheerio.load(html);
  const articles = [];

  $('a.titles-link').each((i, el) => {
    const title = $(el).find('h3, h2').first().text().trim(); // safer selector
    const href = $(el).attr('href');
    if (!title || !href) return;
    const url = href.startsWith('http') ? href : `https://uk.finance.yahoo.com${href}`;
    if (url.startsWith('http')) {
      articles.push({ title, url });
      return false; // stop after first article
    }
  });

  return articles;
}
