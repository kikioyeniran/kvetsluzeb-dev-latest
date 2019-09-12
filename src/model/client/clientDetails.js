import mongoose from 'mongoose';

//Client Detils Schema
let ClientDetailsSchema = mongoose.Schema({
    postcode:{
        type: String,
        required: true
    },
    bedrooms:{
        type: Number,
      
    },
    bathrooms:{
        type: Number,
      
    },
    extraTasks:{
        type: Array,

    },
    dateFirstClean:{
        type: Date,
     
    },
    cleaningHours:{
        type: Number,
   
    },
    moreCleaningHours:{
        type: Number
    },
    cleaningPriority:{
        type: String
    },
    apartmentAccess:{
        type: String,
    
    },
    keyHiddenPin:{
        type: String
    },
    keySafePin:{
        type: String
    },
    cleaningFrequency:{
        type: String,
      
    },
    mobileNumber:{
        type: Number,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    fullName:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    country:{
        type: String,
        //required: true
    },
    rating:{
        type: Number,
        default: 0
    },
    clientID:{
        type: String,
        required: true
    },
    profilePic:{
        type: String,
        required: true
    },
    updated:{
        type: Date,
        default: Date.now
    }
});

let ClientDetails = module.exports = mongoose.model('client_details', ClientDetailsSchema);