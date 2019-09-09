import mongoose from 'mongoose';


const Schema = mongoose.Schema;

const RatingSchema = Schema({
	cleaner :{
    type: mongoose.Schema.Types.ObjectId,
        ref: 'cleaner_details',
        autopopulate:true
    },

client:{
          type: mongoose.Schema.Types.ObjectId,
        ref: 'client_details',
        autopopulate:true
    },
    rating: {
    	  type: Number,
        required: true
    },
    review: {
    	    type: String,
        required: true
    }
})

RatingSchema.plugin(require('mongoose-autopopulate'))
module.exports = mongoose.model('ratings', RatingSchema);