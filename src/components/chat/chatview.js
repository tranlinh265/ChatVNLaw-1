import React, { Component } from 'react';
import { List, Image, Dropdown } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import SearchInput, {createFilter} from 'react-search-input';
import {Route, Switch} from 'react-router-dom';

import Chat from '../user/chat';

import * as constant from '../constants';

import '../../assets/styles/common/main.css';
import '../../assets/styles/common/user_index.css';

let translate = require('counterpart');
var firebase = require('firebase');
var currentUser;
const getStunServerList = require('../../lib/helper/get_stun_server_list');

const KEYS_TO_FILTERS = ['username'];

const options = [
  {icon: 'status status-icon online-status'},
  {icon: 'status status-icon offline-status'},
  {icon: 'status status-icon away-status'}
];

class ChatView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      searchTerm: ''
    }
  }

  componentWillMount(){
    if(!firebase.apps.length){
      firebase.initializeApp(constant.APP_CONFIG);
    }
    getStunServerList();
    firebase.auth().onAuthStateChanged(function(user){
      if(!user){
        window.location = constant.BASE_URL + constant.SIGN_IN_URI; 
      }
      currentUser = user;
    })
  }
  
  componentDidMount() {
    var component = this;
    
    
    let ref = firebase.database().ref('users').orderByChild('role').equalTo('user');
    ref.once('value')
    .catch(function(error){

    }).then(function(snapshot){
      var userArr = []
      ref.on('child_added', function(data) {
        
        var item = {
          username: data.val().username,
          displayName: data.val().username,
          uid : data.key,
          status: data.val().status,
          avatarUrl: data.val().avatarUrl
        }
        if(data.key === currentUser.uid){
          userArr.unshift(item);
          component.setState({users : userArr})          
          return;
        }
        userArr.push(item);
        component.setState({users : userArr})
      });
      ref.on('child_changed', function(data) {
        
        userArr.every(function(element,index){           
          if(element.uid === data.key){
            userArr[index] = {
              username: data.val().username,
              uid : data.key,
              status: data.val().status,
              avatarUrl: data.val().avatarUrl
            };
            component.setState({users : userArr})
            
            return false;
          }else{
            return true;
          }
        })
      });
      ref.on('child_removed', function(data) {
        if(data.key === currentUser.uid){
          return;
        }
        userArr.every(function(element,index){           
          if(element.uid === data.key){
            userArr.splice(index,1);
            component.setState({users : userArr})            
            return false;
          }else{
            return true;
          }
        })
      });

    });    
    
  }

  elementBaseStatus(userStatus) {
    if (userStatus === 'online') {
      return(
        'status status-icon online-status icon'
      )
    }
    else if (userStatus === 'offline') {
      return(
        'status status-icon offline-status icon'
      )
    }
    else if (userStatus === 'away') {
      return(
        'status status-icon away-status icon'
      )
    }
  }

  changeStatus(event, data) {
    firebase.database().ref('users')
      .child(currentUser.uid).update({'status' : data.text});
  }

  renderStatus(userStatus, username) {
    if (username === currentUser.displayName) {
      return(
        <Dropdown id={currentUser.uid}
          icon={this.elementBaseStatus(userStatus)}>
          <Dropdown.Menu>
            <Dropdown.Item text={translate('app.user.status.online')}
              icon={options[0].icon}
              onClick={this.changeStatus.bind(this)}/>
            <Dropdown.Item text={translate('app.user.status.offline')}
              icon={options[1].icon}
              onClick={this.changeStatus.bind(this)}/>
            <Dropdown.Item text={translate('app.user.status.away')}
              icon={options[2].icon}
              onClick={this.changeStatus.bind(this)}/>
          </Dropdown.Menu>
        </Dropdown>
      );
    }
    return(
      <Dropdown
        icon={this.elementBaseStatus(userStatus)}/>
    );
  }

  searchUpdated(term) {
    this.setState({searchTerm: term});
  }

  logout() {
    firebase.auth().signOut().then(function() {
      window.location = constant.BASE_URL + constant.SIGN_IN_URI;
    }).catch(function(error) {});
  }

  render() {
    const filteredUsers = this.state.users.filter(
      createFilter(this.state.searchTerm, KEYS_TO_FILTERS));
    return (
      <div className='chat-ui'>
        <div className='list-users'>
          <div className='header-index'>
            <Dropdown icon='setting'>
              <Dropdown.Menu>
                <Dropdown.Item text={translate('app.identifier.logout')}
                  onClick={this.logout.bind(this)}/>
              </Dropdown.Menu>
            </Dropdown>
            {translate('app.identifier.app_name')}
          </div>
          <List>
            <div className='search-box'>
              <SearchInput className='search-input'
                onChange={this.searchUpdated.bind(this)}
                placeholder={translate('app.user.search') + '...'} />
            </div>
            {
              filteredUsers.map(user => {
                if(user.username !== currentUser.displayName) {
                  if(user.type !== 'bot') {
                    return(
                      <div className={
                        this.props.match.params.user_name === user.username
                          ? 'user active-link' : 'user'}
                        key={user.uid}>
                        {this.renderStatus(user.status, user.username)}
                        <Link to={'/chat/' + user.username} key={user.uid}
                          activeClassName='active-link'>
                            <List.Item key={user.uid}>
                              <Image avatar src={user.avatarUrl}/>
                              <List.Content>
                                <List.Header>{user.displayName}</List.Header>
                              </List.Content>
                            
                              <div className='unread-mess'>
                                123
                              </div>
                            </List.Item>
                        </Link>
                      </div>
                    );
                  }
                  else {
                    return(
                      <div className={
                        this.props.match.params.user_name === user.username
                          ? 'user active-link' : 'user'}
                        key={user.uid}>
                        {this.renderStatus(user.status, user.username)}
                        <Link to={'/chat/' + user.username} key={user.uid}
                          activeClassName='active-link'>
                            <List.Item key={user.uid}>
                              <Image avatar src={constant.avaBot}/>
                              <List.Content>
                                <List.Header>{user.username}</List.Header>
                              </List.Content>
                              <div className='unread-mess'>
                                123
                              </div>
                            </List.Item>
                        </Link>
                      </div>
                    );
                  }
                }
                else {
                  return(
                    <div className={
                      this.props.match.params.user_name === user.username
                        ? 'user active-link' : 'user'}
                      key={user.uid}>
                      {this.renderStatus(user.status, user.username)}
                      <Link to={'/chat/' + user.username} key={user.uid}
                        activeClassName='active-link'>
                          <List.Item key={user.uid}>
                            <Image avatar src={user.avatarUrl}/>
                            <List.Content>
                              <List.Header>
                                {translate('app.chat.my_chat')}
                              </List.Header>
                            </List.Content>
                          </List.Item>
                      </Link>
                    </div>
                  );
                }
              })
            }
          </List>
        </div>
        {
          this.state.users.map(user => (
            <Switch>
              <Route path={'/chat/' + user.username}
                render={
                  (props) => (
                    <Chat {...props}
                      targetChatUser={user}/>
                  )
                }/>
            </Switch>
          ))
        }
      </div>
    )
  }
}

export default ChatView;
