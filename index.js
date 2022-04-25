//Web Scrapper Part
const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const fs = require("fs");
const puppeteerChrome = require('puppeteer');



(async () => {

    const test = async browser => {
        const page = await browser.newPage();
        await page.setViewport({
            width: 1280,
            height: 800
        });



        // Params for URLsprovided by user in telegram
       let UserFootWearSize = '44.5'
       let UserClothingSize = 'L'
       let UserGender = 1
       let userCategoryNames = 0
       let UserPricemax = 70
       let UserPricemin = 25


       //combine the params for outlet and sportland main page
       let baseURLSportland = 'https://sportland.ee/';
       let baseURLSportlandOutlet = ' https://outlet.sportland.ee/';
       let SportlandGender = ['naised/','mehed/'];
       let SportlandCategoryName = ['jalanoud', 'riietus/pusad','riietus/topid-ja-sargid','/riietus/polod','/sport/korvpall','/sport/tennis'];
       let SportlandOutletSalableParam = '?is_e_salable=1';
       let SportlandFootwearSize = '?footwear_size=' + UserFootWearSize;
       let SportlandCloathingSize = '?clothing_size=' + UserClothingSize;
       let SportlandPriceMax = '&priceMax=' + UserPricemax
       let SportlandPriceMin = '&priceMin=' + UserPricemin

       //finalize url for sportland.ee
        var SportlandFinalURL0 =baseURLSportland.concat(SportlandGender[UserGender], SportlandCategoryName[userCategoryNames]); 

        //finalize url for outlet with params
        if (SportlandFinalURL0.includes('jalanoud')){
            var SportlandFinalURL1=  SportlandFinalURL0.concat(SportlandFootwearSize)
            var SportlandFinalURL2= SportlandFinalURL1.concat(SportlandPriceMax)
            var SportlandFinalURL3 = SportlandFinalURL2.concat(SportlandPriceMin)
        }
        else {
            var SportlandFinalURL1 = SportlandFinalURL0.concat(SportlandCloathingSize)
            var SportlandFinalURL2 = SportlandFinalURL1.concat(SportlandPriceMax)
            var SportlandFinalURL3 = SportlandFinalURL2.concat(SportlandPriceMin)
        };
        console.log(SportlandFinalURL3);

        //finalize url for outlet  with params
        var SportlandOutletFinalURL0 = baseURLSportlandOutlet +SportlandGender[UserGender] +SportlandCategoryName[userCategoryNames];
        if (SportlandOutletFinalURL0.includes('jalanoud')){
            var SportlandOutletFinalURL1=  SportlandOutletFinalURL0 + SportlandOutletSalableParam;
            var SportlandOutletFinalURL2=  SportlandOutletFinalURL0 + SportlandFootwearSize + SportlandOutletSalableParam;
            var SportlandOutletFinalURL3=  SportlandOutletFinalURL2.concat(SportlandPriceMin)
        }
        else {
            var SportlandOutletFinalURL1=  SportlandOutletFinalURL0.concat(SportlandCloathingSize)
            var SportlandOutletFinalURL2=  SportlandOutletFinalURL1.concat(SportlandPriceMax)
            var SportlandOutletFinalURL3=  SportlandOutletFinalURL2.concat(SportlandPriceMin)
        };

        console.log(SportlandOutletFinalURL2);

        //https://outlet.sportland.ee/mehed/jalanoud?footwear_size=40.5&amp;is_e_salable=1
        //do the Puppeteer canser
        await page.goto(SportlandOutletFinalURL2);
        //accept cookies
        
        const [button] = await page.$x("//button[contains(., 'Luba küpsised')]");
        if (button) {
         await button.click();
        }
        await page.waitForTimeout(5000);
        await page.goto(SportlandOutletFinalURL1);
        await page.waitForTimeout(15000);
        await page.goto(SportlandOutletFinalURL2);
        await page.waitForTimeout(15000);
        await page.goto(SportlandOutletFinalURL3);
        

       
       
        //await autoScroll(page);
        /* Run javascript inside the page */
        const inner_html = await page.$eval('.ProductCard', element => element.innerHTML);
        //console.log(inner_html);


        //really working shit 
        const elements = await page.$$(".ProductCard-Link");
        elements.forEach(async element => {
           let text = await (await element.getProperty("innerText")).jsonValue();
           let link = await (await element.getProperty("href")).jsonValue();
           text = text.concat(link, '\n');
            if(text.includes('-40%' || '-50%' ||'-60%'||'-70%')){
           //clean initial input
           var text_clean = text.replace(/(^\r*\n)/gm, "");
            var s = text_clean;
            var nth = 0;
            s = s.replace(/€/g, function (match, i, original) {
            nth++;
            return (nth === 2) ? "\n" : match;
            });
            s = s.replace(/€/g, '');

            //push that to file
           fs.appendFile('message.txt', s, function (err) {
            if (err) throw err;
          });

            }

            //console.log(await text);
        });

       // await browser.close();
    }

    const chrome = await puppeteerChrome.launch({
        headless: false,
        slowMo: 50,
        executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    });
    await test(chrome);

})();

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 50;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100)
        });
    });
}



//Telegram bot Parts
const { Telegraf } = require('telegraf')

const bot = new Telegraf('5272155925:AAEujqTLXySZkIsAuElDpVjC1n7uPXcm34w')
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()