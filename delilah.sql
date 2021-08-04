CREATE DATABASE delilah;

USE delilah;



CREATE TABLE platos (
    id INT(11) NOT NULL,
    nombre VARCHAR(60) NOT NULL,
    precio INT(11) NOT NULL,
    url VARCHAR(250) NOT NULL
);



ALTER TABLE platos
MODIFY id INT(11) NOT NULL 

ALTER TABLE platos
MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;

-- INSERT INTO platos (nombre,precio,url) VALUES ('Papas Fritas c/ Cheddar',250,'https://truffle-assets.imgix.net/12851a77-papas-fritas-con-cheddar_l_es_thumbmp4.png');
-- INSERT INTO platos (nombre,precio,url) VALUES ('Pizza-Especial',450,'https://st.depositphotos.com/1900347/4146/i/600/depositphotos_41466555-stock-photo-image-of-slice-of-pizza.jpg');
-- INSERT INTO platos (nombre,precio,url) VALUES ('Suprema al verdeo',550,'https://hoycocino.com.ar/wp-content/uploads/2019/02/pollo-al-verdeo.jpg');


CREATE TABLE users (
    id INT(11) NOT NULL,
    usuario VARCHAR(60) NOT NULL,
    nombreCompleto VARCHAR(60) NOT NULL,
    email VARCHAR(60) NOT NULL,
    telefono BIGINT NOT NULL,
    direccion VARCHAR(100) NOT NULL,
    password VARCHAR(60) NOT NULL
);

ALTER TABLE users
ADD PRIMARY KEY (id);

ALTER TABLE users
MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;



-- ALTER TABLE users
-- MODIFY telefono BIGINT  NOT NULL;


-- INSERT INTO users (usuario,nombreCompleto,email,telefono,direccion,password) VALUES (
--     'Agusmac','Agustin Mac Rae',
--     "agusmac40@gmail.com",3413524672,
--     "Rioja 1047",
--     "Cocacola12"
-- );
