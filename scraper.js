import axios from 'axios';
import * as cheerio from 'cheerio';

const getNews = async () => {
    try {
        const { data } = await axios.get('https://www.bbc.co.uk/news');
        const $ = cheerio.load(data);
        const headlines = [];

        // Get main headline
        const main = $('a.ssrcss-gvf9zo-PromoLink').first();
        const mainTitle = main.find('p').text().trim();
        let mainLink = main.attr('href');
        if (mainLink && !mainLink.startsWith('http')) {
            mainLink = `https://www.bbc.co.uk${mainLink}`;
        }
        if (mainTitle && mainLink) {
            headlines.push({ title: mainTitle, link: mainLink });
        }

        // Get next 4 headlines
        $('a.ssrcss-5wtq5v-PromoLink').slice(0, 1).each((i, el) => {
            const title = $(el).find('p').text().trim();
            let link = $(el).attr('href');
            if (link && !link.startsWith('http')) {
                link = `https://www.bbc.co.uk${link}`;
            }
            if (title && link) {
                headlines.push({ title, link });
            }
        });

        return headlines;
    } catch (err) {
        console.error('Error fetching BBC news:', err.message);
        return [];
    }
};

export default getNews;