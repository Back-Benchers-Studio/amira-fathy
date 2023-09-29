
import express from "express"
import * as category from "./category.controller.js"
import { validation } from "../../middleware/validation.js"
import { createCategorySchema, getCategorySchema, updateCategorySchema } from "./category.validation.js"
import { uploadSingleFile } from "../../utils/imageUploading.js"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"

const categoryRouter = express.Router()


categoryRouter
    .route('/')
    .post(protectedRoutes, allowedTo('admin'),uploadSingleFile('image', 'category'), validation(createCategorySchema), category.createCategory)
    .get(category.getAllCategories)

categoryRouter
    .route('/:id')
    .get(validation(getCategorySchema), category.getCategory)
    .put(protectedRoutes, allowedTo('admin'),/*uploadSingleFile('image', 'category'),*/ validation(updateCategorySchema), category.updateCategory)
    .delete(protectedRoutes, allowedTo('admin'),category.deleteCategory)


export default categoryRouter


