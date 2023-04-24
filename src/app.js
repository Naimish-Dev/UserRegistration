// when you used env the top most require 
require('dotenv').config()
const express = require('express');
const Auth = require("./middleware/Auth")
const app = express();
const port = process.env.PORT || 9000;
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcrypt")



// setup of get cookies 
const cookies = require("cookie-parser")
app.use(cookies())

// Data base connect 
require("./db/conect")
// module (schema ) require 
const moduleData = require("./module/model")

// set hendel bar medalwar 
app.set("view engine", "hbs")

// set dynamic path of public(CSS) folder  
const static_path = path.join(__dirname, "../public")
app.use(express.static(static_path));

// set Views direct path
const new_views_path = path.join(__dirname, "./templates/views")
app.set("views", new_views_path);

//set partias file path
const new_partials_path = path.join(__dirname, "./templates/partials")
hbs.registerPartials(new_partials_path);


// use jason data in frountend to backend 
app.use(express.json());
// use dependency when data pass away from websit and fetch in backend 
app.use(express.urlencoded({ extended: false })) 

// checking env is runing 
// console.log(process.env.database)


// routing
app.get('/', (req, res) => {
    res.render('index')
})


// Authore is midlewar not packeg
app.get('/secreat', Auth, (req, res) => {
    res.render('secreat')
    // console.log(req.cookies.logincookies);

})


app.get("/logout", Auth, async (req, res) => {
    try {
        //1.1 remove only one device (delete only one token which is store in your cookies) from DB 
        req.user.tokens = req.user.tokens.filter((val) => val.token !== req.token)
        //1.2 remove all device (delete all token)
        //    req.user.tokens=[]

        //2 reove from cookies
        res.clearCookie("logincookies");

        // save data on DB after changeing token value 
        await req.user.save()
        res.render("login")
    } catch (e) {
        res.status(500).send(e)
    }
})
app.get('/LogIn', (req, res) => {
    res.render('login')
});

app.post('/LogIn', async (req, res) => {
    try {
        const pass = req.body.password;
        const cpass = req.body.conformpassword;
        // simplay how to  hasing password
        // const PasswordHash=await bcrypt.hash(pass,5);
        // console.log(PasswordHash);

        if (pass === cpass) {
            const NewData = new moduleData({
                username: req.body.username,
                email: req.body.email,
                phonenumber: req.body.phonenumber,
                password: req.body.password,
                comformpassword: req.body.conformpassword,
                gender: req.body.radiobtn,
            })
            // Token generate sem function is definr in-side of module 
            const Token = await NewData.generateAuthToken();
            // set ciikies 
            // 1 cookies destroyed after given time 
            // 2 clink side (js) does not destroed cookie manually
            res.cookie("logincookies", Token, {
                expires: new Date(Date.now() + 60000),
                httpOnly: true
            })

            const setdara = await NewData.save()

            res.status(201).render("index")
        } else {
            res.send("password is not same")
        }
    } catch (e) {
        console.log(e)
        res.status(400)
    }
});

app.get('/signUp', (req, res) => {
    res.render('signup')
})

app.post('/signUp', async (req, res) => {
    try {
        const Uemail = req.body.email;
        const Upassword = req.body.password;
        const UserData = await moduleData.findOne({ email: Uemail })
        const dbpassworf = await UserData.password

        // compar bcrypt password 
        const Isvalid = await bcrypt.compare(Upassword, dbpassworf)
        console.log(Isvalid);

        // jenerate Token when user will be login 
        const Token = await UserData.generateAuthToken();

        // set cookies when user login 
        res.cookie("logincookies", Token, {
            expires: new Date(Date.now() + 60000),
            httpOnly: true
        })

        // conditional redirect page 
        if (Isvalid) {
            res.render("index")
        } else {
            res.send("invalide data")
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))