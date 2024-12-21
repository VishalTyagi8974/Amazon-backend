const express = require("express");
const mongoose = require("mongoose");

const User = require('./models/userModel');

mongoose.connect('mongodb://127.0.0.1:27017/Amazon').then(() => {
    console.log("Connected to MDB")
}).catch(() => {
    console.log("Failed to Connect MDB")
})

async function createUser() {
    const user = new User({})
    const newUser = await user.save();
    console.log(newUser._id);
}

createUser().then(() => {
    mongoose.connection.close();
})
