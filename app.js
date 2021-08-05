const express = require("express");
// const bodyParser=require("body-parser")
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");


const pool = require('./database');


const app = express();





// middlewares globales


// rate limiter
const limiter = rateLimit({
  windowMs: 10 * 1000,
  max: 5,
  message: "Excediste el numero de peticiones intenta mas tarde",
});







// const jsonParser = bodyParser.json();
// app.use(express.static("public"));
app.use(express.json()); 
app.use(cors()); 
app.use(helmet()); 
app.use(compression());
app.use(limiter)


// secreto
const SECRET="DAEDRAMAREomaSUKARItaDECocoedokkaebiDaRiUsconIgniteyFaNtasMal"




// protect endpoints with express-jwt middleware

app.use(
  expressJwt({
    secret: SECRET,
    algorithms: ["HS256"],
  }).unless({
    path: ["/login", "/register"],
  })
);





// get all the menu
app.get('/platos', (req, res) => {
  pool.query('SELECT * FROM platos', (error, result) => {
      if (error) throw error;
      console.log(req.user)
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
app.post('/platos',async(req, res) => {
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
app.put('/platos/:id', async (req, res) => {
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


// get my user
app.get('/myuser', async(req, res) => {
  console.log(req.user)
const myuserid=req.user.id
  await pool.query('SELECT * FROM users WHERE id = ?', [myuserid],(error, result) => {
       if (error) throw error;
       
       res.send(result);
   });
 });



// login
app.post("/login",async(req,res)=>{

  const { email, password } = req.body;
  console.log({ email, password })

    await pool.query("SELECT * FROM users WHERE email = ?", [email],(error, result) => {
      console.log(result[0])
      if (error) res.status(401).json({ error: "compruebe correo y password" });
      else if (result[0].password==password){
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
    
        res.status(200);
        res.json({ token });
      }
    });

     

});


// add new user / register
app.post("/register",async(req,res)=>{

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




// AGREGAR delete my User con Req.user

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
