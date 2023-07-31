let { createRouter, getValiadator, getFileUpload, sendRespnonseJsonSucess, decodeUtf8, encodeUtf8, createHashSalted, comparePassword, sendRespnonseJson400, signJwt, getEnvironmentVariables, generateUser, isGender, isValidAge } = require("../utils/utils"),
    { fetch_user } = require("../Middles/fetch_user"),
    { User } = require("../Models/User"),
    router = createRouter({ caseSensitive: true }),
    { body, validationResult, header } = getValiadator();

module.exports.Users = router;

router.use(getFileUpload());

router.post("/new", [
    body("Name", "Please provide the username").isString().trim().notEmpty({ ignore_whitespace: false }),
    body("Email", "Please provide your Email Address").isString().trim().isEmail(),
    body("Password", "Please provide a strong and remeberable password including atleast one special symbol").isStrongPassword(),
    body("CPassword", "Please provide the confirmation of your Password").isStrongPassword(),
    body("Gender", "Please select your Gender").isString().trim().notEmpty(),
    body("Age", "Please provide your Age").isInt()
], async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty())
        return sendRespnonseJson400(res, errors.array()[0].msg);
    if (req.body.Password !== req.body.CPassword) return sendRespnonseJson400(res, "Passwords must match");

    if (!isGender(req.body.Gender)) return sendRespnonseJson400(res, "Please select your Gender");

    if (!isValidAge(req.body.Age)) return sendRespnonseJson400(res, "Please provide your Age, it is must be valid");

    let al = User.get({ Email: encodeUtf8(req.body.Email) })[0];
    if (al) return sendRespnonseJson400(res, "Sorry, the user has taken");

    let objCreate = { Name: encodeUtf8(req.body.Name), Gender: req.body.Gender, Age: req.body.age, Email: encodeUtf8(req.body.Email), Password: createHashSalted(req.body.Password) };
    let newUser = await (User.create(objCreate)).save().then(res => res).catch(rej_ => false);
    if (newUser) {
        let secret = getEnvironmentVariables().jwt,
            token = signJwt({ user: { id: newUser.id, Password: newUser.Password } }, secret);
        return sendRespnonseJsonSucess(res, { msg: "Success, Account created", token });
    }
    return sendRespnonseJson400(res, "Account creation failed, Please try again later");
});

router.post("/login", [
    body("Email", "Please provide your Email Address").isString().trim().isEmail(),
    body("Password", "Please provide a strong and remeberable password including atleast one special symbol").exists().isString().trim().notEmpty()
], async (req, res) => {
    // console.log(req.body)
    let errors = validationResult(req);
    if (!errors.isEmpty())
        return sendRespnonseJson400(res, errors.array()[0].msg);
    let al = User.get({ Email: encodeUtf8(req.body.Email) })[0];
    if (!al)
        return sendRespnonseJson400(res, "Sorry, Email or password is not valid");
    let comparison = comparePassword(req.body.Password, al.Password);
    if (!comparison)
        return sendRespnonseJson400(res, "Sorry, Email or password is not valid");
    let secret = getEnvironmentVariables().jwt,
        token = signJwt({ user: { id: al.id, Password: al.Password } }, secret);
    return sendRespnonseJsonSucess(res, { token, msg: "Logged in successfully" });
});

router.put("/update", header("token", "token this is must be valid").isJWT(), fetch_user, [
    body("Name", "Please provide the username").isString().trim().notEmpty({ ignore_whitespace: false }),
    body("Email", "Please provide your Email Address").isString().trim().isEmail(),
    body("Password", "Please provide a strong and remeberable password including atleast one special symbol").exists().isString().trim().notEmpty({ ignore_whitespace: false })
], async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty())
        return sendRespnonseJson400(res, errors.array()[0].msg);
    let u = User.getById(req.user.id),
        comparable = comparePassword(req.body.Password, u.Password);
    if (!comparable)
        return sendRespnonseJson400(res, "Sorry, The provided password is invalid, please try again");
    let update = { Name: encodeUtf8(req.body.Name), Email: encodeUtf8(req.body.Email) },
        d = (User.updateById(u.id, update));
    if (d)
        d = await d.save().then(res => res).catch(_er => false);
    else return sendRespnonseJsonSucess(res, "Failed to update the information");
    if (d)
        return sendRespnonseJsonSucess(res, "Successfully updated the Profile Information");
    return sendRespnonseJsonSucess(res, "Failed to update the information");
});

router.get("/getGenders", (req, res) => res.json(["Male", "Female", "Custom"]))

router.get("/get", header("token", "token this is must be valid").isJWT(), fetch_user, async (req, res) => {
    let user = User.getById(req.user.id);
    return sendRespnonseJsonSucess(res, generateUser(user));
});

