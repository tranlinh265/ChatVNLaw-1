const firebase = require('firebase');
const openStream = require('./open_stream');
const playVideo = require('./play_video');
const closeMediaStream = require('./close_media_stream');

module.exports = {
    listenFromStreamFolder: function(properties,peer, callback){
        let ref = firebase.database().ref().child('rooms').child(properties.rid).child('video_call').child('streaming')
        ref.on('child_added', function(snapshot){
            console.log('stream comming');
            console.log(peer);
            // let peer = properties.peer;
            if(snapshot.key !== peer.id){
                openStream(stream =>{
                    console.log(stream);
                    let call = peer.call(snapshot.key,stream);
                    call.on('stream',remoteStream =>{
                        console.log('stream');
                        console.log(remoteStream);
                        playVideo(remoteStream,'localStream');
                    })
                    call.on('close', function(){
                        closeMediaStream(stream, properties.vid);
                        })
                    return callback(call, ref);
                })
            }
        })
        // return callback(ref);
    },
    listenFromRequestFolder: function(properties, callback){
        let ref = firebase.database().ref().child('rooms').child(properties.rid).child('video_call').child('request')
        ref.on('child_added', function(snapshot){
            if(snapshot.exists()){
                if(snapshot.key !== properties.uid){
                    if(window.confirm("video call from another user")){
                        firebase.database().ref().child('rooms').child(properties.rid).child('video_call').child('request').remove();
                        let streamRef = firebase.database().ref().child('rooms').child(properties.rid).child('video_call').child('streaming').child(properties.peer.id)
                        .push({
                                "id": "123"
                        })
                        streamRef.remove();
                    }else{
                        firebase.database().ref().child('rooms').child(properties.rid).child('video_call').child('request').remove();
                        let cancelRequestRef = firebase.database().ref().child('rooms').child(properties.rid).child('video_call').child('cancel_request').child(properties.uid).push({
                                "msg":"111"
                        });
                        cancelRequestRef.remove();
                    }
                }
            }
          })
        return callback(ref);
		},
		listenFromCancelRequestFolder: function(properties, callback){
			let ref = firebase.database().ref().child('rooms').child(properties.rid).child('video_call').child('cancel_request');
      ref.on('child_added', function(snapshot){
        if(snapshot.exists()){
          if(snapshot.key !== properties.uid){
            alert('cancel request');
          }
        }
      })
		}

}