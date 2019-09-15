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
    let api = Router();


    // **********************************************
    // ******* CLEANER PAYMENT REQUESTS *************
    // **********************************************
    api.get('/:scheduleID/:cleanerID/:clientID', (req,res)=>{
        let scheduleID = req.params.scheduleID;
        let cleanerID = req.params.cleanerID;
        let clientID = req.params.clientID;
        let result = {};
        let statusCode = 200;

        CleaningSchedule.findById(scheduleID, (err, schedule)=>{
            if(err){
                result.error = err;
                result.statusCode = 404;
                res.status(statusCode).send(result);
                // console.log(err)
            }
            else{
            let paymentUpdate = {};
            let totalCharge = schedule.totalCharge;
            let cleanerIncome = schedule.cleanerIncome;
            let dblastClean = schedule.lastClean[0];
            let dbcurrentClean = schedule.currentClean[0];
            let increment = schedule.currentClean[0].increment;
            let newCurrentDate = schedule.currentClean[0].nextCleanDate;
              let nextCleanDate = new Date().setDate(newCurrentDate.getDate() + increment);
            let nextCleanDate = new Date(nextCleanDate);
            let done = false
            if (increment === 0){
                done = true;
            }
          
          
            //console.log(dbcurrentClean.currentCleanDate);
            // console.log(newCurrentDate, ' ', nextCleanDate);
            let lastClean = [{
                cleanStatus : true,
                paidStatus : false,
                cancelStatus : true,
                lastCleanDate  : dbcurrentClean.currentCleanDate
            }];
            let currentClean = [{
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
            let newLastCleanDate = dbcurrentClean.currentCleanDate;
            console.log(newLastCleanDate);
            let query = {_id: scheduleID};
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
                        let queryWallet = {cleanerID : req.params.cleanerID}
                        Cleaner.findById(req.params.cleanerID, (err, cleaner)=>{
                            let CleanSpecID = cleaner.cleanerID;
                            // console.log(CleanSpecID);
                            let queryWallet2 = {cleanerID: CleanSpecID}
                            CleanerWallet.findOne((queryWallet2), (err, walletFound)=>{
                                let wallet = {};
                                wallet.totalIncome = totalCharge + walletFound. totalIncome;
                                wallet.expectedIncome = totalCharge;
                                CleanerWallet.updateOne(queryWallet, wallet, (err) =>{
                                    //console.log(clientID);
                                    let clientQuery = {clientID: clientID}
                                    ClientWallet.findOne((clientQuery),(err, clientFound)=>{
                                        let clientWallet = {};
                                        let pendingPay = {
                                            cleanDate: newLastCleanDate,
                                            cleanerID: cleanerID,
                                            cost: totalCharge
                                        }
                                        clientWallet.totalPaid = totalCharge + clientFound.totalPaid;
                                        clientWallet.pendingPay = pendingPay;
                                        ClientWallet.updateOne(clientQuery, clientWallet,(err)=>{
                                            if(err){
                                                result.error = err;
                                                result.statusCode = 404;
                                                res.status(statusCode).send(result);
                                            }else {
                                                //console.log('wallet found and updated');
                                                //req.flash('success', 'Account Updated');
                                                let message = 'Successful please redirect to User dashboard'

                                                result.error = err;
                                                result.statusCode = statusCode;
                                                result.message = message
                                                res.status(statusCode).send(result);
                                                // res.redirect('/cleaner/dashboard/cleaner_calendar/'+cleanerID);
                                            }
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
    // For Editing the cleaner wallet details on the dahboard
    api.post('/wallet/:cleanerID', validateToken, (req, res) =>{
        //console.log('code is here');
        let result = {};
        let statusCode = 200;
        let wallet = {};
        wallet.acctName = req.body.acctName;
        wallet.swiftCode = req.body.swiftCode;
        wallet.IBAN = req.body.IBAN;

        let query = {cleanerID : req.params.cleanerID}

        CleanerWallet.updateOne(query, wallet, (err, wallet) =>{
            let result = {};
            let statusCode = 200;
            if(err){
                statusCode = 500;
                result.status = statusCode;
                result.error = err;
                res.status(statusCode).send(result);
            }else {
                // console.log('wallet and updated');
                let message = 'Wallet update Successful';
                result.message = message ;
                result.status = statusCode;
                res.status(statusCode).send(result);
                //req.flash('success', 'Account Updated');
                // res.redirect('/cleaner/dashboard/wallet/'+req.params.id);
            }
        });
    });

  //Edit Request and create schedule Process done
  api.get('/confirm/:clientID/:cleanerID/:requestID', (req, res) =>{
   
    let clientID = req.params.clientID;
    let cleanerID = req.params.cleanerID;
    let requestID = req.params.requestID;
    let result = {};
    let statusCode = 200;


    let request = {};
    request.status = true;
    request.confirmedCleanerID = cleanerID;
    request
    let query = {_id : requestID};
    Requests.updateOne(query, request, (err) =>{
        if(err){
            result.error = err;
            result.statusCode = 400;
            console.log(err)
            res.status(statusCode).send(result);
        }else {
                // console.log('found and upda
            //req.flash('success', 'Account Updated');
           let query2 = {_id: requestID}

            Requests.find((query2), (err, clientRequest)=>{
                  //  console.log(clientRequest, query2)
                if(err){
                    console.log(err)
                }else {
                    //console.log(clientRequest[0].cleanerID)
                    let dateFirstClean = clientRequest[0].dateFirstClean;

                    let frequency = clientRequest[0].frequency;
                    let increment = 0;

                    if(frequency == "weekly"){
                        let nextCleanDate = new Date().setDate(dateFirstClean.getDate() + 7);
                        let nextCleanDate = new Date(nextCleanDate);
                        let followingDate = new Date().setDate(nextCleanDate.getDate() + 7);
                        let followingDate = new Date(followingDate);
                        let increment = 7;
                        //console.log(nextCleanDate);
                    }
                    if(frequency == "fortnightly"){
                        let nextCleanDate = new Date().setDate(dateFirstClean.getDate() + 14);
                        let nextCleanDate = new Date(nextCleanDate);
                        let followingDate = new Date().setDate(nextCleanDate.getDate() + 14);
                        let followingDate = new Date(followingDate);
                        let increment = 14;
                        //console.log(nextCleanDate);
                    }
                    if(frequency == "one-off"){
                        let nextCleanDate = new Date(dateFirstClean);
                        let increment = 0;
                        //console.log(nextCleanDate);
                    }
                    Cleaner.findById(cleanerID, (err, cleanerDetail)=>{

                        //console.log(cleanerDetail.cleanerID);
                        query = {cleanerID: cleanerDetail.cleanerID}
                        CleanerDetails.findOne((query), (err, newCleaner)=>{
                            let cleanerCharge = newCleaner.income;
                            let hours = clientRequest[0].hours
                            if(hours == "more"){
                                let hourCost = parseFloat(client.Request[0].moreHours);
                            }else{
                                let hourCost = parseFloat(clientRequest[0].hours);
                            }
                            let extraTasks = /,/.test(clientRequest[0].extraTasks[0])?clientRequest[0].extraTasks[0]:clientRequest[0].extraTasks ;
                            let result =Array.isArray(extraTasks)? extraTasks: extraTasks.split(",");
                            let extraTaskCost = result.length;
                            if(extraTaskCost <=2){
                                hourCost = hourCost + 0.5;
                            }
                            if(extraTaskCost >2){
                                hourCost = hourCost + 1;
                            }
                            let cleanerIncome = newCleaner.income * hourCost;
                            query2 = {clientID: req.params.clientID};
                            ClientDetails.findOne((query2) , (err, clientDetails)=>{
                                //console.log(req.params.clientID, ' + ', clientDetails);
                                let clientID = clientDetails._id
                                let newSchedule = new CleaningSchedule({
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
                                        let message = 'Cleaning Request Accepted'
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
            let result =  {};
            let statusCode = 200;
          
                let query2 = {_id: req.params.id};
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
   let result =  {};
            let statusCode = 200;
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
