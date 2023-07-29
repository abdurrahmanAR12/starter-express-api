let express = require("express"),
    utf8 = require("utf8"),
    fileUpload = require("express-fileupload"),
    bcryptjs = require('bcryptjs'),
    jwt = require("jsonwebtoken"),
    { readFileSync, readdirSync } = require("fs");
const path = require("path");

/**
 * 
 * @param {Array<any>} arr 
 * @param {number} from 
 * @param {number} to 
 * @returns {Array<any>}
 */
function slice(arr, from = 0, to = 3) {
    return { arr: arr.slice(from ? from : 0, to ? to : 3), i: to ? (to + 3) : 3 };
};
/**
 * 
 * @param {import("express").RouterOptions} options 
 * @returns {express.Router}
 */
function createRouter(options) {
    return express.Router(options);
}

function createApp() {
    return express();
}
/**
 * 
 * @param {string} str 
 * @returns {string}
 */
function decodeUtf8(str) {
    // console.log("decding")
    return utf8.decode(str);
}

/**
 * 
 * @param {string} str 
 * @returns {string}
 */
function encodeUtf8(str) {
    // console.log("encoding")
    return utf8.encode(str);
}


function getFileUpload() {
    return fileUpload();
}

function getValiadator() {
    let v = require("express-validator")
    return (v);
}

/**
 * 
 * @param {import("express").Response} res 
 * @param {object} options 
 * @returns 
 */
function sendRespnonseJsonSucess(res, options) {
    return res.status(200).json(options);
}
/**
 * 
 * @param {string} str 
 */
function createHashSalted(str) {
    let s = bcryptjs.genSaltSync(10);
    // console.log('salted')
    let hash = bcryptjs.hashSync(str, s);
    // console.log('hashed')
    return hash;
}

/**
 * Syncronous function
 * Returns ```true``` if the password and hash are comparable eachother, otherwise ```false```
 * @param {string} passsword The original Password 
 * @param {string} hash Hashed version of password
 * @returns {boolean}
 */
function comparePassword(passsword, hash) {
    let comparison = bcryptjs.compareSync(passsword, hash);
    return comparison;
}

/**
 * 
 * @param {import("express").Response} res 
 * @param {object} options 
 * @returns 
 */
function sendRespnonseJson404(res, options) {
    return res.status(404).json(options);
}

/**
 * 
 * @param {import("express").Response} res 
 * @param {object} options 
 * @returns 
 */
function sendRespnonseJson400(res, options) {
    return res.status(400).json(options);
}
/**
 * 
 * @param {import("express").Response} res 
 * @param {Buffer<any>|string|Array<any>} data 
 * @returns 
 */
function sendResponseRawSuccess(res, data) {
    return res.status(200).send(data);
}

/**
 * 
 * @param {string|Buffer|object} payload 
 * @param {string} secretKey 
 */
function signJwt(payload, secretKey) {
    let t = jwt.sign(payload, secretKey);
    return t;
}
/**
 * 
 * @param {string} token 
 * @param {string} secretKey 
 */
function verifyPayload(token, secretKey) {
    let t = jwt.verify(token, secretKey);
    return t;
}

function getEnvironmentVariables() {
    let dotEnv = require("dotenv"),
        env = dotEnv.parse(readFileSync("./.env").toString());;
    return env;
}

function generateUser(user) {
    return new Object({ Name: decodeUtf8(user.Name), Email: decodeUtf8(user.Email) });
}
/**
 * 
 * @param {string} gender 
 */
function isGender(gender) {
    if (typeof gender !== "string")
        return false;
    let arr = ["Male", "Female", "Custom"];
    for (let i = 0; i < arr.length; i++) {
        let e = arr[i];
        if (gender === e)
            return true;
    }
    return false;
}

/**
 * 
 * @param {number} age 
 */
function isValidAge(age) {
    let a = parseInt(age);
    if (isNaN(a)) return false;
    if (a < 0) return false;
    if (a >= 100) return false;
    return true;
}

/**
 * 
 * @returns {Array<string>}
 */
function getApiKeys() {
    return JSON.parse(getEnvironmentVariables().apiKeys)
}

/**
 * 
 * @param {string} string 
 */
function validateResponseGroup(string) {
    let r = ["high_resolution", "image_details"];
    for (let i = 0; i < r.length; i++) {
        if (r[i] == string)
            return true;
    }
    return false;
}
/**
 * 
 * @param {string} or The order to validate, This can be `popluar` or `latest`
 * @returns {boolean}
 */
function validateOrder(or) {
    let a = ["latest", "popular"];
    for (let i = 0; i < a.length; i++)
        if (a[i] === or)
            return true;
    return false;
}

/**
 * @param {boolean} firstCapital
 * @returns {Array<string>} Returns all available categories accepted by pixabay
 */
function getCategories(firstCapital) {
    let arr = ["fashion", "nature", "backgrounds", "science", "education", "people", "feelings", "religion", "health", "places", "animals", "industry", "food", "computer", "sports", " transportation", " travel", "buildings", "business", "music"]
    if (firstCapital) {
        for (let i = 0; i < arr.length; i++) {
            let e = arr[i];
            e = e.trim();
            arr[i] = `${e[0].toUpperCase()}${e.slice(1)}`;
        }
        return arr;
    }
    return arr;
}

/**
 * 
 * @param {import("cors").CorsOptions} options 
 * @returns 
 */
function getCors(options) {
    let c = require("cors");
    return c(options);
}

/**
 *  Returns `true` if the given category is valid and accepted by the pixabay
 * @param {string} category 
 */
function isValidCategory(category) {
    let cs = getCategories();
    for (let i = 0; i < cs.length; i++) {
        let e = cs[i].toLowerCase();
        if (e === category.toLowerCase())
            return true;
    }
    return false;
}

function resolvePath(path) {
    let p = require("path")
    return p.resolve(path);
}

function getAdScripts() {
    // console.log(__dirname)
    // console.log(path.resolve("AdScripts"))
    return readdirSync(path.resolve("AdScripts"));
}

function sendAdScript(res, scriptName) {
    let scripts = getAdScripts();
    for (let i = 0; i < scripts.length; i++) {
        if (scriptName === scripts[i])
            return res.sendFile(path.join(path.resolve("AdScripts"), scriptName));
    }
    return false;
}

module.exports = {
    sendAdScript,
    getAdScripts,
    resolvePath,
    isValidCategory,
    getCors,
    sendResponseRawSuccess,
    validateOrder,
    getCategories,
    validateResponseGroup,
    getApiKeys,
    slice,
    isValidAge,
    isGender,
    createApp,
    sendRespnonseJson404,
    verifyPayload,
    getEnvironmentVariables,
    signJwt,
    comparePassword,
    sendRespnonseJson400,
    createHashSalted,
    sendRespnonseJsonSucess,
    createRouter,
    getValiadator,
    getFileUpload,
    decodeUtf8,
    encodeUtf8,
    generateUser
}