let Model = require("../Db/Model"),
    path = require("path");

module.exports.User =  Model(path.join(path.resolve("./"), "Data"), "Users");