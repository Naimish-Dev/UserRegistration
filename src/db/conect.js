const mongoose = require("mongoose")

const Url = process.env.database
mongoose.set('strictQuery', true)
mongoose.connect(Url).then(() => {
    console.log("db Connect Succes-Fully")
}).catch((e) => {
    console.log(e)
});
