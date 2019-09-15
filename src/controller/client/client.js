import { Router } from 'express';
import mongoose from 'mongoose';
import config from '../../config';
const stripe = require('stripe')(config.stripeSectretKey);

import empty from 'is-empty';

import { validateToken } from '../../utils';

import Client from '../../model/client/client';
import ClientDetails from '../../model/client/clientDetails';

import Cleaner from '../../model/cleaner/cleaner'
import CleanerDetails from '../../model/cleaner/cleanerDetails';
import ClientWallet from '../../model/client/clientWallet';
import Transactions from '../../model/allTransactions';
import CleaningSchedule from '../../model/cleaningSchedule'
import Rating from '../../model/Rating';
// let Client =  require('../../models/client');
// let ClientDetails =  require('../../models/clientDetails');
// let Cleaner =  require('../../models/cleaner');
// let CleanerDetails =  require('../../models/cleanerDetails');
// let ClientWallet =  require('../../models/clientWallet');
// let Transactions =  require('../../models/allTransactions');
// let CleaningSchedule = require('../../models/cleaningSchedule');

export default ({config, db}) => {
    let api  = Router();

  
    api.post('/transaction', validateToken, (req, res)=>{
        console.log('form submitted');
        const clientID = req.body.clientID;
        const clientName = req.body.clientName;
        const cleanerID = req.body.cleanerID;
        const cleanDate = req.body.cleanDate;
        const totalPay = req.body.totalPay;
        let clientQuery = {clientID: clientID};
        Client.findOne((clientQuery), (err, clients)=>{
            var mainID = clients._id;
            Cleaner.findById(cleanerID, (err, mainCleaner)=>{
                let walletUpdate = {};
                var pendingPay = [];
                walletUpdate.pendingPay = pendingPay;
                let walletQuery = {pendingPay:[{cleanerID: cleanerID}]};
                //Update Client Wallet and Set Pending Pay to empty
                ClientWallet.updateOne(walletQuery, walletUpdate, (err, updWallet)=>{
                    var queryCleaner = {cleanerID: mainCleaner.cleanerID};
                    // Get Cleaner Details
                    CleanerDetails.findOne((queryCleaner), (err, cleanerDetails)=>{
                        console.log(cleanerDetails.fullName);
                         let cleanerName = cleanerDetails.fullName
                        req.checkBody('clientID', 'clientID is required').notEmpty();
                        req.checkBody('clientName', 'clientName is required').notEmpty();
                        req.checkBody('cleanerID', 'clientPhone is required').notEmpty();
                        req.checkBody('cleanDate', 'Date is required').notEmpty();
                        req.checkBody('totalPay', 'totalPay is required').notEmpty();

                        let errors = req.validationErrors();
                        let result = {};
                        let statusCode = 400;
                        if(errors){
                            result.statusCode = statusCode;
                            result.error = errors;
                            res.status(statusCode).send(result);
                            console.log(errors)
                        }else{
                            let scheduleQuery = {cleanerID: cleanerID};
                            let scheduleUpdate = {};
                            var newStatus = {
                                paidStatus: true
                            }
                            scheduleUpdate.lastClean = newStatus;
                            CleaningSchedule.updateOne(scheduleQuery, scheduleUpdate, (err, schedule)=>{
                                //console.log(schedule.lastClean[0].lastCleanDate);
                                if(err){
                                    console.log(err)
                                }else{
                                    let newTransaction = new Transactions({
                                        clientID: clientID,
                                        clientName: clientName,
                                        cleanerID: cleanerID,
                                        cleanerName: cleanerName,
                                        Date: cleanDate,
                                        totalPaid: totalPay,
                                    });

                                    newTransaction.save((err) =>{
                                        let result = {};
                                        let statusCode = 200;
                                        if(err){
                                            statusCode = 404;
                                            result.statusCode = statusCode;
                                            result.error = err;
                                            res.status(statusCode).send(result);
                                        }else {
                                          result.message = 'Transaction Completed';
                                          result.statusCode = statusCode;
                                          result.userID = mainID
                                          res.status(statusCode).send(result);
                                        }
                                    });
                                }
                            })
                        }
                    })
                })
            })
        })
    });

   api.post('/transaction_app', validateToken, (req, res)=>{
        console.log('form submitted');
        const clientID = req.body.clientID;
        const clientName = req.body.clientName;
        const cleanerID = req.body.cleanerID;
        const cleanDate = req.body.cleanDate;
        const totalPay = req.body.totalPay;
        let clientQuery = {clientID: clientID};
        Client.findOne((clientQuery), (err, clients)=>{
            var mainID = clients._id;
            Cleaner.findById(cleanerID, (err, mainCleaner)=>{
                let walletUpdate = {};
                var pendingPay = [];
                walletUpdate.pendingPay = pendingPay;
                let walletQuery = {pendingPay:[{cleanerID: cleanerID}]};
                //Update Client Wallet and Set Pending Pay to empty
                ClientWallet.updateOne(walletQuery, walletUpdate, (err, updWallet)=>{
                    var queryCleaner = {cleanerID: mainCleaner.cleanerID};
                    // Get Cleaner Details
                    CleanerDetails.findOne((queryCleaner), (err, cleanerDetails)=>{
                        console.log(cleanerDetails.fullName);
                         let cleanerName = cleanerDetails.fullName
                        req.checkBody('clientID', 'clientID is required').notEmpty();
                        req.checkBody('clientName', 'clientName is required').notEmpty();
                        req.checkBody('cleanerID', 'clientPhone is required').notEmpty();
                        req.checkBody('cleanDate', 'Date is required').notEmpty();
                        req.checkBody('totalPay', 'totalPay is required').notEmpty();

                        let errors = req.validationErrors();
                        let result = {};
                        let statusCode = 400;
                        if(errors){
                            result.statusCode = statusCode;
                            result.error = errors;
                            res.status(statusCode).send(result);
                            console.log(errors)
                        }else{
                            let scheduleQuery = {cleanerID: cleanerID};
                            let scheduleUpdate = {};
                            var newStatus = {
                                paidStatus: true
                            }
                            scheduleUpdate.lastClean = newStatus;
                            CleaningSchedule.updateOne(scheduleQuery, scheduleUpdate, (err, schedule)=>{
                                //console.log(schedule.lastClean[0].lastCleanDate);
                                if(err){
                                    console.log(err)
                                }else{
                                    let newTransaction = new Transactions({
                                        clientID: clientID,
                                        clientName: clientName,
                                        cleanerID: cleanerID,
                                        cleanerName: cleanerName,
                                        Date: cleanDate,
                                        totalPaid: totalPay,
                                    });

                                    newTransaction.save((err) =>{
                                        let result = {};
                                        let statusCode = 200;
                                        if(err){
                                            statusCode = 404;
                                            result.statusCode = statusCode;
                                            result.error = err;
                                            res.status(statusCode).send(result);
                                        }else {
                                          result.message = 'Transaction Completed';
                                          result.statusCode = statusCode;
                                          result.userID = mainID;
                                           result.fullName= cleanerDetails.fullName
                                          result.cleaner = mainCleaner
                                          console.log(result) //.fullName= cleanerDetails.fullName
                                          res.status(statusCode).send(result);
                                        }
                                    });
                                }
                            })
                        }
                    })
                })
            })
        })
    });

    // payment success
    // api/v1/client/:clientID
    api.get('/:clientID',  (req, res) =>{
        var clientID = req.params.clientID;
        var revisit  = true;
        let result = {
            'statusCode': 200,
            'revisit': revisit,
            'clientID': clientID
        }

        res.status(result.statusCode).send(result);

    });


// hh
   api.post('/transaction', validateToken, (req, res)=>{
        console.log('form submitted');
        const clientID = req.body.clientID;
        const clientName = req.body.clientName;
        const cleanerID = req.body.cleanerID;
        const cleanDate = req.body.cleanDate;
        const totalPay = req.body.totalPay;
        let clientQuery = {clientID: clientID};
        Client.findOne((clientQuery), (err, clients)=>{
            var mainID = clients._id;
            Cleaner.findById(cleanerID, (err, mainCleaner)=>{
                let walletUpdate = {};
                var pendingPay = [];
                walletUpdate.pendingPay = pendingPay;
                let walletQuery = {pendingPay:[{cleanerID: cleanerID}]};
                //Update Client Wallet and Set Pending Pay to empty
                ClientWallet.updateOne(walletQuery, walletUpdate, (err, updWallet)=>{
                    var queryCleaner = {cleanerID: cleanerID};
                    // Get Cleaner Details
                    CleanerDetails.findOne((queryCleaner), (err, cleanerDetails)=>{
                        console.log(cleanerDetails.fullName);
                         let cleanerName = cleanerDetails.fullName
                        req.checkBody('clientID', 'clientID is required').notEmpty();
                        req.checkBody('clientName', 'clientName is required').notEmpty();
                        req.checkBody('cleanerID', 'clientPhone is required').notEmpty();
                        req.checkBody('cleanDate', 'Date is required').notEmpty();
                        req.checkBody('totalPay', 'totalPay is required').notEmpty();

                        let errors = req.validationErrors();
                        let result = {};
                        let statusCode = 400;
                        if(errors){
                            result.statusCode = statusCode;
                            result.error = errors;
                            res.status(statusCode).send(result);
                            console.log(errors)
                        }else{
                            let scheduleQuery = {cleanerID: cleanerID};
                            let scheduleUpdate = {};
                            var newStatus = {
                                paidStatus: true
                            }
                            scheduleUpdate.lastClean = newStatus;
                            CleaningSchedule.updateOne(scheduleQuery, scheduleUpdate, (err, schedule)=>{
                                //console.log(schedule.lastClean[0].lastCleanDate);
                                if(err){
                                    console.log(err)
                                }else{
                                    let newTransaction = new Transactions({
                                        clientID: clientID,
                                        clientName: clientName,
                                        cleanerID: cleanerID,
                                        cleanerName: cleanerName,
                                        Date: cleanDate,
                                        totalPaid: totalPay,
                                    });

                                    newTransaction.save((err) =>{
                                        let result = {};
                                        let statusCode = 200;
                                        if(err){
                                            statusCode = 404;
                                            result.statusCode = statusCode;
                                            result.error = err;
                                            res.status(statusCode).send(result);
                                        }else {
                                          result.message = 'Transaction Completed';
                                          result.statusCode = statusCode;
                                          result.userID = mainID
                                          res.status(statusCode).send(result);
                                        }
                                    });
                                }
                            })
                        }
                    })
                })
            })
        })
    });

    // api/v1/client/bookingFinal/:clientID
    api.get('/bookingFinal/:clientID', validateToken, (req, res) =>{
   
        Client.findOne(({clientID: req.params.clientID}), (err, client) =>{
            console.log(client)
            let result = {};
            let statusCode = 200;
            ClientDetails.findOne(({clientID: req.params.clientID}), (err, client_details)=>{
                console.log(client_details.city);
                var query2 = {city: client_details.city};
                CleanerDetails.find((query2), (err, cleanerDetails)=>{
                    if(empty(cleanerDetails)){
                        result.statusCode = statusCode;
                        result.user = client;
                        result.userDetails = client_details
                        res.status(statusCode).send(result);

                    }else{
                        result.statusCode = statusCode;
                        result.user = client;
                        result.cleaner_details = cleanerDetails;
                        result.userDetails = client_details
                        res.status(statusCode).send(result);

                        //console.log(cleanerDetails);
                        // res.render('booking_final',{
                        //     client: client,
                        //     clientDetails: client_details,
                        //     cleanerDetails: cleanerDetails
                        // });
                    }

                });
            });
        });
    });

    // api/v1/client/renewBooking/:clientID/:id
    api.post('/renewBooking/:clientID/:id', validateToken, (req, res) =>{
        let client = {};
        client.bedrooms = req.body.bedrooms;
        //console.log(req.body.fullName);
        client.bathrooms = req.body.bathrooms;
        client.extraTasks = req.body.extraTasks;
        client.dateFirstClean = req.body.date;
        client.cleaningHours = req.body.hours;
        client.moreCleaningHours = req.body.more_hours;
        client.apartmentAccess = req.body.access_type;
        client.keyHiddenPin = req.body.keyHiddenPin;
        client.keySafePin = req.body.keySafePin;
        client.cleaningFrequency = req.body.schedule;
        let query = {clientID : req.params.clientID}
        console.log(query);
        console.log(req.params.clientID)

        ClientDetails.updateOne(query, client, (err) =>{
            let result = {};
            let statusCode = 200;
                if (err) {
                    statusCode = 400;
                    result.statusCode = statusCode;
                    result.error = err;
                    res.status(statusCode).send(result);
                }
                result.statusCode = statusCode
                result.message = 'Found and updated'
                result.id = req.param.id;
                res.status(statusCode).send(result);
        });
    });


    api.post('/pay', validateToken, (req, res)=>{

        let amount = req.body.totalPay? req.body.totalPay * 100: 50*100;

  //       stripe.customers.create({
  //         email: , // customer email
  //       //token for the card
  //       }).then((customer) => {
  //   return stripe.customers.createSource(customer.id, {
  //     source: 'tok_visa',
  //   });
  // }).then(source =>
  //           stripe.charges.create({
  //             // charge the customer
  //             amount,
  //             description: 'Cleaning for a particular cleaner',
  //             currency: 'eur',
  //             customer:source.customer,
  //           }))

  stripe.customers
  .create({
    email: req.body.stripeEmail||'allisonkosy@gmail.com',
  })
  .then((customer) => {
    console.log(customer)
    return stripe.customers.createSource(customer.id, {
      source: 'tok_visa',
    });
  })
  .then((source) => {
        console.log(source)
    return stripe.charges.create({
      amount: amount,
      currency: 'eur',
      customer: source.customer,
    });
  }).then(charge => res.json({
              clientID: req.body.clientID,
              clientName: req.body.clientName,
              cleanerID: req.body.cleanerID,
              cleanDate: req.body.cleanDate,
              totalPay: req.body.totalPay,
              success: true
          })) //render the payment successful page
      });


    api.get('/schedule/:clientDetailsID', (req, res)=> {
        let result={}, statusCode=200
        CleaningSchedule.findOne({
             clientDetails:req.params.clientDetailsID
        }, (err, cs)=>{
                if (err) {
                    statusCode = 400;
                    result.statusCode = statusCode;
                    result.error = err;
                    res.status(statusCode).send(result);
                }
                result.statusCode = statusCode
                result.message = 'Found and updated'
            result.cs = cs
                res.status(statusCode).send(result);
        })
    })


    api.post('/review/:clientID/:cleanerID', (req, res)=> {
           let result =  {};
            let statusCode = 200;
            Cleaner.findById(req.params.cleanerID)
            .exec((err, cleaner) => {

                CleanerDetails.findOne({cleanerID: cleaner.cleanerID},(err, dets)=> {
             if(err){
                            statusCode = 500;
                            result.statusCode = statusCode;
                            result.error = err.message;
                            res.status(statusCode).send(result);
                            return
                        }
                        let {reviews, rating} = dets;
                        reviews+=1;
                        rating= parseFloat(((rating+req.body.rating)/reviews).toFixed(1));
                        dets.rating=rating;
                        dets.reviews=reviews

                        let nR = new Rating({
                            client:req.params.clientID,
                            cleaner: req.params.cleanerID,
                            rating:+req.body.rating,
                            review:req.body.review,
                        })

                        nR.save((error)=> {
                              if(err){
                            statusCode = 500;
                            result.statusCode = statusCode;
                            result.error = err.message;
                            res.status(statusCode).send(result);
                            return
                        }
                       dets.save((error)=> {
                              if(err){
                            statusCode = 500;
                            result.statusCode = statusCode;
                            result.error = err.message;
                            res.status(statusCode).send(result);
                            return
                        }

                        result.rating = nR;
                       res.status(statusCode).send(result);
                    })
                        })

        })
            })
        
    })


    api.get('/cleaner_details/:cleanerID', (req, res) => {
   let result =  {};
            let statusCode = 200;
        Cleaner.findOne({
            cleanerID: req.params.cleanerID
        })
        .exec((err, cleaner)=> {


               if(err){
                            statusCode = 500;
                            result.statusCode = statusCode;
                            result.error = err.message;
                            res.status(statusCode).send(result);
                            return
                        }
            Rating.find({
                cleaner: cleaner._id
            }).exec(
            (err, reviews)=> {


               if(err){
                            statusCode = 500;
                            result.statusCode = statusCode;
                            result.error = err.message;
                            res.status(statusCode).send(result);
                            return
                        }
                result.status(statusCode).json(reviews)

            })
        })
  
})
    return api;
}
