const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://jinyongnan:jinyongnan@cluster0-xk5om.mongodb.net/buglogger?retryWrites=true&w=majority',
            {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true
            })
        console.log('mongo connected.')
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}
module.exports = connectDB