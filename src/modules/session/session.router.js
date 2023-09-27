
import express from "express"
import * as session from "./session.controller.js"
// import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"
const sessionRouter = express.Router()


sessionRouter.get('/', session.handleSession)



export default sessionRouter


