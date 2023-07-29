let pixabay = require("pixabay-api");

pixabay.searchImages("nodejs", "pakistan", {
    page: 1,
    per_page: 5,
    orientation: "all",
    response_group: "high_resolution",
    image_type: "all",

}).then(res => {
    console.log(res.hits[0])
}).catch(r => {
    console.log("Error ")
    console.log(r)
})