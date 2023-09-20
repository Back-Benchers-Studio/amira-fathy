import mongoose from "mongoose";
import bcrypt from "bcrypt"
const userSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'user name is required'],
        minLength: [1, 'too short user name']
    },
    email: {
        type: String,
        trim: true,
        required: [true, 'email is required'],
        minLength: 1,
        unique: [true, 'email must be unique']
    },
    password: {
        type: String,
        required: true,
        minLength: [6, 'minLength 6 characters'],
    },
    passwordChangedAt: Date,
    loggedOutAt: Date,

    phone: {
        type: String,
        required: [true, 'phone number is required'],

    },
    profilePic: String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: "user"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    // wishlist: [{  // in progress
    //     type: mongoose.SchemaTypes.ObjectId,
    //     ref: 'product'
    // }],
    addresses:[
        {
            street:String,
            city:String,
            phone:String
        }
    ]
}, { timestamps: true })

userSchema.pre('save', function () {
    console.log(this);
    this.password = bcrypt.hashSync(this.password, 7)
})

userSchema.pre('findOneAndUpdate', function () {

    if (this._update.password) this._update.password = bcrypt.hashSync(this._update.password, 7)
})

export const userModel = mongoose.model('user', userSchema)



