import React, {Component} from 'react';
import ChatBox from './chatBox';

import * as firebase from 'firebase';
import * as constant from '../../../constants';
import * as UserList from '../../../../lib/helper/user/get_target_chat_list';

let translate = require('counterpart');

class ChatUsersList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      targetUser:null,
      currentUser: null,
      users: [],
      unread: []
    };
  }

  componentWillMount(){
    var component = this;
    if(!firebase.apps.length){
      firebase.initializeApp(constant.APP_CONFIG);
    }
    firebase.auth().onAuthStateChanged(user =>{
      if(user){
        component.setState({currentUser: user})
        let properties = {}
        properties['component'] = component;
        properties['currentUser'] = user;
        properties['keyword'] = 'user';
        UserList.getTargetChat(properties);
        component.props.emitter.addListener('getUserSearch', function(targetUser){
          component.setState({targetUser: targetUser})
        })
      }else{

      }
    })
    component.props.emitter.addListener('getUserSearch', function(targetUser){
      component.setState({targetUser: targetUser})
    })
  }

  changeUserChat(user){
    document.body.classList.remove('chat-section-hidden');
    this.setState({targetUser: user})
  }

  render() {    
    return(
      <div>
        <div className='chat-users-list'>
        {
          this.state.users.map(user => {
            if(JSON.stringify(this.state.targetUser) === JSON.stringify(user)){
              return(
                <div className='chat-user active-link'
                  onClick={this.changeUserChat.bind(this,user)}
                  key={user.uid}>
                  <div className='user-ava'>
                    <img src={user.photoURL} title={user.displayName}/>
                  </div>
                </div>
              )
            } else{
              return(
                <div className='chat-user'
                  onClick={this.changeUserChat.bind(this,user)}
                  key={user.uid}>
                  <div className='user-ava'>
                    <img src={user.photoURL} title={user.displayName}/>
                  </div>
                </div>
              )
            }         
          })
        }
        </div>
        <ChatBox
          targetUser={this.state.targetUser}
          currentUser={this.state.currentUser}
          emitter={this.props.emitter}/>
      </div>
    )
  }
}

export default ChatUsersList;
