let Model = require("../Db/Model"),
    path = require("path");

module.exports.Image =  Model(path.join(path.resolve("./"), "Data"), "Images");