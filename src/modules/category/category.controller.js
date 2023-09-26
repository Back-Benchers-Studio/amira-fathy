import slugify from "slugify"
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import * as factory from "../handlers/factor.handler.js";
import { categoryModel } from './../../../DB/models/category.model.js';
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import cloudinary from "cloudinary";




const createCategory = catchAsyncError(async (req, res, next) => {
//     // cloudinary.uploader.upload(req.file.path).then(async (data) => {

//     //     req.body.slug = slugify(req.body.name)
//     //     req.body.image = data.secure_url;
//         let result = new categoryModel(req.body)
//         await result.save()
//         res.status(201).json({ message: "success", result })
//     }).catch((err) => {
//         res.json(err)
//     });

// })
req.body.slug = slugify(req.body.title)
let result = new categoryModel(req.body)
await result.save()
res.status(201).json({ message: "success", result })

})

const getAllCategories = catchAsyncError(async (req, res, next) => {

    let apiFeatures = new ApiFeatures(categoryModel.find(), req.query)
        .paginate().fields().filter().search().sort()
    //execute query
    let result = await apiFeatures.mongooseQuery
    res.status(200).json({ message: "success", page: apiFeatures.page, result })


})

const getCategory = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    let result = await categoryModel.findById(id)

    !result && next(new AppError(`category not found`), 404)
    result && res.status(200).json({ message: "success", result })
})

const updateCategory = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    req.body.slug = slugify(req.body.name)
    // req.body.image = req.file.filename
    let result = await categoryModel.findByIdAndUpdate(id, req.body, { new: true })

    !result && next(new AppError(`category not found`), 404)
    result && res.status(200).json({ message: "success", result })
}
)
const deleteCategory = factory.deleteOne(categoryModel)

export {
    createCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory
}