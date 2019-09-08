import mongoose from 'mongoose';
import config from './config';

export default callback => {
    let db = mongoose.connect(config.mongoUrl , config.mongoUrlParser);
    // let db = mongoose.connect(config.datsbase, config.mongoUrlParser);

    mongoose.set('useCreateIndex', true);
    console.log("Connected to MongoDB");
    callback(db);
}
