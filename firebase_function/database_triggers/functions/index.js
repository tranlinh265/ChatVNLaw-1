const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.createMyChat = functions.database.ref('/users/{userId}')
.onCreate(event => {
	var userId = event.params.userId;
	console.log(userId);
	// return event.data.ref.root.child('rooms').push().set({
	// 	"members":[userId,userId,userId+'_'+userId],
    //     "messages":[]
    // })
})

exports.createRoomReference = functions.database.ref('/rooms/{roomId}')
.onCreate(event => {
    var roomId = event.params.roomId;
    var val = event.data.val();
    var members = val.members;
    console.log(event.data.val());
	console.log(roomId);

	return event.data.ref.root.child('reference').child('' + members[0] + members[1]).set({
        roomId
    }) && event.data.ref.root.child('reference').child('' + members[1] + members[0]).set({
        roomId
    })
    // return
})