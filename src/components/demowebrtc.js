import React, { Component } from 'react';
import { log } from 'util';
import '../assets/styles/common/demowebrtc.css';
import $ from 'jquery';

import PubNub from 'pubnub';
import PubNubReact from 'pubnub-react';

import { compile } from 'path-to-regexp';

// var pubnub = new PubNub({
//     publishKey: 'pub-c-9d0d75a5-38db-404f-ac2a-884e18b041d8',
//     subscribeKey: 'sub-c-4e25fb64-37c7-11e5-a477-0619f8945a4f',
//     uuid: '0K0a7kCxqhSfKN5iJ1oNiLShqSt1',
// })

let conf =  require('./web-rtc');
var PHONE = conf.WebRTC;

var _stream;
class DemoWebRtc extends Component {
    constructor(props) {
        super(props);
        this.pubnub = new PubNubReact({
            publishKey: 'pub-c-9d0d75a5-38db-404f-ac2a-884e18b041d8',
            subscribeKey: 'sub-c-4e25fb64-37c7-11e5-a477-0619f8945a4f',
            uuid : '0K0a7kCxqhSfKN5iJ1oNiLShqSt1',
        });
        this.phone = PHONE({
            number        : '0K0a7kCxqhSfKN5iJ1oNiLShqSt1-stdby' || "Anonymous", // listen on username line else Anonymous
            publish_key   : 'pub-c-9d0d75a5-38db-404f-ac2a-884e18b041d8', // Your Pub Key
            subscribe_key : 'sub-c-4e25fb64-37c7-11e5-a477-0619f8945a4f', // Your Sub Key
            autocam : false,
        });	
        this.pubnub.init(this);
        this.video_out= null;
    }
    componentWillMount() {
        var component = this;

        // this.pubnub.subscribe({
        //     channels: ['0K0a7kCxqhSfKN5iJ1oNiLShqSt1-stdby'],
        //     withPresence: true
        // });
 
        // this.pubnub.getMessage('0K0a7kCxqhSfKN5iJ1oNiLShqSt1-stdby', (msg) => {
        //     console.log(msg);
        //     component.pubnub.publish({
        //         message: 'hello world from react',
        //         channel: ''+msg.message.call_user+'-stdby',
        //     })
        // });
        // this.phone.ready(function(){
        //     console.log("Phone ON!");
        // });
        // this.phone.receive(function(session){
        //     session.message(message);
        //     session.connected(function(session) { 
        //         video_out.innerHTML="";
        //         video_out.appendChild(session.video);  
        //     });
        //     session.ended(function(session) { video_out.innerHTML=''; });
        // });
    }
 
    componentWillUnmount() {
        this.pubnub.unsubscribe({
            channels: ['channel1']
        });
    }
 
    componentDidMount(){
        var yourVideo = document.getElementById("yourVideo");
    }
    endCall(){

    }
    makeCall(){
        console.log(this);
        console.log(this.phone);
        var video_out = document.getElementById("friendsVideo");
this.phone.camera.start();
        // this.phone.ready(function(){
        //     console.log("Phone ON!");
        // });
        // this.phone.receive(function(session){
        //     session.connected(function(session) { 
        //         video_out.innerHTML="";
        //         video_out.appendChild(session.video);  
        //     });
        //     session.ended(function(session) { video_out.innerHTML=''; });
        // });
    }
    render(){
        return(
            <div>
                <video id="yourVideo" autoplay muted playsinline></video>
                <video id="friendsVideo" autoplay></video>
                <button onClick={this.makeCall.bind(this)}>make call</button>
            </div>
        )
    }
}

export default DemoWebRtc;
