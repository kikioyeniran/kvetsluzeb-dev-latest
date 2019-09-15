import { Router } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import { validateToken } from '../../utils';

//Bring in Cleaner Models
import Cleaner from '../../model/cleaner/cleaner';
import CleanerDetails from '../../model/cleaner/cleanerDetails';
import Rating from '../../model/Rating';
//Bring in Client Model
import ClientDetails from '../../model/client/clientDetails';

//Bring in Client Wallet Model
import ClientWallet from '../../model/client/clientWallet';


//Bring in Cleaner Wallet Model
import CleanerWallet from '../../model/cleaner/cleanerWallet';

//Bring in Cleaning Schedule Model
import CleaningSchedule from '../../model/cleaningSchedule';

import Requests from '../../model/booking/requests';



export default ({config, db}) =>{
    var api = Router();


    // **********************************************
    // ******* CLEANER PAYMENT REQUESTS *************
    // **********************************************
    api.get('/:scheduleID/:cleanerID/:clientID', (req,res)=>{
        var scheduleID = req.params.scheduleID;
        var cleanerID = req.params.cleanerID;
        var clientID = req.params.clientID;
        var result = {};
        var statusCode = 200;

        CleaningSchedule.findById(scheduleID, (err, schedule)=>{
            if(err){
                result.error = err;
                result.statusCode = 404;
                res.status(statusCode).send(result);
                // console.log(err)
            }
            else{
            var paymentUpdate = {};
            var totalCharge = schedule.totalCharge;
            var cleanerIncome = schedule.cleanerIncome;
            var dblastClean = schedule.lastClean[0];
            var dbcurrentClean = schedule.currentClean[0];
            var increment = schedule.currentClean[0].increment;
            var newCurrentDate = schedule.currentClean[0].nextCleanDate;
              var nextCleanDate = new Date().setDate(newCurrentDate.getDate() + increment);
            var nextCleanDate = new Date(nextCleanDate);
            var done = false
            if (increment === 0){
                done = true;
            }
          
          
            //console.log(dbcurrentClean.currentCleanDate);
            // console.log(newCurrentDate, ' ', nextCleanDate);
            var lastClean = [{
                cleanStatus : true,
                paidStatus : false,
                cancelStatus : true,
                lastCleanDate  : dbcurrentClean.currentCleanDate
            }];
            var currentClean = [{
                    cleanStatus : true,
                    paidStatus : false,
                    cancelStatus : true,
                    currentCleanDate  : newCurrentDate,
                    nextCleanDate: nextCleanDate,
                    increment: increment
            }]
            //console.log(lastClean, ' ', currentClean);
            paymentUpdate.lastClean = lastClean;
            paymentUpdate.currentClean = currentClean;
            paymentUpdate.done = done;
            var newLastCleanDate = dbcurrentClean.currentCleanDate;
            console.log(newLastCleanDate);
            var query = {_id: scheduleID};
            CleaningSchedule.updateOne(query, paymentUpdate, (err) =>{
                    if(err){
                        console.log(err);
                        res.status(500).json({
                            error: true,
                            message: err.message
                        })
                        return;
                    }else {
                        //console.log('Schedule Updated');
                        var queryWallet = {cleanerID : req.params.cleanerID}
                        Cleaner.findById(req.params.cleanerID, (err, cleaner)=>{
                            var CleanSpecID = cleaner.cleanerID;
                            // console.log(CleanSpecID);
                            var queryWallet2 = {cleanerID: CleanSpecID}
                            CleanerWallet.findOne((queryWallet2), (err, walvarFound)=>{
                                var walvar = {};
                                walvar.totalIncome = totalCharge + walvarFound. totalIncome;
                                walvar.expectedIncome = totalCharge;
                                CleanerWallet.updateOne(queryWallet, walvar, (err) =>{
                                    //console.log(clientID);
                                    var clientQuery = {clientID: clientID}
                                    ClientWallet.findOne((clientQuery),(err, clientFound)=>{
                                        CleanerDetails.findOne({
                                            cleanerID: CleanSpecID
                                        }).exec((err, cl)=> {



    var clientWallet = {};
                                        var pendingPay = {
                                            cleanDate: newLastCleanDate,
                                            cleanerID: cleanerID,
                                            cost: totalCharge,
                                            cleaner: cl
                                        }
                                        clientWallet.totalPaid = totalCharge + clientFound.totalPaid;
                                        clientWallet.pendingPay = pendingPay;
                                        ClientWallet.updateOne(clientQuery, clientWallet,(err)=>{
                                            if(err){
                                                result.error = err;
                                                result.statusCode = 404;
                                                res.status(statusCode).send(result);
                                            }else {
                                                //console.log('walvar found and updated');
                                                //req.flash('success', 'Account Updated');
                                                var message = 'Successful please redirect to User dashboard'

                                                result.error = err;
                                                result.statusCode = statusCode;
                                                result.message = message
                                                res.status(statusCode).send(result);
                                                // res.redirect('/cleaner/dashboard/cleaner_calendar/'+cleanerID);
                                            }
                                        })
                                    })

                                        })
                                    
                                });
                            })
                        })


                    }
                });
            }
        });
    })

    // **********************************************
    // ******* CLEANER WALLET DETAILS ***************
    // **********************************************
    // For Editing the cleaner walvar details on the dahboard
    api.post('/walvar/:cleanerID', validateToken, (req, res) =>{
        //console.log('code is here');
        var result = {};
        var statusCode = 200;
        var walvar = {};
        walvar.acctName = req.body.acctName;
        walvar.swiftCode = req.body.swiftCode;
        walvar.IBAN = req.body.IBAN;

        var query = {cleanerID : req.params.cleanerID}

        CleanerWallet.updateOne(query, walvar, (err, walvar) =>{
            var result = {};
            var statusCode = 200;
            if(err){
                statusCode = 500;
                result.status = statusCode;
                result.error = err;
                res.status(statusCode).send(result);
            }else {
                // console.log('walvar and updated');
                var message = 'Wallet update Successful';
                result.message = message ;
                result.status = statusCode;
                res.status(statusCode).send(result);
                //req.flash('success', 'Account Updated');
                // res.redirect('/cleaner/dashboard/walvar/'+req.params.id);
            }
        });
    });

  //Edit Request and create schedule Process done
  api.get('/confirm/:clientID/:cleanerID/:requestID', (req, res) =>{
   
    var clientID = req.params.clientID;
    var cleanerID = req.params.cleanerID;
    var requestID = req.params.requestID;
    var result = {};
    var statusCode = 200;


    var request = {};
    request.status = true;
    request.confirmedCleanerID = cleanerID;
    request
    var query = {_id : requestID};
    Requests.updateOne(query, request, (err) =>{
        if(err){
            result.error = err;
            result.statusCode = 400;
            console.log(err)
            res.status(statusCode).send(result);
        }else {
                // console.log('found and upda
            //req.flash('success', 'Account Updated');
           var query2 = {_id: requestID}

            Requests.find((query2), (err, clientRequest)=>{
                  //  console.log(clientRequest, query2)
                if(err){
                    console.log(err)
                }else {
                    //console.log(clientRequest[0].cleanerID)
                    var dateFirstClean = clientRequest[0].dateFirstClean;

                    var frequency = clientRequest[0].frequency;
                    var increment = 0;

                    if(frequency == "weekly"){
                        var nextCleanDate = new Date().setDate(dateFirstClean.getDate() + 7);
                        var nextCleanDate = new Date(nextCleanDate);
                        var followingDate = new Date().setDate(nextCleanDate.getDate() + 7);
                        var followingDate = new Date(followingDate);
                        var increment = 7;
                        //console.log(nextCleanDate);
                    }
                    if(frequency == "fortnightly"){
                        var nextCleanDate = new Date().setDate(dateFirstClean.getDate() + 14);
                        var nextCleanDate = new Date(nextCleanDate);
                        var followingDate = new Date().setDate(nextCleanDate.getDate() + 14);
                        var followingDate = new Date(followingDate);
                        var increment = 14;
                        //console.log(nextCleanDate);
                    }
                    if(frequency == "one-off"){
                        var nextCleanDate = new Date(dateFirstClean);
                        var increment = 0;
                        //console.log(nextCleanDate);
                    }
                    Cleaner.findById(cleanerID, (err, cleanerDetail)=>{

                        //console.log(cleanerDetail.cleanerID);
                        query = {cleanerID: cleanerDetail.cleanerID}
                        CleanerDetails.findOne((query), (err, newCleaner)=>{
                            var cleanerCharge = newCleaner.income;
                            var hours = clientRequest[0].hours
                            if(hours == "more"){
                                var hourCost = parseFloat(client.Request[0].moreHours);
                            }else{
                                var hourCost = parseFloat(clientRequest[0].hours);
                            }
                            var extraTasks = /,/.test(clientRequest[0].extraTasks[0])?clientRequest[0].extraTasks[0]:clientRequest[0].extraTasks ;
                            var result =Array.isArray(extraTasks)? extraTasks: extraTasks.split(",");
                            var extraTaskCost = result.length;
                            if(extraTaskCost <=2){
                                hourCost = hourCost + 0.5;
                            }
                            if(extraTaskCost >2){
                                hourCost = hourCost + 1;
                            }
                            var cleanerIncome = newCleaner.income * hourCost;
                            query2 = {clientID: req.params.clientID};
                            ClientDetails.findOne((query2) , (err, clientDetails)=>{
                                //console.log(req.params.clientID, ' + ', clientDetails);
                                var clientID = clientDetails._id
                                var newSchedule = new CleaningSchedule({
                                    clientDetails: clientID,
                                    clientName: clientDetails.clientName,
                                    cleanerID: cleanerID,
                                    dateFirstClean: dateFirstClean,
                                    currentClean:[
                                        {
                                            currentCleanDate: dateFirstClean,
                                            nextCleanDate: nextCleanDate,
                                            increment: increment
                                        }
                                    ],
                                    extraTasks: extraTasks,
                                    cleanerIncome: cleanerCharge,
                                    totalHours: hourCost,
                                    totalCharge: cleanerIncome
                                });
                                newSchedule.save((err)=>{
                                    if(err){
                                         console.log(err)
                                        result.error = err;
                                        result.statusCode = 400;
                                        res.status(statusCode).send(err.message);
                                        return
                                    }else{
                                        var message = 'Cleaning Request Accepted'
                                        result.message = message ;
                                        result.statusCode = 200;
                                        console.log( newSchedule)

                                        res.status(statusCode).send(result);

                                        //console.log(cleanerID);

                                        // TODO: Ask Sir KIKI what this next line is for
                                        // res.redirect('/cleaner/dashboard/cleaner_calendar/'+encodeURIComponent(req.params.cleanerID));
                                    }
                                })
                            })
                        });
                    });
                }
            });
        }
    });


 });



 
 api.get('/cleaner-schedule/:id', validateToken, (req, res) =>{
        
            //console.log(req.params.id);
            var result =  {};
            var statusCode = 200;
          
                var query2 = {_id: req.params.id};
                CleaningSchedule
                    .findOne(query2)
                    .populate('clientDetails')
                    .exec((err, schedule)=>{
                        if(err){
                            statusCode = 400;
                            result.statusCode = statusCode;
                            result.error = err;
                            res.status(statusCode).send(result);
                        }else{
                            // console.log(schedule[0].clientDetails.length);
                            //console.log(Object.keys(schedule));
                        
                                 res.status(statusCode).send(schedule);
                           
                        }

                });
            });
 
            

api.get('/rating/:cleanerID', (req, res)=> {
   var result =  {};
            var statusCode = 200;
    Rating.find({cleaner: req.params.cleanerID})
    .populate('client')
    .exec((err, schedule)=>{
                        if(err){
                            statusCode = 400;
                            result.statusCode = statusCode;
                            result.error = err;
                            console.log(err)
                            res.status(statusCode).send(result);
                        }else{
                            // console.log(schedule[0].clientDetails.length);
                            //console.log(Object.keys(schedule));
                        
                                 res.status(statusCode).send(schedule);
                           
                        }

                });


})
    
    return api;
}
