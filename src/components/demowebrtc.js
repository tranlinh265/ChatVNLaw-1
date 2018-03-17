import React, { Component } from 'react';
import { log } from 'util';
import '../assets/styles/common/demowebrtc.css';
import $ from 'jquery';
import firebase from 'firebase';

import PubNub from 'pubnub';
import PubNubReact from 'pubnub-react';

import { compile } from 'path-to-regexp';

// var pubnub = new PubNub({
//     publishKey: 'pub-c-9d0d75a5-38db-404f-ac2a-884e18b041d8',
//     subscribeKey: 'sub-c-4e25fb64-37c7-11e5-a477-0619f8945a4f',
//     uuid: '0K0a7kCxqhSfKN5iJ1oNiLShqSt1',
// })

var conf =  require('./web-rtc');
var PHONE = conf.WebRTC;

var _stream;
var pub_key = 'pub-c-9d0d75a5-38db-404f-ac2a-884e18b041d8';
var sub_key = 'sub-c-4e25fb64-37c7-11e5-a477-0619f8945a4f';
var standby_suffix = '-stdby';
// var userId = '0K0a7kCxqhSfKN5iJ1oNiLShqSt1';
// var callUser = 'HVg3X4NSOGUi5gz2qWOjWGJMmXd2';
var userId = '';
var callUser = '';

class DemoWebRtc extends Component {
    constructor(props) {
        super(props);
        this.video_out= null;
    }
    
	login(){
        userId = $('#currentUser').val();
        console.log(userId);
        var component = this;
		var userIdStd = userId + standby_suffix;
		var pubnub = window.pubnub = new PubNub({
			publish_key: pub_key,
			subscribe_key: sub_key,
			uuid: userId
		});
		pubnub.subscribe({
			channels: [userIdStd],
			// message : incommingCall,
        });
        pubnub.addListener({
            message: function(message){
                console.log(message);   
                component.incommingCall(message);
            }
        })
		return false;	
	}
	
	phoneStart(){
		var phone = window.phone = PHONE({
			number: userId,
			publish: pub_key,
            subscribe: sub_key,
        });
        // phone.camera.start((stream)=>{
        //     var yourVideo = document.getElementById("yourVideo");
        //     yourVideo.srcObject = stream;
        //     yourVideo.onloadedmetadata = function(){
        //         yourVideo.play();
        //     }
        //     console.log('start camera');

        // });
		phone.ready(function(){
            console.log('ready');
		});
		phone.receive(function(session){
            console.log(session);
            console.log('phone');
            console.log(phone.video);
            session.thumbnail(function(session){
                console.log(session.image);
                console.log(phone.snap().image);
            });
			session.connected(function(session){
                console.log("connected");
                // console.log(session.video);
				// add stream to video element
			});
			session.ended(function(session){
                console.log("ended");
                console.log(session);
				// clear video.src
			});
		});
	}
	
	makeCall(){
    
        var callUserStd = $('#callUser').val() + standby_suffix;
		var msg = {"call_user": $('#currentUser').val(), "call_time": new Date().getMilliseconds()};
		window.pubnub.publish({
			channel: callUserStd,
			message: msg,
		});
		if(!window.phone) this.phoneStart();
	}
	
	incommingCall(m){
        console.log(m);
        if(!window.phone) this.phoneStart();
        console.log(m.message);
        console.log('calluser', m.message.call_user);
		window.phone.dial(m.message.call_user);
	}
	
	endCall(){
		if(window.phone) window.phone.hangup();
	}
	
	
    componentWillMount() {
        var component = this;
    }
 
    componentWillUnmount() {
        this.pubnub.unsubscribe({
            channels: ['channel1']
        });
    }
 
    componentDidMount(){
        this.login();
    }
    
    render(){
        return(
            <div>
                0K0a7kCxqhSfKN5iJ1oNiLShqSt1<br/>
                <input id="currentUser" /><br/>
                HVg3X4NSOGUi5gz2qWOjWGJMmXd2<br/>
                <input id="callUser" /><br/>

                <video id="yourVideo" autoplay muted playsinline></video>
                <video id="friendsVideo" autoplay></video>
                <button onClick={this.makeCall.bind(this)}>make call</button>
                <button onClick={this.endCall.bind(this)}>end call</button>
                <button onClick={this.login.bind(this)}>login</button>
            </div>
        )
    }
}

export default DemoWebRtc;