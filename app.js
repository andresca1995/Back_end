require("dotenv").config()
const jwt = require("jsonwebtoken")
const express = require('express')
const cors = require('cors')
const reset = new (require('rest-mssql-nodejs'))({
    user:'aescobarr',
    password:'Hesoyam1995*',
    server:'prueba-ingreso.database.windows.net',
    database:pruebastoken,
    encrypt: true,
})



const app = express()
app.use(express.json())
app.use(cors({
    origin:['http://localhost:4200'],
    credentials:true,
    }
))

const port = process.env.puerto || 3000;
//Envio de datos para el login
app.post("/api/login",(req, res) =>{
    senddatalogin(req.body.data.nombre,req.body.data.pass,(data)=>{
        //console.log(data.data[0].length>=1);
        if(data.data[0].length>=1){
           jwt.sign({user:data.data},process.env.KEY,(error,token)=>{
                res.json({
                    token:token,
                    user:data.data
                })
            })
    }
    else{
        res.sendStatus(404,"Not Found")
    };
    });
})
//respuesta con los puntos existentes en bd
app.post('/api/puntos/listar',verifictoken,(req,res)=>{
    jwt.verify(req.token,process.env.KEY,(error,authdata)=>{
        console.log(error)
        if(error){
            res.sendStatus(403);
        }else{
            
            senddatamaps((data)=>{
                if(data.data){
                        res.json({
                            puntos:data.data
                        })
                };
            });   
        }
    })
})


app.post('/api/puntos/crud',verifictoken,(req,res)=>{
    jwt.verify(req.token,process.env.KEY,(error,authdata)=>{
        console.log(error)
        if(error){
            res.sendStatus(403);
        }else{
            let data ={
                opcion : req.body.data.opcion,
                id : req.body.data.id,
                nombre : req.body.data.nombre,
                descripcion : req.body.data.descripcion,
                latitud : req.body.data.latitud,
                longitud : req.body.data.longitud
            }
            senddatamapscrud(data,(data)=>{
                res.json({
                    puntos:data.data
                })
            });
        }
    })
})

function verifictoken(req,res,ok){
    const bearerHeader = req.headers.authorization;
    if(typeof bearerHeader !== 'undefined'){
        const bearertoken = bearerHeader.split(' ')[1];
        req.token = bearertoken
        ok()
    }else{
        res.sendStatus(403);
    }
}
///metodos para la ejecucion de procedures
async function senddatamapscrud(data,fnok){
    let response = await  reset.executeStoredProcedure("puntosmapscrud",null,{opcion:data.opcion,id:data.id,nombre:data.nombre,descripcion:data.descripcion,latitud:data.latitud,longitud:data.longitud}); 
    fnok(response)
}

async function senddatamaps(fnok){
    let response = await  reset.executeStoredProcedure("puntosmaps"); 
    fnok(response)
}

async function senddatalogin(user,pass,fnok){
        let response = await  reset.executeStoredProcedure("alluser",null,{usuario:user,pass:pass}); 
        fnok(response)
}

app.listen(port,()=>{
    console.log(`http://localhost:${port}`)
})

/*
 npm install
  npm run build --if-present
  npm run test --if-present

*/