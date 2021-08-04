const express = require("express");
const bodyParser=require("body-parser")
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");


const pool = require('./database');


const app = express();


// middlewares globales

const jsonParser = bodyParser.json();
app.use(express.static("public"));
server.use(cors());
server.use(helmet());
server.use(compression());



// get all the menu
app.get('/platos', (req, res) => {
  pool.query('SELECT * FROM platos', (error, result) => {
      if (error) throw error;

      res.send(result);
  });
});

// select food by id
app.get('/platos/:id', (req, res) => {
  const id=req.params.id
  pool.query('SELECT * FROM platos WHERE id =?',[id], (error, result) => {
      if (error) throw error;
      res.send(result);
  });
});


// add a dish
app.post('/platos',jsonParser,async(req, res) => {
  const {nombre,precio,url} = req.body;

  const newPlato = {
    nombre,
    precio,
    url
  };

  await pool.query("INSERT INTO platos set ?", [newPlato]);
  res.send(`Uploaded ${newPlato.nombre} successfully`)
});

// update dish

app.put('/platos/:id',jsonParser, async (req, res) => {
  const { id } = req.params;
  const {nombre,precio,url} = req.body;
  const newPlato = {
    nombre,
    precio,
    url
  };
  await pool.query('UPDATE platos set ? WHERE id = ?', [newPlato, id]);
  res.send(`Updated ${newPlato.nombre} successfully`)

});

// Delete dish
app.delete("/platos/:id",async(req,res)=>{
  const { id } = req.params;
  await pool.query('DELETE FROM platos WHERE id = ?', [id]);
  res.send(`Deleted dish successfully`)
});




// get all the users
app.get('/users', async(req, res) => {
 await pool.query('SELECT * FROM users', (error, result) => {
      if (error) throw error;

      res.send(result);
  });
});






// login
app.post("/login",jsonParser,async(req,res)=>{


});

// add new user / register
app.post("/register",jsonParser,async(req,res)=>{

  const {usuario,nombreCompleto,email,telefono,direccion,password} = req.body;
  const newUser = {
    usuario,
    nombreCompleto,
    email,
    telefono,
    direccion,
    password
  };
console.log(newUser)
  await pool.query("INSERT INTO users set ?", [newUser]),(error, result) => {
    if (error){
      throw error
    }
}
  res.send(`Added ${newUser.usuario} successfully`)
});






// delete user
app.delete("/users/:id",async(req,res)=>{
  const { id } = req.params;
  await pool.query('DELETE FROM users WHERE id = ?', [id],(error, result) => {
    if (error) {
      console.log(error)
       res.send(`User with  id:${id} does not exist`);
    }else{
      res.send(`Deleted user with  id:${id} successfully`)
    }
  });
});






app.listen(3000, function() {
  console.log("Server started on port 3000");
});
