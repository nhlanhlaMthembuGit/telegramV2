

var axios = require('axios');

const admin = require('firebase-admin') ;
const firebaseHelper = require('firebase-functions-helper');


//admin.initializeApp(functions.config().firebase)

admin.initializeApp({
   credential: admin.credential.applicationDefault()
});

const db = admin.firestore()
const settings = { timestampsInSnapshots: true }
db.settings(settings)


//creating a collection
//const userDetailsCollection = 'userDetails';
//const userintentsCollection = 'userintents';

//Add userDetails table

//  function getUserDetails(phone_number,user_id,first_name,last_name){
//     let userInfor = {

//         msidn : phone_number,
//         Telegram_ID : user_id,
//         first_name : first_name,
//         last_name : last_name

//     }

//     firestoreHelper.firestore.createNewDocument(db, userDetailsCollection, userInfor);
    
//  }
    


        

var bb = require('bot-brother')
var bot = bb({
    key: '632216946:AAH0JL1223mNF-KC9q4VPP57hP-pxEmVqSg',
    sessionManager: bb.sessionManager.memory(),
    polling: { interval: 10, timeout: false }

})


// //user validation 
// bot.use('before' , (ctx) => {
    // axios.get('http://cba26d6c.ngrok.io/processor/v1/userDetails/'+ ctx.meta.user.id)
    // .then(response => {
    //     if(response.data.exists ===true){
    //         return ctx.go('yes')
    //         console.log(response.data)
    //     }
    //     else{
    //        return ctx.go('yello')
    //     }
    // })
// })


bot.command('start')
.invoke((ctx) => {
    axios.get('http://cba26d6c.ngrok.io/processor/v1/userDetails/'+ ctx.meta.user.id)
    .then(response => {
        console.log(response.data)
        if(response.data.exists ===true){
            
            return ctx.go('yes')
            
        }
        else{
           return ctx.go('yello')
        }
    })

})


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
    //Calling a user deatails function
    console.log(ctx.meta.user.phone_number);
    //getUserDetails(ctx.meta.user.phone_number, ctx.meta.user.id,ctx.meta.user.first_name,ctx.meta.user.last_name);

    //CHECK IF THE USER EXIST
  
    //bot.api.sendMessage(ctx.meta.chat.id, "Yello  " +ctx.meta.user.first_name + "  may you please register by entering your number", option)
    return ctx.sendMessage("Yello  " +ctx.meta.user.first_name + "  may you please register by entering your number", option)
    
    
//  bot.command('type')
//    .invoke(function(ctx) {
//     var USERID = ctx.meta.user.id
//     var action = "typing";
//     bot.api.sendChatAction(USERID, action).then(function (resp) {

//      return ctx.go('intent')
//     })

//   });
    
    
}).answer(function (ctx) {

    //display user telegram ID
    console.log(ctx.meta.user.id)    
    console.log(ctx.message.contact.phone_number);
    return ctx.go('userInfor')
})

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
        addUserIntent(ctx)
        addUserDetails(ctx)
        return ctx.sendMessage('Thanks '+ ctx.meta.user.first_name+' , your selection has been captured');
         //Calling a user intent function
         //getUserIntent(ctx.session.memory, ctx.meta.user.id, ctx.meta.user.first_name, ctx.meta.user.last_name);
        
        
        
    })

        .answer(function(ctx){
            return ctx.go('intent')
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
       return axios.get('http://cba26d6c.ngrok.io/processor/v1/promotions')
       .then((response) => {


           //console.log('i am here')
           console.log(response.data)
           ctx.sendMessage(response.data.advert)
           return ctx.go('chitchat');
       })

   })

//Check if user exists by getting a number/telegram_id
bot.command('check')
.invoke(function(ctx){
    // Attach an asynchronous callback to read the data at our posts reference
    ref.on("value", function(snapshot) {

        let data = snapshot.val().user_details

        console.log(data);

    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);

        //Get single value inside 
        _.forEach(data, function(val) {
            console.log(val.Telegram_ID); 
          });

    });
    return ctx.sendMessage('i can read')
})


// store users number and intent
// bot.command('hit')
// .invoke(function(ctx){
//     let userData = {

//         userData: ctx.message.contact.phone_number
//     }
//     //Send keyboard selection action to processor
//     axios.post('http://0da912ca.ngrok.io/processor/v1/userIntents', userData)
//         .then(function (response) {
//             console.log(response.data);
 
//         })
//         .catch(function (error) {
 
//         });
// })


// // posting data to the processor endpoint
// bot.command('Kat')
// .invoke(function(ctx){
    
   
//     axios.get('http://516d0ec3.ngrok.io/processor/v1/userDetails/ '+ ctx.meta.user.id)
//     .then(function (response) {
//     console.log(response.data);
// })
// .catch(function (error) {
// }); 
//     return ctx.sendMessage('hi')
// })

//Send user detaits to firestore
// bot.command('start')
// .invoke(function(ctx){
//     let userInfor = {
 
//         first_name : ctx.meta.user.first_name,
//         last_name : ctx.meta.user.last_name,
//         msidn : ctx.message.phone_number,
//         telegram_id :  ctx.meta.user.id
       

//     }
//     console.log('Sent to John')
//     axios.post('http://cba26d6c.ngrok.io/processor/v1/saveUserDetails/ ', userInfor)
//     .then(function(response){
//         if(value.Telegram_ID == ctx.meta.user.id)
//         {
//             exists = true;
//             console.log('user  exist')
//               ctx.go('yes');



//         }else{
//             console.log('user dont exist')
//               ctx.go('yello');
//         }
//         console.log(response.data)
//     })
//     .catch(function(error){
//         return ctx.go('hi')
//     })
// })

//Send user intent to firestore

function addUserIntent(ctx) {
   let userData = {

       userData: ctx.session.memory,
       msidn : ctx.message.phone_number

   }


   //posting data to the processor endpoint
console.log('posting intents')
   axios.post('http://cba26d6c.ngrok.io/processor/v1/saveUserIntents/', userData)
       .then(function (response) {
           console.log(response.data);

       })
       .catch(function (error) {



       });
}

//Creating user deatils to firestore
function addUserDetails(ctx) {
    let userInfor = {
 
        first_name : ctx.meta.user.first_name,
        last_name : ctx.meta.user.last_name,
        msidn : ctx.message.phone_number,
        telegram_id :  ctx.meta.user.id
       
    }
    //posting data to the processor endpoint
    console.log('posting user deatils')
    axios.post('http://cba26d6c.ngrok.io/processor/v1/saveUserIntents/', userInfor)
        .then(function (response) {
            console.log(response.data);
 
        })
        .catch(function (error) {

            ctx.sendMessage('error code ')

            return ctx.go('yello');
        });
 }
    
    
  