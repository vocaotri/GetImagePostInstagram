
require("tools-for-instagram");
fs = require('fs');
(async () => {
    let username = "thaophuong4925";
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
})();
    