require('dotenv').config()
const express = require("express");
// const bodyParser=require("body-parser")
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
// const expressJwt = require("express-jwt");
const cookieParser = require('cookie-parser')
const { adminAuth, authorization } = require("./middlewares")

const pool = require('./database');


const app = express();


const { SECRET } = process.env



// middlewares globales


// rate limiter
const limiter = rateLimit({
  windowMs: 10 * 1000,
  max: 5,
  message: "Excediste el numero de peticiones intenta mas tarde",
});


// // admin rights checker
// const adminAuth = async (req, res, next) => {

//   const id = req.user.id
//   console.log(id)

//   await pool.query('SELECT * FROM users WHERE id = ?', [id], (error, result) => {
//     const posibleAdmin = result[0]
//     if (posibleAdmin.isadmin == "true") {
//       console.log("Authorized user")
//       next()
//     } else {
//       res.send("user not authorized")
//     }

//   });
// };

// // authorization
// const authorization = (req, res, next) => {

//   const token = req.cookies.access_token;
//   if (!token) {
//     return res.sendStatus(403);
//   }
//   else {

//     try {
//       const data = jwt.verify(token, SECRET);
//       req.user = data
//       console.log(`auth Completed, welcome ${data.usuario}`)
//       return next();
//     } catch {
//       return res.sendStatus(403);
//     }

//   }
// };








// const jsonParser = bodyParser.json();
// app.use(express.static("public"));
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(limiter)
app.use(cookieParser())

// secreto





// protect endpoints with express-jwt middleware

// app.use(
//   expressJwt({
//     secret: SECRET,
//     algorithms: ["HS256"],
//   }).unless({
//     path: ["/login", "/register"],
//   })
// );





// get all the menu
app.get('/platos', authorization, (req, res) => {
  pool.query('SELECT * FROM platos', (error, result) => {
    if (error) throw error;
    console.log(req.user)
    res.send(result);
  });
});

// select food by id
app.get('/platos/:id', authorization, (req, res) => {
  const id = req.params.id
  pool.query('SELECT * FROM platos WHERE id =?', [id], (error, result) => {
    if (error) throw error;
    res.send(result);
  });
});


// add a dish
app.post('/platos', authorization, adminAuth, async (req, res) => {
  const { nombre, precio, url } = req.body;

  const newPlato = {
    nombre,
    precio,
    url
  };

  await pool.query("INSERT INTO platos set ?", [newPlato]);
  res.send(`Uploaded ${newPlato.nombre} successfully`)
});


// update dish
app.put('/platos/:id', authorization, adminAuth, async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, url } = req.body;
  const newPlato = {
    nombre,
    precio,
    url
  };
  await pool.query('UPDATE platos set ? WHERE id = ?', [newPlato, id]);
  res.send(`Updated ${newPlato.nombre} successfully`)

});



// Delete dish
app.delete("/platos/:id", authorization, adminAuth, async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM platos WHERE id = ?', [id]);
  res.send(`Deleted dish successfully`)
});


/////////////////////////////////////////////////////////////////////////////



// get all the users
app.get('/users', authorization, adminAuth, async (req, res) => {
  await pool.query('SELECT * FROM users', (error, result) => {
    if (error) throw error;

    res.send(result);
  });
});


// get my user
app.get('/myuser', authorization, async (req, res) => {
  console.log(req.user)
  const myuserid = req.user.id
  await pool.query('SELECT * FROM users WHERE id = ?', [myuserid], (error, result) => {
    if (error) throw error;

    res.send(result);
  });
});


// login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // console.log({ email, password })
  await pool.query("SELECT * FROM users WHERE email = ?", [email], (error, result) => {
    console.log(result)
    if (!result[0]) {
      res.send("user not found")
    } else if (error) {
      res.send({ error })
    } else {
      console.log(result)
      passChecker(result)
    }
  });



  function passChecker(result) {
    if (result[0].password == password) {
      console.log("logged in successfully")
      const token = jwt.sign(
        {
          id: result[0].id,
          email: result[0].email,
          usuario: result[0].usuario,
        },
        SECRET,
        { expiresIn: "60m" }
      );
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
        .status(200)
        .json({ message: "Logged in successfully ", token });
    } else {
      res.status(401).json({ error: "compruebe correo y password" });
    }
  }



});





// // login
// app.post("/login",async(req,res)=>{
//   const { email, password } = req.body;
//   // console.log({ email, password })
//     await pool.query("SELECT * FROM users WHERE email = ?", [email],(error, result) => {

//       if (error)  res.send(error);
//       // res.status(401).json({ error: "compruebe correo y password" });
//       else if (result[0].password==password){
//         console.log("logged in successfully")
//         const token = jwt.sign(
//           {
//             id: result[0].id,
//             email: result[0].email,
//             usuario: result[0].usuario,
//           },
//           SECRET,
//           { expiresIn: "60m" }
//         );
//         res.cookie("access_token", token, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//         })
//         .status(200)
//         .json({ message: "Logged in successfully ",token});
//       }
//     });
// });


// logout
app.get("/logout", authorization, (req, res) => {
  return res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Successfully logged out " });
});




// add new user / register
app.post("/register", async (req, res) => {

  const { usuario, nombreCompleto, email, telefono, direccion, password, isadmin } = req.body;
  const newUser = {
    usuario,
    nombreCompleto,
    email,
    telefono,
    direccion,
    password,
    isadmin
  };

  if (!newUser.isadmin) {
    newUser.isadmin = "false"
  }
  console.log(newUser)
  await pool.query("INSERT INTO users set ?", [newUser]), (error, result) => {
    if (error) {
      throw error
    }
  }
  res.send(`Added ${newUser.usuario} successfully`)
});






// delete user
app.delete("/users/:id", authorization, adminAuth, async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM users WHERE id = ?', [id], (error, result) => {
    if (error) {
      console.log(error)
      res.send(`User with  id:${id} does not exist`);
    } else {
      res.send(`Deleted user with  id:${id} successfully`)
    }
  });
});


// delete my user
app.delete("/myuser", authorization, async (req, res) => {
  console.log(req.user)
  const id = req.user.id
  await pool.query('DELETE FROM users WHERE id = ?', [id], (error, result) => {
    if (error) {
      console.log(error)
      res.send(`User with  id:${id} does not exist`);
    } else {
      res.send(`Deleted user with  id:${id} successfully`)
    }
  });
});


// ////////////PEDIDOS//////////////////////////


// id
// userId:"",
// status:"",
// timestamp
// preciofinal
// address


let items = ""

let finalPrice = 0

app.post("/additem", authorization, async (req, res) => {
  const id = req.body.id;
  const quantity = req.body.quantity;

  // console.log(id,quantity)
  await pool.query("SELECT * FROM platos WHERE id = ?", [id], (error, result) => {
    // console.log(result[0],quantity)
    finalPrice += (result[0].precio * quantity)

    items += `${result[0].nombre} x${quantity}, `
    // console.log(items)
    // console.log(new Date().getHours())
    // console.log(new Date().getMinutes())
    res.send(`${result[0].nombre} x${quantity} added correctly,actual price is ${finalPrice}`)

  })
})





app.post("/orders", authorization, async (req, res) => {


  console.log(req.user)
  let today = new Date();
  let time = today.getHours() + ":" + today.getMinutes()


  await pool.query("SELECT * from users WHERE id = ?", [req.user.id], (error, result) => {
    createOrder(result[0].direccion)

  })


  function createOrder(dir) {
    const newOrder = {
      userId: req.user.id,
      timeStamp: time,
      itemlist: items,
      status: "New",
      price: finalPrice,
      payMethod: req.body.payMethod,
      address: dir
    }

    console.log(newOrder)
    resetOrder()
    res.send({ newOrder })
  }


  //   await pool.query("INSERT INTO platos set ?", [newOrder]),(error, result) => {
  //     if (error){
  //       throw error
  //     }
  // }
  //   res.send(`Added ${newUser.usuario} successfully`)
});



// see all orders made (admin)

app.get("/orders", authorization, adminAuth, async (req, res) => {


})


// see all active orders (admin)

app.get("/orders/active", authorization, adminAuth, async (req, res) => {


})

// update order state (admin)

app.put("/orders/:id", authorization, adminAuth, async (req, res) => {


})










function resetOrder() {
  items = ""
  finalPrice = 0
}


























app.listen(3000, function () {
  console.log("Server started on port 3000");
});
