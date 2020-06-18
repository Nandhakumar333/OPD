require('dotenv').config()
const Koa = require('koa')
const serve = require('koa-static')
const Router = require('koa-router')
const views = require('koa-views')
const bodyParser = require('koa-bodyparser')
const mongo = require('mongodb').MongoClient
const assert = require('assert')
const express = require('express')
var routerz = express.Router();
const mongoose=require('mongoose');
var url = 'mongodb://localhost:27017';
const db = 'Node';
const moment=require('moment');


const port = process.env.PORT || 3000
const app = new Koa()
const router = new Router()

mongoose.connect('mongodb+srv://hacker:fx22rKDkhoMkY1sW@test-dajmv.mongodb.net/OPD_USERS?retryWrites=true&w=majority',{useNewUrlParser: true,
useUnifiedTopology: true,useCreateIndex:true},()=>{
  console.log("MongoDB Connected")
})

const Nexmo = require('nexmo');
const { futimesSync } = require('fs')
const nexmo = new Nexmo({
    apiKey: process.env.APIKEY,
    apiSecret: process.env.APISECRET
});

app.use(serve('./public'))
app.use(views('./views', { map: { html: 'nunjucks' }}))
app.use(bodyParser())



const UserSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true,
    unique: true
  },
  email:{
    type:String,
    required:true,
    unique: true
  },
  dob:{
    type:Date,
  },
  gender:{
    type:String
  }
})

const userSchema=mongoose.model('User',UserSchema);

const UsersymSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true,
    unique: true
  },
  symptom:{
    type:String,
    required:true
  },
  doctor_name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true,
    unique: true
  },
  dob:{
    type:Date,
  },
  gender:{
    type:String
  }
})

const usersymSchema=mongoose.model('SymtomsbasedUser',UsersymSchema);

router.get('/', (ctx, next) => {
  return ctx.render('./index')
})



router.post('/verify/', async (ctx, next) => {
  const payload = await ctx.request.body
  const phone = payload.phone

  const result = await verify(phone)
  const reqId = result.request_id 
  ctx.status = 200
  return ctx.render('./verify', { reqId: reqId })
})

router.post('/cancel/', async (ctx, next) => {
  const payload = await ctx.request.body
  const reqId = payload.reqId

  const result = await cancel(reqId)
  ctx.status = 200
  ctx.response.redirect('/')
})




router.post('/check/', async (ctx, next) => {
  const payload = await ctx.request.body
  const code = payload.pin
  const reqId = payload.reqId
  
  const result = await check(reqId, code)
  const status = result.status
  ctx.status = 200
  return ctx.render('./result', { status: status })
  
})

router.get('/knowdoctor/', async (ctx, next) => {
  var val = ctx.request.query.search;
  const data={name:val}
  console.log(data.name);
  return ctx.render('./knowdoctor' ,{data:data.name});

})

router.post('/knowdoctor_register/', async (ctx, next) => {
  const name=ctx.request.body.name;
  const symptom=ctx.request.body.symptoms;
  const doctor=ctx.request.body.drname;
  const email=ctx.request.body.email;
  const date=ctx.request.body.date;
  const gender=ctx.request.body.gender;
  const sym_patient=new usersymSchema({
    name:name,
    symptom:symptom,
    doctor_name:doctor,
    email:email,
    date:date,
    gender:gender
  })
  sym_patient.save((err)=>{
    if(err){
      console.log(err)
    }
    else{
      console.log("Data Saved")

    }
  })
  ctx.status = 200
  console.log(sym_patient);
  return ctx.render('./next',{data:sym_patient})
})

router.post('/register/', async (ctx, next) => {
  const DOB=ctx.request.body.dob;
    const item =new userSchema( {
        name: ctx.request.body.name,
        email:ctx.request.body.email,
        dob: DOB,
        gender: ctx.request.body.gender
    });
  
    item.save((err)=>{
      if(err){
        console.log(err);
      }
      else{
        console.log("Data Saved");
      }
    })

    
    ctx.status = 200
    return ctx.render('./next')
});

app.use(router.routes()).use(router.allowedMethods())

const listener = app.listen(port, function() {
  console.log('Your app is listening on port ' + listener.address().port)
})

async function verify(number) {
  return new Promise(function(resolve, reject) {
    nexmo.verify.request({
      number: number,
      brand: 'Vonage'
    }, (err, result) => {
      if (err) {
        console.error(err)
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

async function check(reqId, code) {
  return new Promise(function(resolve, reject) {
    nexmo.verify.check({
      request_id: reqId,
      code: code
    }, (err, result) => {
      if (err) {
        console.error(err)
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

async function cancel(reqId) {
  return new Promise(function(resolve, reject) {
    nexmo.verify.control({
      request_id: reqId,
      cmd: 'cancel'
    }, (err, result) => {
      if (err) {
        console.error(err)
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}