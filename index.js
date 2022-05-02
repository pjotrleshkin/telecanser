import { createRequire } from "module";
const require = createRequire(import.meta.url);

const fs = require("fs");
const puppeteerChrome = require('puppeteer');

const { Telegraf, Markup, Scenes, session } = require('telegraf');

const bot = new Telegraf('5272155925:AAEujqTLXySZkIsAuElDpVjC1n7uPXcm34w'); 


//Web Scrapper Part
//just added params
const Web_Scrapper = async function (footwear_size, gender, discountMin) {

    const test = async (browser) => {
        const page = await browser.newPage();
        await page.setViewport({
            width: 1280,
            height: 800
        });



        // Params for URLsprovided by user in telegram
        let UserFootWearSize = '44.5';
        let UserClothingSize = 'L';
        let UserGender = 1;
        let UserCategoryNames = 0;
        let UserPricemax = 70;
        let UserPricemin = 25;
        let UserDiscountMin = 50;


        //combine the params for outlet and sportland main page
        let baseURLSportland = 'https://sportland.ee/';
        let baseURLSportlandOutlet = ' https://outlet.sportland.ee/';
        let SportlandGender = ['naised/', 'mehed/'];
        let SportlandCategoryName = ['jalanoud', 'riietus/pusad', 'riietus/topid-ja-sargid', '/riietus/polod', '/sport/korvpall', '/sport/tennis'];
        let SportlandFootwearSize = '?footwear_size=' + UserFootWearSize;
        let SportlandCloathingSize = '?clothing_size=' + UserClothingSize;
        let SportlandPriceMax = '&priceMax=' + UserPricemax;
        let SportlandPriceMin = '&priceMin=' + UserPricemin;
        let SportlandDiscountMin = '&discountMin=' + UserDiscountMin;

        //finalize url for sportland.ee
        var SportlandFinalURL0 = baseURLSportland.concat(SportlandGender[UserGender], SportlandCategoryName[UserCategoryNames]);

        //finalize url for outlet with params
        if (SportlandFinalURL0.includes('jalanoud')) {
            var SportlandFinalURL1 = SportlandFinalURL0.concat(SportlandFootwearSize);
            var SportlandFinalURL2 = SportlandFinalURL1.concat(SportlandPriceMax);
            var SportlandFinalURL3 = SportlandFinalURL2.concat(SportlandPriceMin, SportlandDiscountMin);
        }
        else {
            var SportlandFinalURL1 = SportlandFinalURL0.concat(SportlandCloathingSize);
            var SportlandFinalURL2 = SportlandFinalURL1.concat(SportlandPriceMax);
            var SportlandFinalURL3 = SportlandFinalURL2.concat(SportlandPriceMin);
        };
        console.log('SportlandFinalURL3_jalanoud: ' + SportlandFinalURL3);

        //finalize url for outlet  with params
        var SportlandOutletFinalURL0 = baseURLSportlandOutlet + SportlandGender[UserGender] + SportlandCategoryName[UserCategoryNames];
        if (SportlandOutletFinalURL0.includes('jalanoud')) {
            var SportlandOutletFinalURL1 = SportlandOutletFinalURL0;
            var SportlandOutletFinalURL2 = SportlandOutletFinalURL0 + SportlandFootwearSize;
            var SportlandOutletFinalURL3 = SportlandOutletFinalURL2.concat(SportlandPriceMin, SportlandDiscountMin);
        }
        else {
            var SportlandOutletFinalURL1 = SportlandOutletFinalURL0.concat(SportlandCloathingSize);
            var SportlandOutletFinalURL2 = SportlandOutletFinalURL1.concat(SportlandPriceMax);
            var SportlandOutletFinalURL3 = SportlandOutletFinalURL2.concat(SportlandPriceMin, SportlandDiscountMin);
        };

        console.log('SportlandOutletFinalURL3_jalanoud:' + SportlandOutletFinalURL3);

        //do the Puppeteer canser
        //accept cookies
        const [button1] = await page.$x("//button[contains(., 'Luba küpsised')]");
        if (button1) {
            await button1.click();
        }

        await page.goto(SportlandOutletFinalURL1);
        await page.waitForTimeout(7000);

        try {
            await page.evaluate(() => { document.getElementsByClassName('Popup-CloseBtn')[0].click(); });
          } catch (error) {
            console.log('whatever');
          } 
        
        await page.waitForTimeout(7000);
        await page.goto(SportlandOutletFinalURL3);

        await page.waitForTimeout(7000);

        await autoScroll(page);
        /* Run javascript inside the page */
        const inner_html = await page.$eval('.ProductCard', element => element.innerHTML);
        //really working shit 
        const elements = await page.$$(".ProductCard-Link");
        elements.forEach(async (element) => {
            let text = await (await element.getProperty("innerText")).jsonValue();
            let link = await (await element.getProperty("href")).jsonValue();
            text = text.concat(link, '\n');

            //or if(text.includes('-40%' || '-50%' ||'-60%'||'-70%')) etc.
            if (true) {
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
                    if (err)
                        throw err;
                });
            }
        });
        // await browser.close();
    };

    const chrome = await puppeteerChrome.launch({
        headless: false,
        slowMo: 50,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    });
    await test(chrome);

    async function autoScroll(page) {
        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 50;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }
    //end of WebScrapper
};

var scrapped_shit;
//get file content
 var get_File_content =  async function () {
    try {  
        scrapped_shit = fs.readFileSync('message.txt', 'utf8').toString();
        console.log(scrapped_shit);    
        }


     catch(e) {
        console.log('Error:', e.stack);
    }
}

var clear_message = async function () {
    fs.truncate('message.txt', 0, function(){console.log('done')})
}

//stupid shit
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Telegram bot Parts
bot.start((ctx) => ctx.reply('Welcome!'));
bot.help((ctx) => ctx.reply('type "yolo" to me!'))

//problematic canserino
bot.hears('yolo',  (ctx) => {
    ctx.reply('gimme a sec');

    const revolution_johny = async () => {
        ctx.reply('russky runes');
        await Web_Scrapper();
        await timeout(1000);
        await get_File_content();
        await ctx.reply(scrapped_shit);
        await clear_message();
    };
    revolution_johny();
    setInterval(function(){ revolution_johny()},900000);
})

//new canserino 2.0
bot.command("inline", (ctx) => {
    ctx.reply("Are you pal or gal? \n What is your shoe size? \n What is your clothing size (preferred)? \n How frequently you would like to get notified about discounts?", {
        reply_markup: {
            inline_keyboard: [
                /* Inline buttons. 2 side-by-side */
                [ { text: "Button 1", callback_data: "btn-1" }, { text: "Button 2", callback_data: "btn-2" } ],

                /* One button */
                [ { text: "Next", callback_data: "next" } ],
                
                /* Also, we can have URL buttons. */
                [ { text: "Open in browser", url: "telegraf.js.org" } ]
            ]
        }
    });

});



bot.launch()