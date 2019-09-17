import {
  Router
} from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import empty from 'is-empty';
import {
  validateToken
} from '../../utils';

import config from '../../config';
import uuid from 'uuid';
import Booking from '../../model/booking/requests';
//
const mailgun = require("mailgun-js");
const DOMAIN = 'kvetsluzeb.com';
const api_key = '3896a986c536ba4c44b6278b43417c4a-2ae2c6f3-9188bee6';
const mg = mailgun({
  apiKey: api_key,
  domain: DOMAIN,
  host: 'api.eu.mailgun.net'
});



import Client from '../../model/client/client';
import ClientDetails from '../../model/client/clientDetails';
import ClientWallet from '../../model/client/clientWallet';

import Cleaner from '../../model/cleaner/cleaner';
import CleanerDetails from '../../model/cleaner/cleanerDetails';
let AllTransactions =  require('../../model/allTransactions');

export default ({
  config,
  db
}) => {
  let api = Router();

  // **************************************************************
  // ******* CLIENT AUTHENTICATION COUPLED WITH BOOKING ***********
  // **************************************************************

  //Booking and Sign up Processes
  // /api/v1/client/account/signup
  // /api/v1/client/account/signup --> working
  api.post('/signup', (req, res) => {
    // console.log('form submitted');

    const storage = multer.diskStorage({
      destination: './public/uploads/',
      filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
      }
    });

    function checkFileType(files, cb) {
      // Allowed ext
      const filetypes = /jpeg|jpg|png|gif/;
      // Check ext
      const extname = filetypes.test(path.extname(files.originalname).toLowerCase());
      // Check mime
      const mimetype = filetypes.test(files.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb('Error: Images and Documents Only!');
      }
    }
    // Initialise Upload
    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 10000000
      },
      fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
      }
    }).single('profilePic')

    let statusCode = 200;
    let result = {};

    upload(req, res, (err) => {

      if (err) {
        statusCode = 501;
        let error = err;
        result.status = status;
        result.error = error;
        res.status(statusCode).send(result);
      } else {
        // const username = req.body.username.toLowerCase();
        const email = req.body.email.toLowerCase();
        const password = req.body.password;
        const password2 = req.body.password2;

        const postcode = req.body.postcode;
        const bedrooms = req.body.bedrooms;
        const bathrooms = req.body.bathrooms;
        const extraTasks = req.body.extraTasks;
        const hours = req.body.hours;
        const more_hours = req.body.more_hours;
        const priority = req.body.priority;
        const access_type = req.body.access_type;
        const keySafePin = req.body.keySafePin;
        const keyHiddenPin = req.body.keyHiddenPin;
        const schedule = req.body.schedule;
        const date = req.body.date;
        const fullName = req.body.fullname;
        const mobileNumber =req.body.mobilenumber? req.body.mobilenumber.replace('+', ''): 600;
        const address = req.body.address||'gee';
        const city = req.body.city||'lol';
        const country = req.body.country||'joy';
        const profilePic = req.file.filename||'oh';
        let clientID = uuid();
        console.log(clientID);

        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('password2', 'Passwords do not match').equals(req.body.password);


        req.checkBody('postcode', 'Postcode is required').notEmpty();
      
        
      // req.checkBody('schedule', 'Schedule is required').notEmpty();
        req.checkBody('fullname', 'Your Full Name  is not valid').notEmpty();
        req.checkBody('mobilenumber', 'Mobile Number is required').notEmpty();
        req.checkBody('address', 'Addresss is required').notEmpty();
        req.checkBody('city', 'City is required').notEmpty();
        req.checkBody('country', 'Country is required').notEmpty();

        let errors = false
 //req.validationErrors();

        if (errors) {

          statusCode = 401;
          let error = errors;
          result.status = statusCode;
          result.error = error;
          res.status(statusCode).send(result);

        } else {
          let newUser = new Client({
            email: email,
            password: password,
            clientID: clientID
          });
          let newUserDetails = new ClientDetails({
            postcode: postcode,
          //         cleaningFrequency: schedule,
            mobileNumber: mobileNumber,
            address: address,
            fullName: fullName,
            city: city,
            country: country,
            profilePic: profilePic,
            clientID: clientID
          });
          let newWallet = new ClientWallet({
            clientID: clientID
          })

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) {
                statusCode = 404;
                let error = err;
                result.status = status;
                result.error = error;
                res.status(statusCode).send(result);
                // console.log(err);
              }
              //console.log('bcrypt stage reached');
              newUser.password = hash;
              newUser.save((err) => {
                if (err) {
                  statusCode = 502
                  let error = err;
                  result.status = statusCode;
                  result.error = error;
                  res.status(statusCode).send(result);
                } else {

                  newUserDetails.save((err) => {
                    if (err) {
                      statusCode = 409;
                      let error = err;
                      result.status = statusCode;
                      result.error = error;
                      res.status(statusCode).send(result);
                    } else {
                      newWallet.save((err) => {
                        if (err) {
                          statusCode = 409;
                          let error = err;
                          result.status = statusCode;
                          result.error = error;
                          res.status(statusCode).send(result);
                        } else {
                          statusCode = 200;
                          result.status = statusCode;
                          result.message = 'Client added';
                          result.userID = clientID
                          res.status(statusCode).send(result);
                        }
                      })
                    }
                  });

                }
              })
            });
          });

        }
      }
    })
  });


  // /api/v1/client/account/login --> working
  api.post('/login', (req, res) => {
    const {
      email,
      password
    } = req.body;

    let result = {};
    let status = 200;

    Client.findOne({
      email
    }, (err, user) => {
      if (!err && user) {
        bcrypt.compare(password, user.password).then(match => {
          if (match) {
            status = 200;

            const payload = {
              _id: user._id
            };
            const options = {
              expiresIn: '2000d',
              issuer: 'http://relicinnova.com.ng'
            };
            const secret = config.secret;
            const token = jwt.sign(payload, secret, options);

            result.token = token;
            result.status = status;
            result.result = user;
          } else {
            status = 404;
            result.status = status;
            result.error = `Incorrect email or password`;
          }
          res.status(status).send(result);;
        }).catch(err => {
          status = 500;
          result.status = status;
          result.error = err;
          res.status(status).send(result);
        });
      } else {
        status = 404;
        result.status = status;
        result.error = err;
        res.status(status).send(result);
      }
    })
  });

  // /api/v1/client/account/resetPassword/:token
  api.patch('/resetPassword/:token', (req, res) => {

    // get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    // const user =
    Client.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: Date.now()
      }
    }, (err, user) => {
      if (err) {
        res.status(404).send(err);
      }

      user.password = req.body.password
      user.password2 = req.body.password2
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      user.save(err => {
        if (err) {
          res.status(200).send(err);
        }
        res.status(201).json({
          message: 'Successful'
        })
      })
      //  Redirect the user to login
    });
    // if token has not expired and user exists we set the new password
  })

  // // /api/v1/client/account/passwordUpdate/:id
  // api.patch('/passwordUpdate/:id', validateToken, (req, res) => {
  //   // get user from collection
  //   Client.findById(req.id, (err, user) => {
  //     if (err) {
  //       res.send(err);
  //     } else if (!(user.correctPassword(req.body.passwordCurrent, user.password))) {
  //       res.status(404).send('Your current password is wrong.')
  //     }
  //   })
  //   user.password = req.body.password;
  //   user.passwordConfirm = req.body.passwordConfirm;
  //
  //   user.save(err => {
  //     if (err) {
  //       res.status(404).send(err);
  //     }
  //     res.status(201).json({
  //       message: 'Password Update Successfull'
  //     })
  //   })
  // })

  // /api/v1/client/account/forgotPassword --> working
  api.post('/forgotPassword', (req, res) => {
    // get user based on posted email
    Client.findOne({
      email: req.body.email
    }, (err, user) => {

      let status = 200;
      let result = {};

      // console.log(req.body.email);
      if (err) {
        status = 404;
        result.status = status;
        result.error = err;
        res.status(status).send(result);
      }
      // generate random token

      const resetToken = user.createPasswordResetToken();
      // await user.save()
      user.save({
        validateBeforeSave: false
      })

      const resetUrl = `${req.protocol}://${req.get('host')}/client/pswd/resetpswd/${resetToken}`
      const msg = `<strong>Forgot Password?</strong> Please click this link and enter your new password: ${resetUrl}.\n If you didnt forget your password, please ignore this email!`
      var data = {
        from: 'Kvet Sluzeb (Bloom Services) <support@kvetsluzeb.com>',
        to: req.body.email,
        subject: 'Password Reset Token',
        text: msg,
        html: msg
      };
      mg.messages().send(data, function(error, body) {
        if (error) {
          // console.log(error)
          status = 404;
          result.status = status;
          result.error = error;
          // result.message = ''
          res.status(status).send(result);
          //   res.render('client/forgotpswd', {
          //     clientID: user._id,
          //     message: 'Please make sure you entered the right password'
          // })
        } else {
          status = 200;
          result.status = status;
          result.message = 'The password reset token has been sent to your mail';
          // result.message = ''
          res.status(status).send(result);
        }
      });
    })
  })




 api.get('/dashboard/:id', validateToken,(req, res)=>{
  let result = {}, statusCode=200, accepted = false;
    Client.findById(req.params.id, function (err, client){
    let query  = {clientID: client.clientID};
       Booking.find(query
    , (err, request)=> {
      if(!request[0]){
          result.status = 400;
                    result.request = null;
                    res.status(200).send(result);
                    return
      }
           if (err) {
                statusCode = 400;
                    result.status = statusCode;
                    result.error = err;
                    res.status(statusCode).send(result);
                    return
                }

                if(request[0].status == false){
                    result.accepted = accepted;
            result.statusCode = statusCode;
            result.user = client;//_details[0];
                result.request = request[0];
            res.status(statusCode).send(result);


                }



   accepted = true;
            var cleanerID = request[0].confirmedCleanerID

            var queryClean = {_id: cleanerID};
            Cleaner.findOne(queryClean, (err, cleaner)=> {
queryClean={
  cleanerID:cleaner.cleanerID
}
           CleanerDetails.findOne(queryClean, function(err, cleaner_details){
                if (err) {
                statusCode = 400;
                    result.status = statusCode;
                    result.error = err;
                    res.status(statusCode).send(result);
                    return
                }
              result.accepted = accepted;
              result.cleaner = cleaner_details;
              result.statusCode = statusCode;
              result.request = request[0];
              result.user = client;
              res.status(statusCode).send(result);



            })


            })
 

              })
    })
 })




//
  // /api/v1/client/account/passwordChange/:id --> working
  api.post('/passwordChange/:id', validateToken, (req, res) => {
    // get user from collection
    Client.findById(req.params.id, (err, user) => {
      let result = {};
      let status = 200;
      if (err) {
        status = 404;
        result.status = status;
        result.error = err;
        res.status(status).send(result);
        return;
      } else {
        //Check Old Password
        bcrypt.compare(req.body.passwordCurrent, user.password, (err, match) => {
          if (!match) {
            status = 400;
            result.status = status;
            result.message = 'Your current password is incorrect. Please try again';
            res.status(status).send(result);
          } else {
            //Password Match
            var password = req.body.password;
            var passwordConfirm = req.body.passwordConfirm;
            // console.log(password, passwordConfirm);
            req.checkBody('password', 'Password is required').notEmpty();
            req.checkBody('passwordConfirm', 'Passwords do not match').equals(req.body.password);
            let errors = req.validationErrors();

            if (errors) {
              status = 400;
              result.status = status;
              result.error = errors;
              res.status(status).send(result);

              return;
            } else {
              user.password = password;
              // user.passwordConfirm = passwordConfirm;
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(user.password, salt, (err, hash) => {
                  if (err) {
                    status = 500;
                    result.status = status;
                    result.error = err;
                    res.status(status).send(result);
                  }
                  user.password = hash;
                  user.save((err) => {
                    if (err) {
                      status = 400;
                      result.status = status;
                      result.error = err;
                      res.status(status).send(result);
                    } else {
                      status = 201

                      ;
                      result.status = status;
                      result.message = 'Password updated Successfully';
                      res.status(status).send(result);
                    }
                  })
                });
              });
            }
          }
        });
      }
    })
  })


  // '/api/v1/client/account/logout' --> not working
  api.get('/logout', (req, res) => {
    res.logout();
    let result = {};
    let status = 201;
    let message = 'Successfully Logged out';
    result.status = status;
    result.message = message;
    res.status(status).send(result);
  });


  // ********************************************
  // ******* CLEANER PROFILE SETTINGS ***********
  // ********************************************

  // /api/v1/client/account/profile/:clientID/:id --> working
  api.post('/profile/:clientID/:id', validateToken, (req, res) => {
    let statusCode = 200;
    let result = {};

    let client = {};
    client.fullName = req.body.fullName;
    console.log(req.body.fullName);
    client.postcode = req.body.postcode;
    client.city = req.body.city;
    client.country = req.body.country;
    client.address = req.body.address;
    client.mobileNumber = req.body.mobileNumber;
    let query = {
      clientID: req.params.clientID
    }
    console.log(query);
    console.log(req.params.clientID)

    ClientDetails.updateOne(query, client, (err) => {
      if (err) {
        result.statusCode = 401;
        result.error = err;
        res.status(statusCode).send(result);
      } else {
        result.statusCode = statusCode;
        result.message = 'found and updated';
        res.status(statusCode).send(result);
        // res.redirect('/client/dashboard/home/'+req.params.id);
      }
    });
  });

  // ************************************
  // ******* CLIENT DARSHBOARD ***********
  // *************************************

  // /api/v1/client/account/home/:id  --> working
  api.get('/home/:id', validateToken, (req, res) => {
    Client.findById(req.params.id, (err, client) => {

      
      //console.log(client)
      var query = {
        clientID: client.clientID
      };
      ClientDetails.find((query), (err, client_details) => {
        let result = {};
        let statusCode = 201;

        if (err) {
          result.status = 404;
          result.error = err;
          res.status(statusCode).send(result);
        }
        result.statusCode = statusCode;
        result.user = client_details[0];
        res.status(statusCode).send(result);
      });
    });
  });


  // /api/v1/client/account/wallet/:id --> working
  api.get('/wallet/:id', validateToken, (req, res) => {
    Client.findById(req.params.id, (err, client) => {
      //console.log(client)
      let result = {};
      let statusCode = 200;

      var query = {
        clientID: client.clientID
      };
      ClientDetails.find((query), (err, client_details) => {
        //console.log(client_details[0]);
        ClientWallet.findOne((query), (err, clientWallet) => {
          var pending;
          var costStatus = false;
          if (empty(clientWallet.pendingPay)) {
            costStatus = true;
            pending = true;
            console.log('pending pay is empty')
          } else {
            if (empty(clientWallet.pendingPay[0].cost)) {
              costStatus = true;
              //pending = false;
              console.log('cost Status is empty')
            }
            pending = false;
            //costStatus = false;
            console.log('pending pay is not empty ', clientWallet.pendingPay[0].cost, ' ', costStatus)
          }




          result.statusCode = statusCode;
          result.user = client;
          result.wallet = clientWallet;
          result.costStatus = costStatus;
          result.pending = pending;
          result.stripeKey = uuid()
          result.userDetails = client_details[0];
          // result.wallet = wallet;
          result.StripePublishableKey =uuid();
          res.status(statusCode).send(result);
              })
      });
    });
  });

  // /api/v1/client/account/transactions/:id --> working
  api.get('/transactions/:id', validateToken, (req, res) => {
    Client.findById(req.params.id, (err, client) => {
      //console.log(client)
      let result = {};
      let statusCode = 200;

      var query = {
        clientID: client.clientID
      };
      ClientDetails.find((query), (err, client_details) => {
        //console.log(client_details[0]);
        AllTransactions.find((query), (err, transactions) => {
          var noTransaction = false;
          if (empty(transactions)) {
            noTransaction = true;
          }

          result.statusCode = statusCode;
          result.user = client;
          result.userDetails = client_details[0];
          result.transactions = transactions
          result.transactionStatus = noTransaction;
         // console.log(transactions,result);
          res.status(statusCode).send(result);
       

        })
      });
    });
  });


  // /api/v1/client/account/clientFaq/:id --> working
  api.get('/clientFaq/:id', validateToken,  (req, res) => {
    Client.findById(req.params.id, (err, client) => {
      //console.log(client)

      var query = {
        clientID: client.clientID
      };
      ClientDetails.find((query), (err, client_details) => {
        //console.log(client_details[0]);
        let result = {};
        let statusCode = 200;
        if (err) {
          statusCode = 400;
          result.statusCode = statusCode;
          result.error = err;
          res.status(statusCode).send(result);
        }
        result.user = client;
        result.userDetails = client_details[0];
        result.statusCode = statusCode;
        res.status(statusCode).send(result);
      });
    });
  });


  // /api/v1/client/account/renew/:id  --> working
  api.get('/renew/:id', validateToken, (req, res) => {
  Client.findById(req.params.id, (err, client) =>{
    let result = {};
    let statusCode = 200;
    if (err) {
      let statusCode  = 404;
      result.error = err;
      result.status = statusCode;
      res.status(statusCode).send(result)
    }
    let  query = {clientID: client.clientID};
    ClientDetails.find((query), (err, client_details) =>{
      if (err) {
        let statusCode = 404;
        result.error = err;
        result.status = statusCode;
        res.status(statusCode).send(result);
      }
      result.message = 'Successfully implemented this route';
      result.user = client;
      result.userDetails = client_details[0];
      result.status = statusCode;
      res.status(statusCode).send(result);
    })
  })
})



  return api;
}
