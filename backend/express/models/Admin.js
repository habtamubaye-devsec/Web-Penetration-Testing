const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' },
    image: { 
        type: String, 
        default: 'https://res.cloudinary.com/dwzxqbwv1/image/upload/v1746170602/hjhhrjdunjjo8tyfzgpe.jpg' 
    },
    phone: { type: String },
    address: { type: String },
    isActive: { type: Boolean, default: true },
    resetToken: { type: String },
    tokenExpire: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);