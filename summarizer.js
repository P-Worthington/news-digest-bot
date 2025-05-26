import axios from 'axios';
import * as cheerio from 'cheerio';
import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const summarizeArticle = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const paragraphs = $('article p')
            .map((_, el) => $(el).text())
            .get()
            .join(' ')
            .trim();

        if (!paragraphs) {
            return '[No article content found to summarize]';
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Read the following news article and write a concise, fact-rich summary.Focus on the key facts, names, numbers, quotes, and developments mentioned in the article. Avoid general statements and ensure the reader understands the main story clearly. Summarize in less than 1000 characters"
                },
                {
                    role: "user",
                    content: paragraphs
                }
            ],
            temperature: 0.7
        });

        return completion.choices[0].message.content.trim();
    } catch (err) {
        console.error('Error summarizing text:', err.message);
        return '[Summary unavailable]';
    }
};

export default summarizeArticle;
