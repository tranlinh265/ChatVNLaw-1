import React, { Component } from 'react';
import { Dropdown } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import $ from 'jquery';

import '../../assets/styles/common/chatsetting.css';

import * as constant from '../constants';

let FontAwesome = require('react-fontawesome');
let translate = require('counterpart');
var firebase = require('firebase');
var Peer = require('peerjs');
var openStream = require('../../lib/helper/open_stream');
var playVideo = require('../../lib/helper/play_video');
var videoCall = require('../../lib/helper/video_call');
var p;
var imageRef;
var fileRef;
var requestRef;
var requestId;
var cancelRequestRef;
var streamRef;
var callSide;
var answerSide;
var streamRecored;
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
    p = Peer(this.state.current_user_id,{key: '1xeeuumlu40a4i'});
    console.log(p);
    p.on('call', function(called) {
      openStream(stream =>{
        called.answer(stream);
        answerSide = called;
        streamRecored = stream;
        called.on('stream',remoteStream =>{
              console.log(remoteStream);
              playVideo(remoteStream,'localStream');
        })
        called.on('close', function(){
          stream.getVideoTracks().forEach(function (track) {
            track.stop();
          });
          stream.getAudioTracks().forEach(function (track) {
            track.stop();
          });
          let video = $('#localStream');
          video.removeAttr("src");
        })
      })
    });
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
      if ( typeof streamRef !== 'undefined' && streamRef){
        streamRef.off();
      }
      // pc.onicecandidate = (event => event.candidate?component.sendMessage(roomId,yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
      streamRef = firebase.database().ref().child('rooms').child(roomId).child('video_call').child('streaming')
      streamRef.on('child_added', function(snapshot){
        console.log(snapshot);
        if(snapshot.key === p.id){
          
        
        }else{
          openStream(stream =>{
            streamRecored = stream;
          // playVideo(stream, 'localStream');
          console.log(snapshot.key);
            callSide = p.call(snapshot.key,stream);
            // console.log(call);
            callSide.on('stream',remoteStream =>{
              console.log(remoteStream);
              playVideo(remoteStream,'localStream');
            })
            callSide.on('close',function(){
              stream.getVideoTracks().forEach(function (track) {
                track.stop();
              });
              stream.getAudioTracks().forEach(function (track) {
                track.stop();
              });
              let video = $('#localStream');
              video.removeAttr("src");
            })
        })
        }
      })
      requestRef = firebase.database().ref().child('rooms').child(roomId).child('video_call').child('request')
      requestRef.on('child_added', function(snapshot){
        if(snapshot.exists()){
          if(snapshot.key !== component.props.currentUserId){
            if(window.confirm("video call from another user")){
              firebase.database().ref().child('rooms').child(roomId).child('video_call').child('request').remove();
              let streamref = firebase.database().ref().child('rooms').child(roomId).child('video_call').child('streaming').child(p.id)
              .push({
                "id": "123"
              })
              streamref.remove();
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
    try{
      // 
    //   for (let track of streamRecored.getTracks()) { 
    //     track.stop()
    // }
      // streamRecored.stop();
        
      callSide.close();
      answerSide.close();    
    }catch(err){

    }
  }
  makeCallRequest(){
    // var servers = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};    
    
    // p = Peer(this.state.current_user_id,{key: '1xeeuumlu40a4i', config: servers});
    // var call;
    // console.log(p);
    // openStream(stream =>{
    //   // playVideo(stream, 'localStream');
    //   let friendId = '';
    //   if(p.id === '7sAxerFIIMPJKjygeKUhNWP10x23'){
    //     friendId = 'V3ZlQkCN9qhuMJpQNwMWo8VNu7r1';
    //   }else{
    //     friendId = '7sAxerFIIMPJKjygeKUhNWP10x23';
    //   }
    //   call = p.call(friendId,stream);
    //   console.log(call);
    //   call.on('stream',remoteStream =>{
    //     console.log(remoteStream);
    //     playVideo(remoteStream,'localStream');
    //   })
    // })
    
    // p.on('call', function(called) {
    //   openStream(stream =>{
    //     called.answer(stream);

    //   })
    // });

    let properties = {};
    properties['rid'] = this.state.current_room_id;
    properties['uid'] = this.state.current_user_id;
    let component = this;
    videoCall.checkRequest(properties, function(issuccess){
      if(issuccess){
        alert('already been used');
      }else{
        videoCall.createRequest(properties,function(issuccess){
          
        });
      }
    });
    
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
          <video className='video' id='localStream' autoPlay></video>
          <button className='button-call' onClick={this.makeCallRequest
      .bind(this)} >Call</button>
          <button className='button-call' onClick={this.endCall.bind(this)} >End</button>
        </div>
      </div> 
    )
  }
}

export default ChatSetting;