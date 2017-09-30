import React, { Component } from 'react';
import { Dropdown } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import '../../assets/styles/common/chatsetting.css';

import * as constant from '../constants';

let FontAwesome = require('react-fontawesome');
let translate = require('counterpart');
var firebase = require('firebase');
var imageRef;
var fileRef;
var requestRef;
var requestId;
var cancelRequestRef;

var RTCPeerConnection = window.webkitRTCPeerConnection;
var video_call = require('../../lib/helper/video_call');
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var yourId = Math.floor(Math.random()*1000000000);
var constraints = { audio: false, video: true };
var video = document.querySelector("video");
var servers = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};
var pc = new RTCPeerConnection(servers);



class ChatSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current_user_id:'',
      current_user_name: '',
      current_user_type: '',
      current_room_id: '',
      images_list:[],
      files_list: [],
      chat_target_uid:''
    }
  }
  componentDidMount(){
  }

  sendMessage(roomId,senderId, data) {
    let database = firebase.database().ref().child('rooms').child(roomId).child('video_call').child('streaming');
    var msg = database.push({ sender: senderId, message: data });
    console.log('12332');
    // msg.remove();
  }
  componentWillReceiveProps(nextProps) {
    var component = this;
    if(component.props.currentRoomId !== this.state.current_room_id && component.props.currentRoomId){
      var imagesList = [];
      var filesList = [];
      component.setState({
        current_user_id : component.props.currentUserId,
        chat_target_uid : component.props.targetChatUserId,
        current_user_name: component.props.targetChatUserName,
        current_room_id: component.props.currentRoomId,
        images_list: [],
        files_list: []
      });
      
      var roomId = component.props.currentRoomId;
      if ( typeof imageRef !== 'undefined' && imageRef){
        imageRef.off();
      }
      if ( typeof fileRef !== 'undefined' && fileRef){
        fileRef.off();
      }
      if ( typeof requestRef !== 'undefined' && requestRef){
        requestRef.off();
      }
      if ( typeof cancelRequestRef !== 'undefined' && cancelRequestRef){
        requestRef.off();
      }
      // pc.onicecandidate = (event => event.candidate?component.sendMessage(roomId,yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
      
      requestRef = firebase.database().ref().child('rooms').child(roomId).child('video_call').child('request')
      requestRef.on('child_added', function(snapshot){
        if(snapshot.exists()){
          if(snapshot.key !== component.props.currentUserId){
            if(window.confirm("video call from another user")){
              firebase.database().ref().child('rooms').child(roomId).child('video_call').child('request').remove();
              // firebase.database().ref().child('rooms').child(roomId).child('video_call').child('streaming').child(component.props.currentUserId)
              // .set({

              // })
              // pc.onaddstream = (event => video.srcObject = event.stream);

            }else{
              firebase.database().ref().child('rooms').child(roomId).child('video_call').child('request').remove();
              let ref = firebase.database().ref().child('rooms').child(roomId).child('video_call').child('cancel_request').child(component.props.currentUserId).push({
                "msg":"111"
              });
              ref.remove();
            }

          }else{  
            console.log('ng gui');
          }
        }
      })

      cancelRequestRef = firebase.database().ref().child('rooms').child(roomId).child('video_call').child('cancel_request');
      cancelRequestRef.on('child_added', function(snapshot){
        if(snapshot.exists()){
          if(snapshot.key !== component.props.currentUserId){
            alert('cancel request');
          }
        }
      })
      imageRef = firebase.database().ref().child('rooms').child(roomId).child('room_images');
      imageRef.on('child_added',function(snapshot){
        if(snapshot.exists()){
          let item = {}
            snapshot.forEach(function(element){
              item[element.key] = element.val();
            })
            imagesList.push(item);
            component.setState({images_list: imagesList});
          }
        }
      );

      fileRef = firebase.database().ref().child('rooms').child(roomId).child('room_files');
      fileRef.on('child_added', function(snapshot){
        if(snapshot.exists()){
          let item = {}
            snapshot.forEach(function(element){
              item[element.key] = element.val();
            })
            filesList.push(item);
            component.setState({files_list: filesList});
          }
        }
      );
  }
  }

  endCall(){

  }
  makeCallRequest(){
    let properties = {};
    properties['rid'] = this.state.current_room_id;
    properties['uid'] = this.state.current_user_id;
    let component = this;
    video_call.checkRequest(properties, function(issuccess){
      if(issuccess){
        alert('already been used');
      }else{
        video_call.createRequest(properties,function(issuccess){
      
        });
      }
    });
    // console.log("abc");
    // navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    
    // var constraints = { audio: false, video: true };
    // var video = document.querySelector("video");

    // function successCallback(stream) {
    //   video.src = window.URL.createObjectURL(stream);
    // }

    // function errorCallback(error){
    //   console.log("getUserMedia error: ", error);
    // }

    // navigator.getUserMedia(constraints, successCallback, errorCallback);
  }  
  renderAva() {
    if(this.state.current_user_type === 'bot') {
      return(
        <img src={constant.avaBot} alt='ava-bot'/>
      )
    }
    else {
      return(
        <img src={constant.avaLawyer} alt='ava-lawyer'/>
      )
    }
  }

  renderConfig() {
  }

  render() {
    return(
      <div className='chat-setting'>
        <div className='header'>
          <div className='ava'>
            {this.renderAva()}
          </div>
          <div className='info'>
            <div className='user-name'>{this.state.current_user_name}</div>
          </div>
          {/* <div className='config'>
            {this.renderConfig()}
          </div> */}
        </div>
        <div className='content'>
          <div className='shared shared-files'>
            <div className='content-title'>{translate('app.chat.shared_files')}</div>
            <div className='files-list'>
              {
                this.state.files_list.map(file => {
                  return(
                    <Link to={file.downloadURL}
                      target='_blank'>
                        {file.name}
                    </Link>
                  )
                })
              }
            </div>
          </div>
          <div className='shared shared-images'>
            <div className='content-title'>{translate('app.chat.shared_images')}</div>
            <div className='images-list'>
              {
                this.state.images_list.map(image => {
                  return(
                    <Link to={image.downloadURL}
                      target='_blank'>
                        {image.name}
                    </Link>
                  )
                })
              }
            </div>
          </div>
          <video className='video' autoPlay></video>
          <button className='button-call' onClick={this.makeCallRequest
      .bind(this)} >Call</button>
          <button className='button-call' onClick={this.endCall} >End</button>
        </div>
      </div> 
    )
  }
}

export default ChatSetting;