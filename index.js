const axios = require('axios');
const he = require('he');
require('dotenv').config();
const express = require('express');
const app = express();
const https = require('https');

function postArticle() {
    const url = process.env.HATENA_URL;
    var today = new Date();
    var year = today.getFullYear();
    var month = ("0" + String(today.getMonth() + 1)).slice(-2);
    var day = ("0" + String(today.getDate())).slice(-2);
    var hour = ('0' + String(today.getHours())).slice(-2);
    var minutes = ('0' + String(today.getMinutes())).slice(-2);

    var title = "Amazonタイムセール " + year + "/" + month + "/" + day + " " + hour + ":" + minutes + "更新";

    var contents = getFromAmazon();

    const escaped = he.escape(contents);
    const xmlData = `<?xml version="1.0" encoding="utf-8"?>
    <entry xmlns="http://www.w3.org/2005/Atom">
      <title>${title}</title>
      <content>${escaped}</content>
      <updated>${today.toISOString()}</updated>
    </entry>`;

    axios.post(url, xmlData, {
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

function getFromAmazon() {
    var contentsText = "";
    https.get(process.env.AMAZON_API_URL, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            var body = JSON.parse(data)
            console.log(body);
            console.log(body.length);
            if (body.length == 0) {
                getFromAmazon();
            }
            for (var i = 0; i < body.length; i++) {
                var productUrl = body[i].url;
                var productTitle = body[i].title;
                var productImage = body[i].image;
                var productMaker = body[i].maker;
                var productPrice = body[i].price;
                var productDiscount = body[i].discount;

                console.log(productUrl);
                console.log(productTitle);
                console.log(productImage);
                console.log(productMaker);
                console.log(productPrice);
                console.log(productDiscount);

                contentsText += `
                <div class="hatena-asin-detail"><a href="${productUrl}" class="hatena-asin-detail-image-link" target="_blank" rel="noopener"><img src="${productImage}" class="hatena-asin-detail-image" alt="${productTitle}" title="${productTitle}" /></a>
                <div class="hatena-asin-detail-info">
                <p class="hatena-asin-detail-title"><a href="${productUrl}" target="_blank" rel="noopener">${productTitle}</a></p>
                <ul class="hatena-asin-detail-meta">
                <li>${productMaker}</li>
                </ul>
                <a href="${productUrl}" class="asin-detail-buy" target="_blank" rel="noopener">Amazon</a></div>
                </div>
                <div><span style="color: #565959;">価格: </span><span style="color: #b12704;">${productPrice}</span></div>
                <div><span style="color: #565959;">OFF:</span><span style="color: #b12704;">${productDiscount}</span></div>
                <p> </p><p> </p>`;
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    })
    if (contentsText == "") {
        getFromAmazon();
    }
    return contentsText;
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