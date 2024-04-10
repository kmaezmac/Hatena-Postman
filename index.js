const axios = require('axios');
const he = require('he');
require('dotenv').config();

const url = proces.env.HATENA_URL;
var today = new Date();
var year = today.getFullYear();
var month = ("0" + String(today.getMonth() + 1)).slice(-2);
var day = ("0" + String(today.getDate())).slice(-2);
var hour = ('0' + String(today.getHours())).slice(-2);
var minutes = ('0' + String(today.getMinutes())).slice(-2);

var title = "Amazonタイムセール " + year + "/" + month + "/" + day + " " + hour + ":" + minutes + "更新";
var productUrl = "";
var productTitle = "";
var productImage = "";
var productMaker = "";
var productPrice = "";
var productDiscount = "";

var contents = `
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
`;
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