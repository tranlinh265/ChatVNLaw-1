import React, { Component } from 'react';
import ChatBubble from 'react-chat-bubble';
import { Form } from 'semantic-ui-react';
import $ from 'jquery';
import ChatSetting from '../chat/chatsetting';
import * as constant from '../constants';
import '../../assets/styles/common/chatwindow.css';
import * as fileHelper from '../../lib/helper/upfile_helper';
import * as im from '../../lib/helper/messages';

let translate = require('counterpart');
let FontAwesome = require('react-fontawesome');
var firebase = require('firebase');
var currentUser;
var targetUser;
var messRef;

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      current_room_id: ''
    }
  }

  componentDidMount() {
    var component = this;
    var fileButton = document.getElementById('upfile');
    fileButton.addEventListener('change', function(e){
      e.preventDefault();
      let file = e.target.files[0];
      // store file data on firebase storage and set a reference on firebase realtime database
      let properties = {}
      properties["roomId"] = component.state.current_room_id;
      properties["uid"] = currentUser.uid;
      fileHelper.upfile(properties,file,function(){
      });
    });

    document.getElementsByClassName('chats')[0].addEventListener('scroll',
      function(){
        if(this.scrollTop === 0){
          if(component.state.messages[0]){
            let ts = parseInt(component.state.messages[0].msg_ts) - 1;
            component.loadHistory(""+ts,false);
          }
        }
      }
    );
  }

  componentWillMount() {    
    var component = this;
    currentUser = firebase.auth().currentUser;
    targetUser = component.props.targetChatUser;
    component.setState({messages: []})
    
    var roomid = currentUser.uid + targetUser.uid;
    firebase.database().ref().child('reference').child(roomid)
      .once('value').then(function(snapshot){
      if(snapshot.exists()){
        // get real roomId
        snapshot.forEach(function(element){
          component.setState({current_room_id: element.val()});
        })
        component.streamingMessages();
        component.loadHistory("" + (new Date()).getTime, true);
      }else{
        // create new room chat
        let ref = firebase.database().ref().child('rooms');
        let newPostRef = ref.push()
        newPostRef.set({
          'members':[currentUser.uid, targetUser.uid,
            currentUser.uid + '_' + targetUser.uid],
          'messages':[]
        })
       
        component.streamingMessages();
        component.loadHistory("" + (new Date()).getTime, true)
      }
    });
    // }
  }

  loadHistory(timestamp, autoScroll){
    let properties = {};
    var component = this;
    var hasHistory = false;
    properties['ts'] = timestamp;
    properties['rid'] = this.state.current_room_id;
    properties['uid'] = currentUser.uid;
    let currentMessArr = this.state.messages;
    im.history(properties,15,function(item, index){
      currentMessArr.splice(index, 0, item);
      component.setState({messages: currentMessArr});
      hasHistory = true;
      if(autoScroll){
        component.autoScrollBottom();      
      }
    });
    
    if (!hasHistory) {
      this.forceUpdate();
    }
  }

  streamingMessages(){
    var component = this;
    if ( typeof messRef !== 'undefined' && messRef){
      messRef.off();
    }
    var messArr = component.state.messages;
    let properties = {}
    properties['rid'] = component.state.current_room_id;
    properties['uid'] = currentUser.uid;
    properties['ts'] = "" + (new Date()).getTime();
    im.notifyMessagesComming(properties,function(event, item, ref){
      if(event === 'child_added'){
        messArr.push(item);
        component.setState({messages: messArr});
        component.autoScrollBottom();
        messRef = ref;
      }
    })
  }

  autoExpand(elementId) {
    var input = document.getElementById(elementId);
    var chats = document.getElementsByClassName('chats')[0];
    var vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    input.style.height = '45px';
    var contentHeight = document.getElementById(elementId).scrollHeight;
    input.style.height = contentHeight + 'px';

    var textbox = document.getElementById('text-box');
    textbox.style.height = contentHeight + 2 + 'px';
    chats.style.height = vh - 55 - contentHeight + 'px';
    this.autoScrollBottom();
  }

  clearContent(elementId) {
    $('#' + elementId).val($('#' + elementId).val().replace(/\t/g, 'a'));
    $('#' + elementId).val('');
    this.autoExpand(elementId);
  }

  handleInputChange(evt) {
    if (evt.which === 13 && evt.shiftKey === false) {
      this.handleSubmit();
      evt.preventDefault();
      this.clearContent('input-mess-box');
    }
    else {
      this.autoExpand('input-mess-box');
    }
  }

  handleSubmit(){
    var component = this;
    var date = new Date();  
    let properties = {}
    properties["rid"] = component.state.current_room_id;
    properties["content"] = document.getElementById('input-mess-box').value;  
    properties["uid"] = currentUser.uid;
    properties["ts"] = "" + date.getTime();
    properties["avatarUrl"] = currentUser.photoURL;
    im.chat(properties,function(){

    });
  }

  autoScrollBottom() {
    $('.chats').stop().animate({
      scrollTop: $('.chats')[0].scrollHeight}, 1000);
  }

  upfile() {
    $('#upfile:hidden').trigger('click');
  }

  render() {
    return(
      <div className='chat-window' id='chat-window'>
        <div className='title'>
          <div className='user-name'>
            {targetUser.username}
          </div>
          <FontAwesome name='video-camera'/>
          <FontAwesome name='phone'/>
        </div>
        <div className='chat-body'>
          <ChatBubble messages={this.state.messages} />
          <div className='text-box' id='text-box'>
            <input type='file' id='upfile'/>
            <textarea id='input-mess-box'
              placeholder={translate('app.chat.input_place_holder')}
              onKeyDown={this.handleInputChange.bind(this)}/>
            <div className='addons-field'>
              <FontAwesome onClick={this.upfile} name='file-image-o'/>
            </div>
          </div>
        </div>
        <ChatSetting targetChatUserName={targetUser.username}
          currentRoomId={this.state.current_room_id}
          targetChatUserId={targetUser.uid}
          currentUserId={currentUser.uid}
          currentUser={currentUser}
          targetChatUser={targetUser}/>
      </div>
    )
  }
}

export default Chat;
