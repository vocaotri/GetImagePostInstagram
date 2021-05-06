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

app.get('/get-image/:userName?', async (req, res) => {
    let username = req.params.userName ? req.params.userName : "pocchi.live";
    fs.writeFileSync(`getPost.${username}.js`, `require("tools-for-instagram");
fs = require('fs');
(async () => {
    let username = "${username}";
    let ig = await login();
    let posts = await getUserRecentPosts(ig, username);
    let images = [];
    let imageChid = [];
    posts.forEach(element => {
        if (element.carousel_media_count > 1) {
            imageChid = [];
            element.carousel_media.forEach(el => {
                imageChid.push(el.image_versions2)
            })
            images.push(imageChid)
        }
        else
            images.push(element.image_versions2)
    })

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
