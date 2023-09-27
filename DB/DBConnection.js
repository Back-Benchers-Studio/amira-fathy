import mongoose from "mongoose";


const dbConnection = () => {
    mongoose.connect("mongodb+srv://fathyamira689:amiraFGMongoAtlas159@cluster0.9yhzmr9.mongodb.net/ecommerce")// DB Link
        .then(conn => console.log(`Database connected on ${process.env.DB}`))
        .catch(err => console.log(` Database Error ${err}`))
}

export default dbConnection
