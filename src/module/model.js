require('dotenv').config()
const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const RegisterDataSchema = new mongoose.Schema({


    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    phonenumber: {
        type: Number,
        unique: true,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    comformpassword: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        require: true
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }]
})

RegisterDataSchema.methods.generateAuthToken = async function () {
    try {
        // console.log(this._id)
        const Token = jwt.sign({ _id: this._id }, process.env.SecretKey);
        this.tokens = this.tokens.concat({ token: Token });
        await this.save()
        return Token;
    } catch (e) {
        console.log(e)
    }
}


RegisterDataSchema.pre("save", async function (next) {
    if (this.isModified("password")) {

        this.password = await bcrypt.hash(this.password, 10)
        next();
        this.comformpassword = undefined;
    }
})


const moduleData = new mongoose.model("RegisterData", RegisterDataSchema);


module.exports = moduleData;