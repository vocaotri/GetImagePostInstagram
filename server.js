require('dotenv').config();
const express = require("express");
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const NodeCache = require("node-cache");
const cacheInfo = new NodeCache();
const { exec } = require('child_process');
fs = require('fs');
var port = process.env.PORT || 3000;

app.use(function (req, res, next) {
    const allowedOrigins = [
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8080",
        "http://localhost:9000",
        "https://pocchi.live"
    ];
    const origin = req.headers.origin;
    // Website you wish to allow to connect
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    // Request methods you wish to allow
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );

    // Request headers you wish to allow
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept,x-socket-id,x-csrf-token"
    );

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);

    // Pass to next layer of middleware
    next();
});

app.get('/get-image/:userName?', async (req, res) => {
    let username = req.params.userName ? req.params.userName : "pocchi.live";
    fs.writeFileSync(`getPost.${username}.js`, `var base64 = require('node-base64-image');
require("tools-for-instagram");
fs = require('fs');
(async () => {
    let username = "${username}";
    let ig = await login();
    let posts = await getUserRecentPosts(ig, username);
    let images = [];
    let imageChid = [];
    const options = { string: true };
    for (let post of posts) {
        if (post.carousel_media_count > 1) {
            imageChid = [];
            for (let el of post.carousel_media) {
                urlImage = el.image_versions2.candidates[1] ? el.image_versions2.candidates[1].url : el.image_versions2.candidates[0].url;
                var contentImage = await base64.encode(urlImage, options);
                imageChid.push(contentImage)
            }
            images.push(imageChid)
        }
        if (post.image_versions2) {
            urlImage = post.image_versions2.candidates[1] ? post.image_versions2.candidates[1].url : post.image_versions2.candidates[0].url;
            var contentImage = await base64.encode(urlImage, options);
            images.push([contentImage])
        }
    }

    fs.writeFile(username + '.image.json', JSON.stringify(images), function (err) {
        if (err) return console.log(err);
        console.log('save image success');
        process.exit(1)
    });
})();`);
    let loadCache = cacheInfo.get(username);
    if (loadCache) {
        const data = fs.readFileSync(`${username}.image.json`, 'utf8');
        return res.json(JSON.parse(data));
    }
    exec(`node getPost.${username}.js`, (error, stdout, stderr) => {
        const data = fs.readFileSync(`${username}.image.json`, 'utf8');
        cacheInfo.set(username, "true", 10000);
        return res.json(JSON.parse(data));
    });

})
app.listen(port, () => console.log("server started : " + port));
