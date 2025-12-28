const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'client'], default: 'client' },
    image: { 
        type: String, 
    },
    imagePublicId: { type: String },
    isActive: { type: Boolean, default: true },
    resetToken: { type: String },
    tokenExpire: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);