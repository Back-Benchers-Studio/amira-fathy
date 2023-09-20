import mongoose from "mongoose";


const dbConnection = () => {
    mongoose.connect("")// DB Link
        .then(conn => console.log(`Database connected on ${process.env.DB}`))
        .catch(err => console.log(` Database Error ${err}`))
}

export default dbConnection