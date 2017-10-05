import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/common/chatsetting.css';
import * as constant from '../constants';

const translate = require('counterpart');
const Peer = require('peerjs');
const openStream = require('../../lib/helper/streaming/open_stream');
const playVideo = require('../../lib/helper/streaming/play_video');
const videoCall = require('../../lib/helper/video_call');
const closeMediaStream = require('../../lib/helper/streaming/close_media_stream');
const streamEvent = require('../../lib/helper/streaming/listen_event_from_database');
const fileEvent = require('../../lib/helper/upfile/listen_event_from_database');

var p;
var imageRef;
var fileRef;
var requestRef;
var cancelRequestRef;
var streamRef;
var callSide;
var answerSide;

var currentUser;
var targetUser;

class ChatSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current_user_type: '',
      current_room_id: '',
      images_list:[],
      files_list: []
    }
  }
  componentWillMount() {
    currentUser = this.props.currentUser;
    targetUser = this.props.targetChatUser;
  }
  componentDidMount(){
    var stunServer = JSON.parse(localStorage.stun_server_list);
    
    p = Peer(currentUser.uid,{key: '1xeeuumlu40a4i', config: stunServer});
    p.on('call', function(called) {
      openStream(stream =>{
        called.answer(stream);
        answerSide = called;
        called.on('stream',remoteStream =>{
              console.log(remoteStream);
              playVideo(remoteStream,'localStream');
        })
        called.on('close', function(){
          closeMediaStream(stream, '#localStream');          
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
        current_room_id: component.props.currentRoomId,
        images_list: [],
        files_list: []
      });
      
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
      let properties = {}
      properties['rid'] = component.props.currentRoomId;
      properties['uid'] = component.props.currentUserId;
      properties['peer'] = p;
      properties['vid'] = '#localStream';

      streamEvent.listenFromStreamFolder(properties,function(call,ref){
        streamRef = ref;
        callSide = call;
      })

      streamEvent.listenFromRequestFolder(properties,function(ref){
        requestRef = ref;
      })

      streamEvent.listenFromCancelRequestFolder(properties, function(ref){
        cancelRequestRef = ref;
      })
      properties['imagesList'] = imagesList;
      properties['filesList'] = filesList;
      properties['component'] = component;

      fileEvent.listenFromImageFolder(properties, function(ref){
        imageRef = ref;
      })

      fileEvent.listenFromFilesFolder(properties,function(ref){
        fileRef = ref;
      })  
    }
  }

  endCall(){
    try{        
      callSide.close();
      answerSide.close();    
    }catch(err){

    }
  }

  makeCallRequest(){
    let properties = {};
    properties['rid'] = this.state.current_room_id;
    properties['uid'] = currentUser.uid;
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
        <img src={targetUser.avatarUrl} alt='ava-lawyer'/>
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
            <div className='user-name'>{targetUser.username}</div>
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