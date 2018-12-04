var admin = require('firebase-admin')
var express = require('express');

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

// //keyboard function

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

///End////

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
bot.command('hello').invoke(function (ctx) {
    return ctx.sendMessage('May you please enter your number?' );
}).answer(function (ctx) {

    // Sets user answer to session.number
    ctx.session.number = ctx.answer;


    //display user telegram ID
    console.log(ctx.meta.user.id)
   //console.log(ctx.session.number);
   
    addUserdetails(ctx.session.number, ctx.meta.user.id, ctx.meta.user.first_name, ctx.meta.user.last_name); 
    console.log(ctx.session.number);
    return ctx.go('hi')
});

//Confirmation
bot.command('validate')
.invoke(function (ctx) {
  return ctx.sendMessage('Hello')
})
.keyboard([
  [{'yes': {go:'hey'}}],
  [{'No': {go: 'Bye'}}]
  
])

//bye commmand (closing a sessiom)

bot.command('bye').invoke(function (ctx) {
    return ctx.sendMessage('Bye ' + ctx.meta.user.first_name);
  });
 
 //Yes command (Existing user keyboard)
 bot.command('yes')
 .invoke(function (ctx) {
    return ctx.sendMessage('Would you like to do something else?')
 })
 .keyboard ([
    [{'saved intent':{value:'ctx.session.number'}}],
    [{'else': {go: 'hi'}}]
 ])
 
.answer(function (ctx) {
  ctx.data.answer = ctx.answer;
  return ctx.sendMessage('Your answer is <%=answer%>');
});
bot.command('bye').invoke(function (ctx) {
    return ctx.sendMessage('Bye ' + ctx.meta.user.first_name);
  });

//store users number and Telegram ID in FIRESTORE

function addUserdetails(userId, name, firstName, lastName) {


    // Add a new user
    var itemsRef = ref.child("user_details");
    var newItemRef = itemsRef.push();
    newItemRef.set({
        "msidn": userId,
        "Telegram_ID": name,
        "First_name": firstName,
        "Last_name": lastName
    });

    var itemId = newItemRef.key;
    console.log("A new TODO item with ID " + itemId + " is created.");
    return itemId;
}

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



//memory session (storing user Intent)

bot.command('hi')
    .invoke(function (ctx) {
        return ctx.sendMessage('Hey! teach me your intent ?');
    })
    .answer(function (ctx) {
        ctx.session.memory = ctx.session.memory || '';
        ctx.session.memory += ctx.answer + ',';
        ctx.data.memory = ctx.session.memory;

        console.log(ctx.data.memory);
        console.log(ctx.meta.user.id);
        addUserIntent(ctx.session.number, ctx.session.memory);
        return ctx.sendMessage('Thanks, your intent has been captured');

        
    })

        .answer(function(ctx){
            return ctx.go('validate')
        });

    // store users number and intent

function addUserIntent(userId, userIntent) {

    
    var itemsRef = ref.child("users_intent ");
    var newItemRef = itemsRef.push();
    newItemRef.set({
        "msidn": userId,
        "user Intent": userIntent,
        "intent Created Time": new Date().toString()
    });

         //posting data to the processor endpoint
    // axios.post('http://0da912ca.ngrok.io/processor/v1/actionRequest', userData)
    // .then(function (response) {
    //     console.log(response.data);

    // })
    // .catch(function (error) {

    // });
      
      

    var itemId = newItemRef.key;
    console.log("userID and intent " + itemId + " is successfully created.");
    return itemId;
}
