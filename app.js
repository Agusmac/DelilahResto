require('dotenv').config()
const express = require("express");
// const bodyParser=require("body-parser")
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
// const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
// const expressJwt = require("express-jwt");
const cookieParser = require('cookie-parser')
const { adminAuth, authorization, limiter } = require("./middlewares")

const pool = require('./database');

const app = express();

const { SECRET } = process.env

const mysql = require("mysql");
// middlewares globales


// const jsonParser = bodyParser.json();
// app.use(express.static("public"));
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(limiter)
app.use(cookieParser())




// /////////////////////////////////////////////////////////////////



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
    // console.log(result)
    if (!result[0]) {
      res.send("user not found")
    } else if (error) {
      res.send({ error })
    } else {
      // console.log(result)
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







// ////////////PEDIDOS 2//////////////////////////


// app.post("/order", authorization, async (req, res) => {

//   const payMethod = req.body.payMethod;

//   let today = new Date();

//   const newOrder = {
//     precio_total: 0,
//     created_at: today,
//     estado: "New",
//     forma_pago: payMethod,
//     users_id: req.user.id
//   }

//   await pool.query("INSERT INTO pedidos set ?", [newOrder]), (error, result) => {
//     console.log(result.insertId)
//     if (error) {
//       throw error
//     }
//     console.log(result.insertId)
//   }




//   // await pool.query('SELECT MAX(Id) FROM pedidos', (error, result) => {

//   //   intermediate(result[0]['MAX(Id)'])
//   //   .then(()=>{
//   //     keeper("finish")
//   //   })


//   // });



//   // (id)+1 to fix properly
//   // const orderId = id + 1


//   // let characterResponse = await fetch('http://swapi.co/api/people/2/')
//   // let characterResponseJson = await characterResponse.json()
//   // let films = await Promise.all(
//   //   characterResponseJson.films.map(async filmUrl => {
//   //     let filmResponse = await fetch(filmUrl)
//   //     return filmResponse.json()
//   //   })
//   // )


//   await Promise.all(req.body.items.map(async item => {
//     const { id, quantity } = item

//     await pool.query('SELECT precio FROM platos WHERE id =?', id, (error, result) => {
//        keeper(result[0].precio * quantity)
//        console.log()
//     })

//     console.log("A")
//   }

//   // console.log(films)

//   )).then(()=>{
//     keeper("finish")
//   })

//   await console.log("B")


//   // console.log(brr)
//   // .then(() => {
//   //   keeper("finish")
//   // })
//   // keeper("finish")

//   res.send("order made correctly")

//   // keeper("finish")

// })


// function keeper(foodPrice) {
//   if (foodPrice == "finish") {
//     console.log("final Price: ", orderPrice)
//   } else {
//     orderPrice = orderPrice + foodPrice
//     console.log(orderPrice)
//   }

// }







// // .then(keeper(1)).then(keeper("finish"))



var orderPrice = 0

app.post("/orders", authorization, async (req, res) => {

  const payMethod = req.body.payMethod;

  let today = new Date();

  // let date = today.getHours()+":"+ today.getMinutes()


  const newOrder = {
    precio_total: 0,
    created_at: today,
    estado: "New",
    forma_pago: payMethod,
    users_id: req.user.id
  }


  await pool.query("INSERT INTO pedidos set ?", [newOrder]), (error, result) => {
    if (error) {
      throw error
    }
  }


  await pool.query('SELECT MAX(Id) FROM pedidos', (error, result) => {
    intermediate(result[0]['MAX(Id)'])
  });


  function intermediate(id) {
    // (id)+1 to fix properly
    const orderId = id + 1

    req.body.items.map(item => {
      const { id, quantity } = item
      const newPedido = {
        pedidos_id: orderId,
        platos_id: id,
        cantidad: quantity
      }
      pool.query('SELECT precio FROM platos WHERE id =?', id, (error, result) => {
        keeper(result[0].precio * quantity, orderId)
      })
      pool.query("INSERT INTO pedidos_has_platos set ?", [newPedido]), (error, result) => {
        if (error) throw error;
      }
    })
    setTimeout(() => {

      keeper("finish")
      console.log(orderPrice)
      res.send("order made correctly")
    }, 500);
  }
})


function keeper(foodPrice, orderId) {
  if (foodPrice == "finish") {
    resetOrder()
  } else {
    orderPrice = orderPrice + foodPrice

    pool.query(`UPDATE pedidos set precio_total=${orderPrice} WHERE id = ?`, [orderId]);

    console.log(orderPrice, orderId)
  }
}



// see all orders made (admin)
app.get("/orders", authorization, adminAuth, async (req, res) => {
  await pool.query('SELECT * FROM pedidos ', (error, result) => {
    res.send(result)
  })
})



// see all active orders (admin)

app.get("/orders/active", authorization, adminAuth, async (req, res) => {
  await pool.query('SELECT * FROM pedidos WHERE estado <> "Canceled" AND estado <> "Delivered"  ', (error, result) => {
    if (error) console.log(error);
    console.log("brr")
    res.send(result)
  })
})


// update order state (admin)
app.put("/orders/update/:id", authorization, adminAuth, async (req, res) => {
  const id = req.params.id
  await pool.query('SELECT estado FROM pedidos WHERE id =?', [id], (error, result) => {
    if (error) throw error;
    orderUpdater(result[0].estado, id);
  });

  function orderUpdater(state, orderId) {
    // new-confirmed-being prepared-in delivery-delivered-canceled
    // console.log(state, orderId)

    let newState = ""

    switch (state) {
      case "New":
        newState = "Confirmed"
        break;
      case "Confirmed":
        newState = "Being prepared"
        break;
      case "Being prepared":
        newState = "In delivery"
        break;
      case "In delivery":
        newState = "Delivered"
        break;
      case "Delivered":
        newState = "Delivered"
        break;
      case "Canceled":
        newState = "Canceled"
        break;
    }
    // console.log(newState, orderId)
    pool.query(`UPDATE pedidos SET estado = ? WHERE id = ?`, [newState, orderId]);
    res.send(`Updated order ${orderId} state to: ${newState}`)
  }
})

// cancel order by id  (admin)
app.put("/orders/cancel/:id", authorization, adminAuth, async (req, res) => {
  const id = req.params.id
  pool.query(`UPDATE pedidos set estado="Canceled" WHERE id = ?`, [id]);
  res.send(`Canceled order: ${id}`)
})

app.get("/myorders", authorization, async (req, res) => {
  await pool.query(`SELECT * FROM pedidos WHERE users_id=${req.user.id} AND estado <> "Canceled"`, (error, result) => {
    if(result[0]==undefined){
      res.send(`No active orders from ${req.user.usuario}`)
    }else{
      res.send(result)
    }
  })
})








function resetOrder() {
  orderPrice = 0
}

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
