const moduleData = require("../module/model")
const jwt = require("jsonwebtoken")


const Auth = async (req, res, next) => {
    try {
        const Token = req.cookies.logincookies;
        const validation = jwt.verify(Token, process.env.SecretKey);

        const data = await moduleData.findOne({ _id: validation._id })
        // console.log(data);
        req.user = data
        req.token = Token
        next()
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
}

module.exports = Auth;