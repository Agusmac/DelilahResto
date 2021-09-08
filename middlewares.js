const jwt = require("jsonwebtoken");
const pool = require('./database');
const rateLimit = require("express-rate-limit");

const { SECRET } = process.env


// admin rights checker
const adminAuth = async (req, res, next) => {

    const id = req.user.id
    console.log(id)

    await pool.query('SELECT * FROM users WHERE id = ?', [id], (error, result) => {
        const posibleAdmin = result[0]
        if (posibleAdmin.isadmin == "true") {
            console.log("Authorized user")
            next()
        } else {
            res.send("user not authorized")
        }

    });


};

// authorization
const authorization = (req, res, next) => {

    const token = req.cookies.access_token;
    if (!token) {
        return res.sendStatus(403);
    }
    else {

        try {
            const data = jwt.verify(token, SECRET);
            req.user = data
            console.log(`auth Completed, welcome ${data.usuario}`)
            return next();
        } catch {
            return res.sendStatus(403);
        }

    }
};

// rate limiter
const limiter = rateLimit({
    windowMs: 10 * 1000,
    max: 5,
    message: "Excediste el numero de peticiones intenta mas tarde",
  });
  




module.exports={
    adminAuth,
    authorization,
    limiter
}