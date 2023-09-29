
import multer from "multer"
import { AppError } from "./AppError.js"

let options = (folderName) => {
    const storage = multer.diskStorage({})

    function fileFilter(req, file, cb) {
        if (file.mimetype.startsWith('image')) {
            cb(null, true)
        } else {
            cb(new AppError('images only', 400), false)
        }
    }
    const upload = multer({ storage, fileFilter })
    return upload
}
export const uploadSingleFile = (fieldName, folderName) => options(folderName).single(fieldName)

export const uploadMixOfFile = (arrayOfFields, folderName) => options(folderName).fields(arrayOfFields)
