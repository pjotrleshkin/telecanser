//Web Scrapper Part
const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const fs = require("fs");



//CHEERIO SAMPLE - NO BROWSER - GOOD FOR OKIDOKI FOR EXAMPLE
// URL of the page we want to scrape
const url = "https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3";

// Async function which scrapes the data
async function scrapeData() {
  try {
    // Fetch HTML of the page we want to scrape
    const { data } = await axios.get(url);
    // Load HTML we fetched in the previous line
    const $ = cheerio.load(data);
    // Select all the list items in plainlist class
    const listItems = $(".plainlist ul li");
    // Stores data for all countries
    const countries = [];
    // Use .each method to loop through the li we selected
    listItems.each((idx, el) => {
      // Object holding data for each country/jurisdiction
      const country = { name: "", iso3: "" };
      // Select the text content of a and span elements
      // Store the textcontent in the above object
      country.name = $(el).children("a").text();
      country.iso3 = $(el).children("span").text();
      // Populate countries array with country data
      countries.push(country);
    });
    // Logs countries array to the console
    // console.dir(countries);
    // Write countries array in countries.json file
    fs.writeFile("coutries.json", JSON.stringify(countries, null, 2), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Successfully written data to file");
    });
  } catch (err) {
    console.error(err);
  }
}
// Invoke the above function
scrapeData();



//puppeteer part
const puppeteerChrome = require('puppeteer');


(async () => {

    const test = async browser => {
        const page = await browser.newPage();
        await page.setViewport({
            width: 1280,
            height: 800
        });
        await page.goto('https://www.bbc.com/news');   
        await page.screenshot({ path: 'bcc-most-read.png' })
        
        await browser.close();
    }

    const chrome = await puppeteerChrome.launch({
        headless: false,
        slowMo: 50,
        executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    });
    await test(chrome);

})();








//Telegram bot Parts
const { Telegraf } = require('telegraf')

const bot = new Telegraf('5272155925:AAEujqTLXySZkIsAuElDpVjC1n7uPXcm34w')
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()