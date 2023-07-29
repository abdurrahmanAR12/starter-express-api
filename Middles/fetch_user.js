let { getEnvironmentVariables, getValiadator, verifyPayload, sendRespnonseJson400 } = require("../utils/utils"),
    { validationResult } = getValiadator(),
    { User } = require("../Models/User"),
    { jwt } = getEnvironmentVariables()

async function fetch_user(req, res, next) {
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty())
            return sendRespnonseJson400(res, errors.array()[0].msg);
        let token = req.header("token");
        if (!token)
            return sendRespnonseJson400(res, "Something went wrong");
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
        return sendRespnonseJson400(res, "Something went wrong");
    }
}

module.exports.fetch_user = fetch_user;
