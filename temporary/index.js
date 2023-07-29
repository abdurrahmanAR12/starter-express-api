const { createApp, getCors, getEnvironmentVariables } = require("./utils/utils");
const { Users } = require("./Routes/Users");
const { Images } = require("./Routes/Images");

// let b = require("buffer")

// let { User } = require("./Models/User");
// let { SearchHistory } = require("./Models/SearchHistory");
// let alreadyExits = User.getOne({ Name: "Abdur Rahman" });
// app.use("/", async (req, res) => {
//     res.json({ b: req.body, })
// });

// app.post("/", async (req, res) => {
//     // console.log("object")
//     res.json({ b: req.body })
// });

let app = createApp();

app.use(getCors({ origin: getEnvironmentVariables().origin }))

app.use("/users", Users);

app.use("/images", Images);


// console.log(data.toDataURL("image/png", 100))

app.get("/", async (req, res) => {
    let canvas = require("canvas"),
        fs = require("fs");
    let buff = fs.readFileSync("img.png")
    let img = new canvas.Image();
    img.src = buff;
    let data = new canvas.Canvas(1000, 1000, "image");
    data.getContext("2d").drawImage(img, 0, 0, 500, 1000);
    console.log(data.toDataURL("image/png"))
    return res.send(data.toDataURL("image/png"));
})

app.listen(5000, () => listenCallback(5000));

function listenCallback(port, fn) {
    console.log(`Listening on port`, port);
    if (fn) fn();
}


