import slugify from "slugify"
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../handlers/factor.handler.js";
import { productModel } from "../../../DB/models/product.model.js";
import { categoryModel } from "../../../DB/models/category.model.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
// import cloudinary from "cloudinary";
import  cloudinary  from "../../utils/cloudinary.js";

// add product
const createProduct = catchAsyncError(async (req, res, next) => {
  // console.log(req.files);
  if (req.files) {
    let imgs = []
    // req.body.slug = slugify(req.body.title)
    //req.body.imgCover = req.files.imgCover[0].filename
    for (const file of req.files.images) {
      const image = await cloudinary.uploader.upload(file.path)
     // req.files.images.forEach((img) => {
        imgs.push(image.secure_url)
     // })
    }
    req.body.images = imgs
  }

    // let imgs = []
    // req.body.slug = slugify(req.body.title)
    // req.body.imgCover = req.files.imgCover[0].filename
    // req.files.images.forEach((img) => {
    //     imgs.push(img.filename)
    // })
    // req.body.images=imgs

    req.body.slug = slugify(req.body.title)
    let category = await categoryModel.find({ "name": `${req.body.category}` }).select('_id')
    req.body.category = category[0]._id;
    console.log(category[0]._id);
    let result = new productModel(req.body)
    await result.save()
    res.status(201).json({ message: "success", result })
  })
// get all products
const getAllProducts = catchAsyncError(async (req, res, next) => {
  let apiFeatures = new ApiFeatures(productModel.find().populate([{ path: 'review' }]),
    req.query)
    .paginate()
    .fields()
    .filter()
    .search()
    .sort()
  //execute query
  // let result = await apiFeatures.mongooseQuery
  // console.log(result);

  const products = await apiFeatures.mongooseQuery
  let avg = 0
  let calc = 0
  for (const product of products) {
    if (product.review) {
      for (const review of product.review) {
        console.log(review.ratings)
        avg += review.ratings
      }
      calc = avg / product.review.length
      product.ratingAvg = Number.parseFloat(calc).toFixed(2)
      await product.save()
    }
    product.ratingAvg = 1
    await product.save()
  }
  res.status(200).json({ message: "success", page: apiFeatures.page, products })
})
// get specific product
const getProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params
  let result = await productModel.findById(id)

  !result && next(new AppError(`Product not found`), 404)
  result && res.status(200).json({ message: "success", result })
})
// update product
const updateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params
  if (req.body.title) req.body.slug = slugify(req.body.title)

  let result = await productModel.findByIdAndUpdate(id, req.body, { new: true })

  !result && next(new AppError(`Product not found`), 404)
  result && res.status(200).json({ message: "success", result })
}
)

const setCompatibility = catchAsyncError(async (req, res, next) => {
    let product =await productModel.findById(req.params.id);
    let catMongo = await categoryModel.findOne({ "name": `${req.body.category}` }).select('_id');

    let addedElements = [];
    let deletedElements = [];

    let found = false;
    for(let i=0;i<product.compatibility.length;i++){
        if(catMongo._id == Object.keys(product.compatibility[i])[0]){
            const productCompatibility = product.compatibility[i];
            const requestCompatibility = req.body.compatibility;

            const productCompatibilitySet = new Set(Object.values(productCompatibility)[0]);
            const requestCompatibilitySet = new Set(requestCompatibility);

            // Find deleted elements
            for (const item of productCompatibilitySet) {
              if (!requestCompatibilitySet.has(item)) {
                  deletedElements.push(item);
              }
            }

            // Find added elements
            for (const item of requestCompatibilitySet) {
              if (!productCompatibilitySet.has(item)) {
                  addedElements.push(item);
              }
            }

          product.compatibility[i][catMongo._id] = req.body.compatibility;
          found = true;
          break;
        }
    }
    if(!found){
      let obj ={};
      obj[catMongo._id] = req.body.compatibility;
      addedElements = addedElements.concat(req.body.compatibility);
      product.compatibility.push(obj);
    }
    product.markModified('compatibility');

    for (const item of addedElements) {
      addCompatability(item,req.params.id);
    }

    for(const item of deletedElements){
      deleteCompatability(item,req.params.id);
    }

    await product.save();
    res.status(200).json({ message: "success", product })

})


const addCompatability = catchAsyncError(async (ProductIDarray,productIDreq) => {
  const product = await productModel.findById(ProductIDarray);
  const productreqMongo = await productModel.findById(productIDreq);

  let found = false;
  for(let i = 0; i < product.compatibility.length; i++){
    if(productreqMongo.category == Object.keys(product.compatibility[i])[0]){
      Object.values(product.compatibility[i])[0].push(productIDreq);
      found = true;
      break;
    }
  }

  if(!found){
    let obj ={};
    obj[productreqMongo.category] = [productIDreq];
    product.compatibility.push(obj);
  }
  product.markModified('compatibility');
  await product.save();
})

const deleteCompatability = catchAsyncError(async (ProductIDarray,productIDreq) => {
  const product = await productModel.findById(ProductIDarray);
  const productreqMongo = await productModel.findById(productIDreq);
  for (let i = 0; i < product.compatibility.length; i++) {
    if (productreqMongo.category == Object.keys(product.compatibility[i])[0]) {
      const indexToRemove = Object.values(product.compatibility[i])[0].indexOf(productIDreq);
        Object.values(product.compatibility[i])[0].splice(indexToRemove, 1);
        break;
    }
  }
  product.markModified('compatibility');
  await product.save();
})


// delete product
const deleteProduct = deleteOne(productModel)

export {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  setCompatibility
}