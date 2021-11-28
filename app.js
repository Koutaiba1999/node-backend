require("dotenv").config();
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
require("./config/database").connect();
const express = require("express");

const app = express();

app.use(express.json());

// Logic goes here
const User = require("./model/user");
const BloodStock = require("./model/BloodStock");

// Register
app.post("/register", async(req, res) => {
    // Our register logic starts here
    try {
        // Get user input
        const { name, username, email, password } = req.body;

        // Validate user input
        if (!(email && password && name && username)) {
            res.status(400).send("All input is required");
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);

        // Create user in our database
        const user = await User.create({
            name,
            username,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
        });

        // Create token
        const token = jwt.sign({ user_id: user._id, email },
            process.env.TOKEN_KEY, {
                expiresIn: "2h",
            }
        );
        // save user token
        user.token = token;

        // return new user
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
    // Our register logic ends here
});

// Login
app.post("/login", async(req, res) => {
    // Our login logic starts here
    try {
        // Get user input
        const { username, password } = req.body;

        // Validate user input
        if (!(username && password)) {
            res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        const user = await User.findOne({ username });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign({ user_id: user._id, username },
                process.env.TOKEN_KEY, {
                    expiresIn: "2h",
                }
            );

            // save user token
            user.token = token;

            // user
            res.status(200).json(user);
        }
        res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
    // Our register logic ends here
});
const auth = require("./middleware/auth");
app.post("/save", auth, async(req, res) => {
    try {
        const { ville, centre, bloodstock } = req.body;
        if (!(ville, centre, bloodstock)) {
            res.status(400).send("All input is required");
        }
        const bloodStock = await BloodStock.create({
            ville: ville,
            centre: centre,
            bloodstock: bloodstock
        })
        res.status(201).json(bloodStock);
    } catch (err) {
        console.log(err);
    }
});
app.get("/getstock", auth, async(req, res) => {
    try {
        const stock = await BloodStock.find();
        res.status(201).json(stock);
    } catch (err) {
        console.log(err)
    }

})
app.post('/transfertBlood', auth, async(req, res) => {
    try {
        var { ville1, ville2, categorie, souscategorie, quantity } = req.body
        if (!(ville1, ville2, categorie, souscategorie, quantity)) {
            res.status(400).send("All input is required");
        }
        const stock1 = await BloodStock.findOne({ ville: ville1 })
        const stock2 = await BloodStock.findOne({ ville: ville2 })
        console.log('stock 1', stock1)
        console.log('stock 2', stock2)
        var t = [];
        var t2 = []
        for (let i = 0; i < stock1.bloodstock.length; i++) {
            if (stock1.bloodstock[i].categorie == categorie) {
                if (souscategorie == "Plus") {
                    if (quantity < stock1.bloodstock[i].souscategorieplus) {
                        stock1.bloodstock[i].souscategorieplus = stock1.bloodstock[i].souscategorieplus - quantity
                        t.push(stock1.bloodstock[i])
                    } else {
                        quantity = stock1.bloodstock[i].souscategorieplus
                        stock1.bloodstock[i].souscategorieplus = stock1.bloodstock[i].souscategorieplus - quantity
                        t.push(stock1.bloodstock[i])
                    }

                } else {
                    if (quantity < stock1.bloodstock[i].souscategoriemoins) {
                        stock1.bloodstock[i].souscategoriemoins = stock1.bloodstock[i].souscategoriemoins - quantity
                        t.push(stock1.bloodstock[i])
                    } else {
                        quantity = stock1.bloodstock[i].souscategoriemoins
                        stock1.bloodstock[i].souscategoriemoins = stock1.bloodstock[i].souscategoriemoins - quantity
                        t.push(stock1.bloodstock[i])
                    }
                }
            } else {
                t.push(stock1.bloodstock[i]);
            }
        }
        for (let i = 0; i < stock2.bloodstock.length; i++) {
            if (stock2.bloodstock[i].categorie == categorie) {
                if (souscategorie == "Plus") {

                    stock2.bloodstock[i].souscategorieplus = stock2.bloodstock[i].souscategorieplus + quantity
                    t2.push(stock2.bloodstock[i])


                } else {
                    stock2.bloodstock[i].souscategoriemoins = stock2.bloodstock[i].souscategoriemoins + quantity
                    t2.push(stock2.bloodstock[i])
                }
            } else {
                t2.push(stock2.bloodstock[i]);
            }
        }
        console.log('t', t);
        console.log('t2', t2);
        await BloodStock.updateOne({ _id: stock1._id }, {
            bloodstock: t
        });
        await BloodStock.updateOne({ _id: stock2._id }, {
            bloodstock: t2
        });

        res.status(201).json("tranfert effectué avec succés")
    } catch (err) {
        console.log(err)
    }
})
app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});
module.exports = app;