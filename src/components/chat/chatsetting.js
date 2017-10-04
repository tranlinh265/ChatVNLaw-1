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
var test;
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
    var stunServer = JSON.parse(localStorage.stun_server_list);
    // console.log(stunServer);
    // var tmp = {"iceServers":[{"url":"stun:s3.xirsys.com"},{"username":"8d319f1a-a8c8-11e7-9e7e-dc5e36a751e0","url":"turn:s3.xirsys.com:80?transport=udp","credential":"8d31a028-a8c8-11e7-bfb2-a21efe2bbbaa"},{"username":"8d319f1a-a8c8-11e7-9e7e-dc5e36a751e0","url":"turn:s3.xirsys.com:3478?transport=udp","credential":"8d31a028-a8c8-11e7-bfb2-a21efe2bbbaa"},{"username":"8d319f1a-a8c8-11e7-9e7e-dc5e36a751e0","url":"turn:s3.xirsys.com:80?transport=tcp","credential":"8d31a028-a8c8-11e7-bfb2-a21efe2bbbaa"},{"username":"8d319f1a-a8c8-11e7-9e7e-dc5e36a751e0","url":"turn:s3.xirsys.com:3478?transport=tcp","credential":"8d31a028-a8c8-11e7-bfb2-a21efe2bbbaa"},{"username":"8d319f1a-a8c8-11e7-9e7e-dc5e36a751e0","url":"turns:s3.xirsys.com:443?transport=tcp","credential":"8d31a028-a8c8-11e7-bfb2-a21efe2bbbaa"},{"username":"8d319f1a-a8c8-11e7-9e7e-dc5e36a751e0","url":"turns:s3.xirsys.com:5349?transport=tcp","credential":"8d31a028-a8c8-11e7-bfb2-a21efe2bbbaa"}]};
    p = Peer(this.state.current_user_id,{key: '1xeeuumlu40a4i', config: stunServer});
    console.log(p);
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
        current_user_id : component.props.currentUserId,
        chat_target_uid : component.props.targetChatUserId,
        current_user_name: component.props.targetChatUserName,
        current_room_id: component.props.currentRoomId,
        images_list: [],
        files_list: []
      });
      if(!!test){
        console.log('helu');
      }
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

      streamEvent.listenFromStreamFolder(properties,p,function(call,ref){
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
    properties['uid'] = this.state.current_user_id;
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
    console.log("123");
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