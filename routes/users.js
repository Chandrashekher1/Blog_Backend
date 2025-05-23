const auth = require('../middleware/auth') 
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {Users,validate} = require('../models/users')
const express = require('express')
const router = express.Router()

router.get('/me',[auth], async (req,res) => {
    const user = await Users.findById(req.user._id).select('-password')
    res.send(user)
})

router.get('/:id',[auth], async (req,res) => {
    const user = await Users.findById(req.params.id).select('-password')
    res.send(user)
})

router.post('/', async (req,res) => {
    const {error} = validate(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    
    let user = await Users.findOne({email:req.body.email})
    if(user) {
        return res.status(400).json({ message: "User is already exists" });
    }

    user = new Users({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(req.body.password,salt)
    user = await user.save()
    const token = user.generateAuthToken()    
    res.header('Authorization',token).json({ message: "User registered Successfully", token }).send(user)
})



module.exports = router