const fs = require("fs");
const puppeteerChrome = require('puppeteer');
const {
    Telegraf
} = require('telegraf');
const bot = new Telegraf('5272155925:AAEujqTLXySZkIsAuElDpVjC1n7uPXcm34w');


//db thingy
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tgbot"
});
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to DB!");
});
// end of db thingy



//Web Scrapper Part 
const Web_Scrapper = async function (shoe_size, gender,discount_min ,chatid) {

    const test = async (browser) => {
        const page = await browser.newPage();
        await page.setViewport({
            width: 1280,
            height: 800
        });



        // Params for URLsprovided by user in telegram
        let UserFootWearSize = shoe_size;
        console.log(UserFootWearSize)
        let UserClothingSize = 'L';
        if (gender = 'M'){
            var UserGender = 0;
        }
        else if(gender = 'F') {
            var UserGender  = 1;
        }
        //let UserGender = gender;
        console.log(gender);
        let UserCategoryNames = 0;
        let UserPricemax = 70;
        let UserPricemin = 25;
        let UserDiscountMin = discount_min;


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
        } else {
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
        } else {
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
            await page.evaluate(() => {
                document.getElementsByClassName('Popup-CloseBtn')[0].click();
            });
        } catch (error) {
            console.log('whatever');
        }

        await page.waitForTimeout(7000);
        await page.goto(SportlandOutletFinalURL3);

        await page.waitForTimeout(7000);

        await autoScroll(page);
        /* Run javascript inside the page */
        var inner_html = "";
        try {
            inner_html = (await page.$eval('.ProductCard', element => element.innerHTML)) || "";
            await console.log('bump');
            //really working shit 
            const elements = await page.$$(".ProductCard-Link");
            elements.forEach(async (element) => {
                let text = await (await element.getProperty("innerText")).jsonValue();
                let link = await (await element.getProperty("href")).jsonValue();
                text = text.concat(link, '\n');
                console.log(text);
                //insert values into db 
                con.query('INSERT INTO footwear text where chatid = chatid');

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
        } catch (err) {
            console.log("The element didn't appear.")
            var no_results = 1;
        }

        //bot.telegram.sendMessage(chatid,'shit is done :)');



        // await browser.close();
    };

    const chrome = await puppeteerChrome.launch({
        headless: false,
        slowMo: 50,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        //executablePath: "/usr/bin/chromium-browser",
        //args: ['--no-sandbox' ]
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
var get_File_content = async function () {
    try {
        if (no_results = 1) {
            scrapped_shit = 'no res';
        } else {
            scrapped_shit = fs.readFileSync('message.txt', 'utf8').toString();
            console.log(scrapped_shit);
        }
    } catch (e) {
        console.log('Error:', e.stack);
    }
}

var clear_message = async function () {
    fs.truncate('message.txt', 0, function () {
        console.log('done')
    })
}

//stupid shit
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Telegram bot Parts
var chatId;
bot.start((ctx) => {
    chatId = ctx.chat.id;
    ctx.reply('Welcome! In order to start the journey, type "yolo" to me ');
    con.query('INSERT INTO footwear(chatid) VALUES(' + chatId + ') ON DUPLICATE KEY UPDATE  chatid = ' + "'" + chatId + "'")
});

bot.help((ctx) => ctx.reply('type "yolo" to me!'))
bot.hears('chatid', (ctx) => {
    ctx.reply(chatId)
});

//starting up web scrapper
bot.hears('yolo', (ctx) => {
    ctx.reply('gimme a sec');
    ctx.reply(ctx.chat.id);
    const revolution_johny = async () => {
        ctx.reply('russky runes');
        await Web_Scrapper();
        await timeout(1000);
        await get_File_content();
        await ctx.reply(scrapped_shit);
        await clear_message();
    };
    revolution_johny();
    setInterval(function () {
        revolution_johny()
    }, 900000);
})

//new canserino 2.0
//https://stackoverflow.com/questions/61189728/node-telegraf-callback-button
bot.hears('yo', async (ctx) => {
    ctx.reply("What is your shoe size?", {
        reply_markup: {
            inline_keyboard: [
                /* Inline buttons. 2 side-by-side */
                [{
                    text: "36",
                    callback_data: "36"
                }, {
                    text: "37",
                    callback_data: "37"
                }, {
                    text: "38",
                    callback_data: "38"
                }, {
                    text: "39",
                    callback_data: "39"
                }],

                /* One button */
                [{
                    text: "40",
                    callback_data: "40"
                }, {
                    text: "41",
                    callback_data: "41"
                }, {
                    text: "42",
                    callback_data: "42"
                }, {
                    text: "43",
                    callback_data: "43"
                }],

                /* Also, we can have URL buttons. */
                [{
                    text: "44",
                    callback_data: "44"
                }, {
                    text: "45",
                    callback_data: "45"
                }, {
                    text: "46",
                    callback_data: "46"
                }, {
                    text: "47",
                    callback_data: "47"
                }]
            ]
        }
    });
})

//map shoe size, discusting canser i know, was done in rush, one time will refactor it (or not)
var shoe_size;

bot.action('36', (ctx) => {
    shoe_size = '36';
    size_save(shoe_size, ctx.chat.id);
    ctx.reply('shoe size has been saved(hopefully)! Type "gender" now.');
});
bot.action('37', (ctx) => {
    shoe_size = '37';
    size_save(shoe_size, ctx.chat.id);
    ctx.reply('shoe size has been saved(hopefully)! Type "gender" now.');
});
bot.action('38', (ctx) => {
    shoe_size = '38';
    size_save(shoe_size, ctx.chat.id);
    ctx.reply('shoe size has been saved(hopefully)! Type "gender" now.');
});
bot.action('39', (ctx) => {
    shoe_size = '39';
    size_save(shoe_size, ctx.chat.id);
    ctx.reply('shoe size has been saved(hopefully)! Type "gender" now.');
});
bot.action('40', (ctx) => {
    shoe_size = '40';
    size_save(shoe_size, ctx.chat.id);
    ctx.reply('shoe size has been saved(hopefully)! Type "gender" now.');

});
bot.action('41', (ctx) => {
    shoe_size = '41';
    size_save(shoe_size, ctx.chat.id);
    ctx.reply('shoe size has been saved(hopefully)! Type "gender" now.');
});
bot.action('42', (ctx) => {
    shoe_size = '42';
    size_save(shoe_size, ctx.chat.id);
    ctx.reply('shoe size has been saved(hopefully)! Type "gender" now.');
});
bot.action('43', (ctx) => {
    shoe_size = '43';
    size_save(shoe_size, ctx.chat.id);
    ctx.reply('shoe size has been saved(hopefully)! Type "gender" now.');
});
bot.action('44', (ctx) => {
    shoe_size = '44';
    size_save(shoe_size, ctx.chat.id);
    ctx.reply('shoe size has been saved(hopefully)! Type "gender" now.');
});
bot.action('45', (ctx) => {
    shoe_size = '45';
    size_save(shoe_size, ctx.chat.id);
    ctx.reply('shoe size has been saved(hopefully)! Type "gender" now.');
});
bot.action('46', (ctx) => {
    shoe_size = '46';
    size_save(shoe_size, ctx.chat.id);
    ctx.reply('shoe size has been saved(hopefully)! Type "gender" now.');
});
bot.action('47', (ctx) => {
    shoe_size = '47';
    size_save(shoe_size, ctx.chat.id);
    ctx.reply('shoe size has been saved(hopefully)! Type "gender" now.');
});

function size_save(shoe_size, chatId) {
    con.query('UPDATE footwear SET shoe_size=' + "'" + shoe_size + "'" + ' WHERE chatid = ' + "'" + chatId + "'");
}

bot.hears('gender', async (ctx) => {
    ctx.reply("Pal or Gal?", {
        reply_markup: {
            inline_keyboard: [
                /* Inline buttons. 2 side-by-side */
                [{
                    text: "Pal",
                    callback_data: "M"
                }, {
                    text: "Gal",
                    callback_data: "F"
                }]
            ]
        }
    });
});
//here goes logic related to gender save to DB 
var gender;
bot.action('M', (ctx) => {
    gender = '1';
    ctx.reply('okay! lets finish with discount monitoring setup. type "discount" to finish the setup process. ')

    insert_gender(gender, ctx.chat.id);
});
bot.action('F', (ctx) => {
    gender = '0';
    ctx.reply('okay! lets finish with discount monitoring setup. type "discount" to finish the setup process. ')
    insert_gender(gender, ctx.chat.id);
})


function insert_gender(gender, chatId) {
    console.log(gender + ' ' + chatId);
    con.query('UPDATE footwear SET gender=' + "'" + gender + "'" + ' WHERE chatid = ' + "'" + chatId + "'");
}



bot.hears('discount', ctx => {
    ctx.reply("Chose discount % to monitor, for example 50% would mean 50% and up \n (note - you can always change it down the road, if you find that there are too many items) ", {
        reply_markup: {
            inline_keyboard: [
                /* Inline buttons. 2 side-by-side */
                [{
                    text: "75%",
                    callback_data: "75%"
                }, {
                    text: "70%",
                    callback_data: "70%"
                }],
                [{
                    text: "60%",
                    callback_data: "60%"
                }, {
                    text: "50%",
                    callback_data: "50%"
                }],
                [{
                    text: "40%",
                    callback_data: "40%"
                }, {
                    text: "30%",
                    callback_data: "30%"
                }]
            ]
        }
    });
});
//here goes logic related to saving % to db 
var discount;
bot.action('75%', (ctx) => {
    discount = '75%';
    save_discount(discount, ctx.chat.id);
    ctx.reply("Ollah! you're set and done now!  \n to finish, type 'serve' just to make my crawler serve to you ")
})
bot.action('70%', (ctx) => {
    discount = '70%';
    save_discount(discount, ctx.chat.id);
    ctx.reply("Ollah! you're set and done now!  \n to finish, type 'serve' just to make my crawler serve to you ")

})
bot.action('50%', (ctx) => {
    discount = '50%';
    save_discount(discount, ctx.chat.id);
    ctx.reply("Ollah! you're set and done now!  \n to finish, type 'serve' just to make my crawler serve to you ")
})
bot.action('60%', (ctx) => {
    discount = '60%'
    save_discount(discount, ctx.chat.id);
    ctx.reply("Ollah! you're set and done now!  \n to finish, type 'serve' just to make my crawler serve to you ")
})
bot.action('40%', (ctx) => {
    discount = '40%';
    save_discount(discount, ctx.chat.id);
    ctx.reply("Ollah! you're set and done now!  \n to finish, type 'serve' just to make my crawler serve to you ")
})
bot.action('30%', (ctx) => {
    discount = '30%';
    save_discount(discount, ctx.chat.id);
    ctx.reply("Ollah! you're set and done now!  \n to finish, type 'serve' just to make my crawler serve to you ")
})

function save_discount(discount, chatId) {
    console.log(chatId)
    con.query('UPDATE footwear SET discount_min=' + "'" + discount + "'" + ' WHERE chatid = ' + "'" + chatId + "'");
}



// checks for values in DB
bot.hears('serve', ctx => {
    ctx.reply("let's check had you provided all nessesary data or not");
    con.query("SELECT * FROM footwear WHERE id IS NOT NULL AND chatid=" + ctx.chat.id + " AND shoe_size IS NOT NULL and discount_min IS NOT NULL ", function (err, result) {
        if (err) throw err;
        if (result[0] == undefined) {
            console.log('looks like something is missing...\n  Make sure that youve provided gender, discount, shoe size, price min & price max     ')
            console.log(result[0])
        } else {
            console.log(result);
            ctx.reply("all good!")
            console.log(result[0])
        }

    });

});


// run scrapping periodically for everyone 
function  masterpiece() {
    con.query("SELECT * FROM footwear WHERE id IS NOT NULL AND chatid IS NOT NULL AND shoe_size IS NOT NULL and discount_min IS NOT NULL  and gender IS NOT NULL", 
    function (err, result) {
        if (err) throw err;
        console.log(result.length);
        for(var i = 0; i< result.length ; i++){
            console.log(result[i].gender)
            Web_Scrapper(result[i].shoe_size, result[i].gender, result[i].discount_min,result[i].chatid);
            
        }
        
    })
};

masterpiece();
//bot.telegram.sendMessage()


//end of pain

bot.launch()