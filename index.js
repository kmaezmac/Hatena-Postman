const axios = require('axios');
const he = require('he');
require('dotenv').config();
const express = require('express');
const app = express();
const { setTimeout } = require('timers/promises');

const ads = [
    process.env.AD_HTML001,
    process.env.AD_HTML002,
    process.env.AD_HTML003,
    process.env.AD_HTML004,
    process.env.AD_HTML005,
    process.env.AD_HTML006,
    process.env.AD_HTML007,
    process.env.AD_HTML008,
    process.env.AD_HTML009,
    process.env.AD_HTML010,
    process.env.AD_HTML011,
    process.env.AD_HTML012,
    process.env.AD_HTML013,
    process.env.AD_HTML014,
    process.env.AD_HTML015,
    process.env.AD_HTML016,
    process.env.AD_HTML017,
    process.env.AD_HTML018,
    process.env.AD_HTML019,
    process.env.AD_HTML020,
    process.env.AD_HTML021,
    process.env.AD_HTML022,
    process.env.AD_HTML023,
    process.env.AD_HTML024,
    process.env.AD_HTML025,
    process.env.AD_HTML026,
];

const postArticleForAmazon = async () => {
    const url = process.env.HATENA_URL;
    var today = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    var year = today.getFullYear();
    var month = ("0" + String(today.getMonth() + 1)).slice(-2);
    var day = ("0" + String(today.getDate())).slice(-2);
    var hour = ('0' + String(today.getHours())).slice(-2);
    var minutes = ('0' + String(today.getMinutes())).slice(-2);

    var title = "Amazonタイムセール " + year + "/" + month + "/" + day + " " + hour + ":" + minutes + "更新";

    console.log(title);

    var contents = await getFromAmazon();
    console.log("こんてんと:" +contents);

    const escaped = he.escape(contents);
    if(!escaped){
        console.log("空だから失敗してリターン");
        return;
    }
    const xmlData = `<?xml version="1.0" encoding="utf-8"?>
    <entry xmlns="http://www.w3.org/2005/Atom">
      <title>${title}</title>
      <content>${escaped}</content>
      <updated>${today.toDateString()}</updated>
      <category term="Amazon" />
      <category term="セール" />
    </entry>`;

    await axios.post(url, xmlData, {
        headers: {
            'Content-Type': 'application/xml',
        },
        auth: {
            username: process.env.HATENA_USERNAME,
            password: process.env.HATENA_PASSWORD,
        },
    }).then((response) => {
        if (response.status !== 201) {
            console.log(response);
        }
    }).catch((error) => {
        console.log(error)
    });
}

const getFromAmazon = async () => {
    var contents = "";
    try {
        const response = await axios.get(process.env.AMAZON_API_URL);
        var body = response.data;
        if (body.length != 0) {
            for (var i = 0; i < body.length; i++) {
                var productUrl = body[i].url;
                var productTitle = body[i].title;
                var productImage = body[i].image;
                var productPrice = body[i].price;
                var productDiscount = body[i].discount;
                var adScript = ads[Math.floor(Math.random()* ads.length)];

                console.log(productUrl);
                console.log(productTitle);
                console.log(productImage);
                console.log(productPrice);
                console.log(productDiscount);

                contents += `
                <div class="hatena-asin-detail"><a href="${productUrl}" class="hatena-asin-detail-image-link" target="_blank" rel="noopener"><img src="${productImage}" class="hatena-asin-detail-image" alt="${productTitle}" title="${productTitle}" /></a>
                <div class="hatena-asin-detail-info">
                <p class="hatena-asin-detail-title"><a href="${productUrl}" target="_blank" rel="noopener">${productTitle}</a></p>
                <ul class="hatena-asin-detail-meta">
                </ul>
                <a href="${productUrl}" class="asin-detail-buy" target="_blank" rel="noopener">Amazon</a></div>
                </div>
                <div><span style="color: #565959;">価格: </span><span style="color: #b12704;">${productPrice}</span></div>
                <div><span style="color: #565959;">OFF:</span><span style="color: #b12704;">${productDiscount}</span></div>
                <p> </p>
                ${adScript}
                <p> </p>
                `;
            }
        }
    } catch (error) {
        console.log(error.response.body);
    }
    await setTimeout(10000);
    if (!contents) {
        await getFromAmazon();
    }
    return contents;
}



app.get("/amazon", (req, res) => {
    try {
        postArticleForAmazon();
    } catch (err) {
        console.log(err);
    }
    res.send('get');
});

const postArticleForRakuten = async () => {
    const url = process.env.HATENA_URL;
    var today = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    var year = today.getFullYear();
    var month = ("0" + String(today.getMonth() + 1)).slice(-2);
    var day = ("0" + String(today.getDate())).slice(-2);
    var hour = ('0' + String(today.getHours())).slice(-2);
    var minutes = ('0' + String(today.getMinutes())).slice(-2);

    var title = "楽天ランキング " + year + "/" + month + "/" + day + " " + hour + ":" + minutes + "更新";

    console.log(title);

    var contents = await getFromRakuten();
    console.log("こんてんと:" +contents);

    const escaped = he.escape(contents);
    if(!escaped){
        console.log("空だから失敗してリターン");
        return;
    }
    const xmlData = `<?xml version="1.0" encoding="utf-8"?>
    <entry xmlns="http://www.w3.org/2005/Atom">
      <title>${title}</title>
      <content>${escaped}</content>
      <updated>${today.toDateString()}</updated>
      <category term="楽天" />
      <category term="楽天市場" />
    </entry>`;

    await axios.post(url, xmlData, {
        headers: {
            'Content-Type': 'application/xml',
        },
        auth: {
            username: process.env.HATENA_USERNAME,
            password: process.env.HATENA_PASSWORD,
        },
    }).then((response) => {
        if (response.status !== 201) {
            console.log(response);
        }
    }).catch((error) => {
        console.log(error)
    });
}

const getFromRakuten = async () => {
    var contents = "";
   
    var random = Math.floor(Math.random() * 34) + 1;
    var rakutenRankingUrl = "https://app.rakuten.co.jp/services/api/IchibaItem/Ranking/20220601?applicationId="
        + process.env.RAKUTEN_APP_ID + "&sex=1&carrier=0&page=" + random + "&affiliateId=" + process.env.RAKUTEN_AFFILIATE_ID;

    try {
        const response = await axios.get(rakutenRankingUrl);
        if (response.data.Items.length != 0) {
            for (var i = 0; i < response.data.Items.length; i++) {
                var catchcopy = response.data.Items[i].Item.catchcopy;
                var imageUrls = response.data.Items[i].Item.mediumImageUrls;
                var affiliateUrl = response.data.Items[i].Item.affiliateUrl;
                var itemName = response.data.Items[i].Item.itemName;
                var itemPrice = response.data.Items[i].Item.itemPrice;
                console.log(catchcopy);
                console.log(affiliateUrl);
                console.log(itemName);
                console.log(itemPrice);
                var imageUrl = imageUrls[i].imageUrl.substring(0, imageUrls[i].imageUrl.indexOf("?"));

                var adScript = ads[Math.floor(Math.random()* ads.length)];
                
                contents += `<div class="hatena-asin-detail"><a href="${affiliateUrl}" class="hatena-asin-detail-image-link" target="_blank" rel="noopener"><img src="${imageUrl}" class="hatena-asin-detail-image" alt="${itemName}" title="${itemName}" /></a>
                <div class="hatena-asin-detail-info">
                <p class="hatena-asin-detail-title"><a href="${affiliateUrl}" target="_blank" rel="noopener">${itemName}</a></p>
                <ul class="hatena-asin-detail-meta">
                </ul>
                <a href="${affiliateUrl}" class="asin-detail-buy" target="_blank" rel="noopener">楽天</a></div>
                </div>
                <div><span style="color: #565959;">価格: </span><span style="color: #b12704;">${itemPrice}</span></div>
                <p> </p>
                ${adScript}
                <p> </p>
                `;                
            }
        }
    } catch (error) {
        console.log(error.response);
    }
    await setTimeout(10000);
    if (!contents) {
        await getFromRakuten();
    }
    return contents;
}

app.get("/rakuten", (req, res) => {
    try {
        postArticleForRakuten();
    } catch (err) {
        console.log(err);
    }
    res.send('get');
});



app.get("/", (req, res) => {
    try {
        console.log("ログ定期実行")
    } catch (err) {
        console.log(err);
    }
    res.send('get');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);