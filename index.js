const axios = require('axios');
const he = require('he');
require('dotenv').config();
const express = require('express');
const app = express();
const { setTimeout } = require('timers/promises');

const postArticle = async () => {
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
        console.log("空だから失敗");
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
    var ads = [
        process.env.AD_HTML001,
        process.env.AD_HTML002,
        process.env.AD_HTML003
    ];

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

                var adUrl = ads[Math.floor(Math.random()* ads.length)];

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
                <!-- admax -->
                <script src=${adUrl}></script>
                <!-- admax -->
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



app.get("/post", (req, res) => {
    try {
        postArticle();
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