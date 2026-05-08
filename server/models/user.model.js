import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'manager'],
        default: 'user'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    telegramId: {
        type: String,
        unique: true,
        sparse: true
    },
    telegramUsername: {
        type: String,
        default: null
    },
    photoUrl: {
        type: String,
        default: null
    },
    fcmToken: {
        type: String,
        default: null
    },
    cart: {
        type: Array,
        default: []
    },
    savedProducts: [{
        type: String  // Product IDs
    }],
    bio: {
        type: String,
        default: ''
    },
    profileImage: {
        type: String,
        default: ''
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
})

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', userSchema)

export default User
