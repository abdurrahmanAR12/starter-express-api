let { createRouter, getFileUpload, getValiadator, sendRespnonseJson400, getApiKeys, validateResponseGroup, validateOrder, signJwt, getEnvironmentVariables, verifyPayload, sendResponseRawSuccess, sendRespnonseJsonSucess, getCategories, isValidCategory, resolvePath } = require("../utils/utils"),
    { Activity } = require("../Models/Activity"),
    { body, param } = getValiadator(),
    router = createRouter(),
    { FetchUserIfExists } = require("../Middles/fetch_user_if_exists"),
    pixabayApi = require("pixabay-api")


// console.log(Activity.getOne({}))

router.use(getFileUpload());

module.exports.Images = router;

router.post("/search", FetchUserIfExists, [
    body("key", "Key is missing").exists().isString().trim().notEmpty({ ignore_whitespace: false }),
    body("page", "page is missing").exists().isInt(),
    body("category", "category not exists").exists(),
    body("response_group", "This can not be empty").exists().isString().trim().notEmpty(),
    body("order", "This can not be empty").exists().isString().trim().notEmpty(),
], async (req, res) => {
    let userActivity, { key, page } = req.body;
    page = parseInt(page);

    if (isNaN(page))
        return sendRespnonseJson400(res, "`Page` param must starts from 1 and it must be a number");
    if (page === 0)
        return sendRespnonseJson400(res, "`Page` param must starts from 1");
    if ((!validateResponseGroup(req.body.response_group)) || (!validateOrder(req.body.order)) || (!isValidCategory(req.body.category)))
        return sendRespnonseJson400(res, "Something went wrong");
    if (req.user) {
        userActivity = Activity.get({ user: req.user.id })[0];
        if (!userActivity) {
            let newAc = Activity.create({ searchKeys: [key], user: req.user.id, categories: [req.body.category] });
            if (newAc)
                newAc = await newAc.save().then(re => re).catch(e => false);
        }
        else {
            let newAc = Activity.updateById(userActivity.id, { searchKeys: userActivity.searchKeys.concat(key), categories: userActivity.categories.concat(req.body.category) });
            // console.log(newAc)
            if (newAc)
                newAc = await newAc.save().then(re => re).catch(e => false);
            // console.log(newAc)
        }
    }
    let options = { ...req.body, per_page: 4 },
        results = await getResults(key, options);
    console.log(results)
    if (!results)
        return sendRespnonseJson400(res, results);
    return sendRespnonseJsonSucess(res, results);
});

router.get("/get/:id", param("id", "id must be valid").isJWT(), async (req, res) => {
    let url = (verifyPayload(req.params.id, getEnvironmentVariables().jwt)).toString();
    let image = await getImage(url);
        // u = new URL(url);
        // src = `./temporary/${u.pathname.split("/")[2]}.png`,
        // fs = require("fs");
    // fs.writeFileSync(resolvePath(src), image);
    return res.contentType("image/png").send(image);
        // resolvePath(src), e => {
        // fs.unlinkSync(src);
});

router.get("/categories", (req, res) => {
    return sendRespnonseJsonSucess(res, getCategories(true));
});

router.get("/category/:category&:page", param("page", "Page must starts from 1 and it must be a number").isInt(), FetchUserIfExists, async (req, res) => {
    if (!isValidCategory(req.params.category) || req.params.page === 0)
        return sendRespnonseJson400(res, "Something went wrong");
    let key = req.params.category;
    // console.log(req.headers)
    if (req.user) {
        // console.log("at ac get")
        let ac = Activity.get({ user: req.user.id })[0];
        if (!ac) {
            ac = Activity.create({ searchKeys: [], user: req.user.id, categories: [req.params.category] })
            if (ac) await ac.save();
        }
        else (ac.searchKeys.length !== 0)
        key = ac.searchKeys[parseInt(Math.random() * ac.searchKeys.length)];
        // results = images;
    }
    // console.log("at options ")
    let options = {
        category: req.params.category.toLowerCase(),
        per_page: 4,
        order: "latest",
        page: req.params.page,
        response_group: "image_details"
    }, results = await getResults(key, options);
    // console.log(results)
    if (!results)
        return sendRespnonseJson400(res, results);
    return sendRespnonseJsonSucess(res, results);
});

async function getImage(url) {
    // if (!URL.canParse(url))
    //     return false;
    let axios = require("axios"), data = await axios.default.get(url, { responseType: "arraybuffer" }).then(res => {
        let processedImg = require("sharp")(res.data)
        // console.log(processedImg)
        return processedImg.toBuffer();
    }).catch(_e => {
        console.log(_e);
        return false;
    });
    return data;
}

async function getResults(key, options) {
    let apiKeys = getApiKeys(),
        apiKey = apiKeys[parseInt(Math.random() * apiKeys.length)],
        api = pixabayApi.authenticate(apiKey),
        images = { hits: [] };
    try {

        await api.searchImages(key, options).then(imgs => {
            images = { ...images, totalHits: imgs.totalHits, total: imgs.total };
            // console.log(imgs)
            for (let i = 0; i < imgs.hits.length; i++) {
                let img = imgs.hits[i];
                images.hits.push(new Object({
                    webformatURL: signJwt(Buffer.from(img.webformatURL), getEnvironmentVariables().jwt),
                    ...img,
                    largeImageURL: signJwt(Buffer.from(img.largeImageURL), getEnvironmentVariables().jwt),
                    // fullHDURL: signJwt(Buffer.from(img.fullHDURL), getEnvironmentVariables().jwt),
                    userImageURL: signJwt(Buffer.from(img.userImageURL), getEnvironmentVariables().jwt)
                }))
            }
        }).catch(_e => {
            images = false;
            console.log("Error while getting results");
            return false;
        });
        return images;
    } catch (error) {
        images = false;
        return images;
    }
}