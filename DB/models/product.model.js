import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    title: {
        type: String,
        unique: [true, 'Product title is unique'],
        trim: true,
        required: [true, 'Product title is required'],
        minLength: [2, 'too short product name'],

    },
    slug: {
        type: String,
        lowercase: true,
        required: true
    },

    category: {
         type: mongoose.Types.ObjectId, ref: 'category' ,
        required: true
    },
    price: {
        type: Number,
        required: [true, 'product price is required.'],
        min: 0
    },
    priceAfterDiscount: {  // in progress
        type: Number,
        min: 0
    },
    ratingAvg: {
        type: Number,
        min: [1, 'rating average must be greater then 1'],
        max: [5, 'rating average must be less then 5']
    },
    // ratingCount: {
    //     type: Number,
    //     default: 0,
    //     min: 0
    // },
    description: {
        type: String,
        minLength: [5, 'too short product description'],
        maxLength: [300, 'too long product description'],
        required: [true, 'product description required'],
        trim: true,
    },
    quantity: {
        type: Number,
        default: 0,
        min: 0,
        required: [true, 'product quantity is required']
    },
    sold: {
        type: Number,
        default: 0,
        min: 0
    },
    //imgCover: String,
    images: [String], 
    compatibility:{
        type:[Object],
        default:[]
    },

    

}, 
{ timestamps: true,
     toJSON: { virtuals: true }, 
     toObject: { virtuals: true }, 
    
    })
    
    productSchema.virtual('review', {
        ref: 'review',
        localField: '_id',
        foreignField: 'product',
        // justOne:true
      })


// productSchema.virtual('reviews', {
//     ref: 'review',
//     localField: '_id',
//     foreignField: 'product',
// });

// productSchema.pre(/^find/, function () {
//     this.populate('reviews')
// })



productSchema.post('init', function (doc) {

    if (doc.imgCover && doc.images) {
        doc.imgCover = process.env.BASE_URL + "/product/" + doc.imgCover;
        doc.images = doc.images.map((img) => process.env.BASE_URL + "/product/" + img)
    }

})


export const productModel = mongoose.model('product', productSchema)




