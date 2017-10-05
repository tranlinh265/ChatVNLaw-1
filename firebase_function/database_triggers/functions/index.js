const functions = require('firebase-functions');
const admin = require('firebase-admin');
const gcs = require('@google-cloud/storage')();

admin.initializeApp(functions.config().firebase);
const ref = admin.database().ref()

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

exports.createUserAccount = functions.auth.user().onCreate(event =>{
    const uid = event.data.uid
    const email = event.data.email || ''
    const photoUrl = event.data.photoURL || "https://image.ibb.co/i23jUF/default_ava.png"
    const displayName = event.data.displayName || ''

    const newUserRef = ref.child(`/users/${uid}`)
    return newUserRef.set({
        email: email,
        avatarUrl: photoUrl,
        role: "user",
        status: "online",
        username: displayName,
        isDeleted: false
    })
})



exports.createImageMessage = functions.database.ref('/rooms/{roomId}/room_images/{imageId}')
.onCreate(event => {
    console.log(event.data.val());
    var data = event.data.val();
    var roomId = event.params.roomId;
    var content = '<title>' + data.name + '</title>' + '<link>' + data.downloadURL +'</link>';
    var sender_uid = data.sender_uid;
    var ts = data.ts;
    return event.data.ref.root.child('rooms').child(`${roomId}`).child('messages').push().set({
        msg_ts: ts,
        sender_uid: sender_uid,
        text: content
    })
})

exports.createFileMessage = functions.database.ref('/rooms/{roomId}/room_files/{fileId}')
.onCreate(event => {
    console.log(event.data.val());
    var data = event.data.val();
    var roomId = event.params.roomId;
    var content = '<title>' + data.name + '</title>' + '<link>' + data.downloadURL +'</link>';
    var sender_uid = data.sender_uid;
    var ts = data.ts;
    return event.data.ref.root.child('rooms').child(`${roomId}`).child('messages').push().set({
        msg_ts: ts,
        sender_uid: sender_uid,
        text: content
    })
})