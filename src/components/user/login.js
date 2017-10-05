import React, { Component } from 'react';
import AlertContainer from 'react-alert';

import * as constant from '../constants';

import '../../assets/styles/common/authen.css';
import '../../assets/styles/common/main.css';

let translate = require('counterpart');
var firebase = require('firebase');
const $ = require('jquery');

class UserLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    }
  }

  componentWillMount() {
    if(localStorage.rocket_chat_user != null) {
      this.props.history.push();
    }
  }

  componentDidMount(){
    $('#button-login-with-facebook').on('click', event =>{
      console.log('facebook');
      var provider = new firebase.auth.FacebookAuthProvider();
      firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        console.log(token);
        console.log(user);
        window.location = constant.BASE_URL+ '/chat/'+user.displayName;
        return
        // ...
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });    
    })
  }
  
  showAlert = (text) => {
    this.msg.show(text, {
      time: 5000,
      type: 'success',
      icon: <img alt='warning' src={constant.warning} />
    })
  }

  handleInputChange(evt) {
    const target = evt.target;
    const name = target.name;
    const value = target.value;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(evt) {
    var component = this;
    evt.preventDefault();
    firebase.auth().signInWithEmailAndPassword(this.state.username,this.state.password).catch(function(error){
      component.showAlert(error.message);
    }).then(function(user){
      if(user){
        firebase.database().ref().child('users').child(user.uid).update({
          "status" : "online",
        }).catch(function(error){
          component.showAlert(error.message);
        }).then(function(){
          window.location = constant.BASE_URL+ '/chat/'+user.displayName;
        })
      }
    });
  }

  render() {
    return(
      <div className='login-page ng-scope ui-view'>
        <AlertContainer ref={a => this.msg = a} {...constant.ALERT_OPTIONS}/>
        <div className='row justify-content-md-center'>
          <div className='col-md-6'>
            <img src={constant.logoPic} className='user-avatar' alt=''/>
            <h1>{translate('app.identifier.app_name')} <small>
              {translate('app.identifier.slogan')}</small></h1>
            <button className='btn btn-white btn-outline btn-lg btn-rounded' id='button-login-with-facebook'>
              Facebook
            </button>
            <button className='btn btn-white btn-outline btn-lg btn-rounded' id='button-login-with-google'>
              Google
            </button>
            <button className='btn btn-white btn-outline btn-lg btn-rounded'>
              Twitter
            </button>
            <button className='btn btn-white btn-outline btn-lg btn-rounded'>
              Github
            </button>
            <button className='btn btn-white btn-outline btn-lg btn-rounded'>
              Phone
            </button>
            <form onSubmit={this.handleSubmit.bind(this)}
              className='ng-pristine ng-valid'>
              <div className='form-content'>
                <div className='form-group'>
                  <input type='text'
                    name='username'
                    value={this.state.username}
                    onChange={this.handleInputChange.bind(this)}
                    className='form-control input-underline input-lg'
                    placeholder={translate('app.login.username')}/>
                </div>
                <div className='form-group'>
                  <input type='password'
                    name='password'
                    value={this.state.password}
                    onChange={this.handleInputChange.bind(this)}
                    className='form-control input-underline input-lg'
                    placeholder={translate('app.login.password')}/>
                </div>
                <div className='form-group redirect-to'>
                  {translate('app.signup.new_to_us')}
                  <a href={constant.BASE_URL + constant.SIGN_UP_URI}>
                    {translate('app.signup.submit')}
                  </a>
                </div>
              </div>
              <button type='submit' className='btn btn-white btn-outline btn-lg btn-rounded'>
                {translate('app.login.submit')}
              </button>
            
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default UserLogin;
