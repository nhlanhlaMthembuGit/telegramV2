var admin = require('firebase-admin')
var express = require('express');
var axios = require('axios');


var serviceAccount = require("./key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "//telegramv2-c6156.firebaseio.com/"
});

//get a database reference to the database

var db = admin.database();
var ref = db.ref("/");


var bb = require('bot-brother')
var bot = bb({
    key: '632216946:AAH0JL1223mNF-KC9q4VPP57hP-pxEmVqSg',
    sessionManager: bb.sessionManager.memory(),
    polling: { interval: 10, timeout: false }

})



//Processor Code///

//keyboard function

// let defaultKeyboard = null

// function startingKeyboard(menu) {
//     defaultKeyboard = menu
//     console.log('This is the keyboard function')
//     bot.keyboard(defaultKeyboard)

// }

// // get stored intent from processor, 'intent' command(retrieve existing user stored intent)


// bot.command('intent').invoke(function (ctx) {
//     return axios.get('http://0da912ca.ngrok.io/processor/v1/actionRequest')
//         .then((response) => {


//             startingKeyboard(response.data)
//             console.log('i am here')
//             console.log(response.data)

//         })
// })

//End////

// bot.command('start')
//     .invoke(function (ctx) {
        
//         ref.on("value", function(snapshot) {
//             console.log("In On value");
//      let userData = snapshot.val().userDetails;
     
//      _.forOwn(userData, function(value, key) { 
        
//         //console.log(value.Telegram_ID);
//             let exists = false;
//             //console.log(value.length)
//             if(value.Telegram_ID == ctx.meta.user.id)
//             {
//                 exists = true;
//                 console.log('user  exist')
//                   ctx.go('Bye');
                


//             }else{ 
//                 console.log('user dont exist')
//                   ctx.go('hi');
//             }

            
//      } );
     
//         }, function (errorObject) {
//             console.log("The read failed: " + errorObject.code);
     
//         });
//     })


//The greetings
bot.texts({
    hello: {
      world: {
        friend: 'Hello, <%=name%>!'
      }
    }
  });


  bot.texts({
      hello: {
          world: {
              friend: 'hello , <%=name%>!'
          }
      }
  })
 
  bot.command('hey').invoke(function (ctx) {
    ctx.data.name = ctx.meta.user.first_name;
    ctx.sendMessage('hello.world.friend');
    return ctx.go('hello')
  });


//Registration
bot.command('yello').invoke(function (ctx) {

    var option = {
        "parse_mode": "Markdown",
        "reply_markup": {
            "one_time_keyboard": true,
            "keyboard": [[{
                text: "My phone number",
                request_contact: true
            }], ["Cancel"]]
        }
    };
    bot.api.sendMessage(ctx.meta.chat.id, "Yello  " +ctx.meta.user.first_name + "  may you please register by entering your number", option)
    
   bot.sendChatAction = function (chatId, action) {
        var query = {
          chat_id: chatId,
          action: 'typing..'
        };
        console.log(action);
        return this._request('sendChatAction',option.action , {qs: query});
      };
    
    
}).answer(function (ctx) {

    //display user telegram ID
    console.log(ctx.meta.user.id)    
    //addUserdetails(ctx.message.contact.phone_number, ctx.meta.user.id, ctx.meta.user.first_name, ctx.meta.user.last_name);
    console.log(ctx.message.contact.phone_number);
    return ctx.go('hi')
});

//memory session (storing user Intent)

bot.command('hi')
    .invoke(function (ctx) {
        return ctx.sendMessage('Hey! ' + ctx.meta.user.first_name +', what would you like to do today?');
    })
    .answer(function (ctx) {
        ctx.session.memory = ctx.session.memory || '';
        ctx.session.memory += ctx.answer + ',';
        ctx.data.memory = ctx.session.memory;

        console.log(ctx.data.memory);
        console.log(ctx.meta);
       // addUserIntent(ctx.session.number, ctx.session.memory);
        return ctx.sendMessage('Thanks '+ ctx.meta.user.first_name+' , your selection has been captured');
        
    })

        .answer(function(ctx){
            return ctx.go('confirmation')
        });

//Confirmation
bot.command('confirmation')
.invoke(function (ctx) {
  return ctx.sendMessage('Would you like to do something else? '+ ctx.meta.user.first_name)
})
.keyboard([
  [{'yes': {go:'yes'}}],
  [{'No': {go: 'Bye'}}]
  
])

//bye commmand (closing a sessiom)

bot.command('bye').invoke(function (ctx) {
    return ctx.sendMessage('Bye ' + ctx.meta.user.first_name);
  });
 
 //Yes command (Existing user keyboard)
 bot.command('yes')
 .invoke(function (ctx) {
    return ctx.sendMessage('Would you like to do something else?' + ctx.meta.user.first_name)
 })
 .keyboard ([
    [{'Saved intent':{go:'hi'}}],
    [{'New Intent': {go: 'hi'}}],
    [{'Chitchat': {go: 'promo'}}]
 ])
 
.answer(function (ctx) {
  ctx.data.answer = ctx.answer;
  return ctx.sendMessage('Your answer is <%=answer%>');
});
bot.command('bye').invoke(function (ctx) {
    return ctx.sendMessage('Bye ' + ctx.meta.user.first_name);
  });

  //Chit-chat 
  bot.command('chitchat')
  .invoke(function(ctx){

      
      return ctx.sendMessage('Ayoba ' + ctx.meta.user.first_name)
  })

  bot.command('promo')
   .invoke(function(ctx) {
       return axios.get('http://7a0873c4.ngrok.io/processor/v1/promotions')
       .then((response) => {


           //console.log('i am here')
           console.log(response.data)
           ctx.sendMessage(response.data.advert)
           return ctx.go('chitchat');
       })

   })

//store users number and Telegram ID in FIRESTORE

// function addUserdetails(userId, name, firstName, lastName) {


//     // Add a new user
//     var itemsRef = ref.child("userDetails");
//     var newItemRef = itemsRef.push();
//     newItemRef.set({
//         "msidn": userId,
//         "Telegram_ID": name,
//         "First_name": firstName,
//         "Last_name": lastName
//     });

//     var itemId = newItemRef.key;
//     console.log("A new TODO item with ID " + itemId + " is created.");
//     return itemId;
// }

bot.command('check')
.invoke(function(ctx){
    // Attach an asynchronous callback to read the data at our posts reference
    ref.on("value", function(snapshot) {

        let data = snapshot.val().user_details

        console.log(data);

    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);

        //Get single value inside 
        // _.forEach(data, function(val) {
        //     console.log(val.Telegram_ID); 
        //   });

    });
    return ctx.sendMessage('i can read')
})


    // store users number and intent
bot.command('hit')
.invoke(function(ctx){
    let userData = {

        userData: ctx.message.contact.phone_number
    }
    //Send keyboard selection action to processor
    axios.post('http://0da912ca.ngrok.io/processor/v1/userIntents', userData)
        .then(function (response) {
            console.log(response.data);
 
        })
        .catch(function (error) {
 
        });
})
function addUserIntent(userId, userIntent) {

    


    var itemsRef = ref.child("userIntents");
    var newItemRef = itemsRef.push();
    newItemRef.set({
        "msidn": userId,
        "user Intent": userIntent,
        "intent Created Time": new Date().toString()
    });

    var itemId = newItemRef.key;
    console.log("userID and intent " + itemId + " is successfully created.");
    return itemId;
}

// posting data to the processor endpoint
bot.command('Kat')
.invoke(function(ctx){
     
    console.log('Sent to Kat')
    axios.get('http://516d0ec3.ngrok.io/processor/v1/userDetails/ '+ ctx.meta.user.id)
    .then(function (response) {
    console.log(response.data);

})
.catch(function (error) {
}); 
    return ctx.sendMessage('hi')
})

//Get menu from processor 
