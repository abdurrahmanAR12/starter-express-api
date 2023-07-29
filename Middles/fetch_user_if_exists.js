let { getEnvironmentVariables, verifyPayload, sendRespnonseJson400 } = require("../utils/utils"),
    { User } = require("../Models/User"),
    { jwt } = getEnvironmentVariables()

async function fetch_user(req, res, next) {
    try {
        // console.log(req.headers)
        let token = req.header("token");
        // console.log(token)
        if (!token)
            return next();
        // return sendRespnonseJson400(res, "Something went wrong");
        let valid_token = verifyPayload(token, jwt);
        if (!valid_token)
            return sendRespnonseJson400(res, "Something went wrong");
        const { id, Password } = valid_token.user;
        if (!(id))
            return sendRespnonseJson400(res, "Something went wrong");
        let valid_user = User.getById(id);
        if (!valid_user)
            return sendRespnonseJson400(res, "Something went wrong");
        if (valid_user.Password !== Password)
            return sendRespnonseJson400(res, "Something went wrong");
        if (!valid_user)
            return sendRespnonseJson400(res, "Something went wrong");
        req.user = { id };
        next();
    } catch (error) {
        return next()
    }
}

module.exports.FetchUserIfExists = fetch_user;
