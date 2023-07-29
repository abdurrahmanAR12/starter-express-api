let Model = require("../Db/Model"),
    path = require("path");

module.exports.Activity = Model(path.join(path.resolve("./"), "Data"), "Activity");