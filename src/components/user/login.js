import React, {Component} from 'react';
import AlertContainer from 'react-alert';

import * as constant from '../constants';

import '../../assets/styles/common/authen.css';
import '../../assets/styles/common/main.css';

let translate = require('counterpart');
var authen = require('../../lib/api/authentication.js');
var firebase = require('firebase');

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
      window.location = constant.BASE_URL;
    }
  }

  componentDidMount(){
    
  }
  
  showAlert = (text) => {
    this.msg.show(text, {
      time: 5000,
      type: 'success',
      icon: <img alt='warning' src='../../assets/images/warning.png' />
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
    evt.preventDefault();
    var component = this;
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
        <div className='row'>
          <div className='col-md-6 col-lg-6 col-md-offset-3 col-lg-offset-3'>
            <img src={constant.logoPic} className='user-avatar' alt=''/>
            <h1>{translate('app.identifier.app_name')} <small>
              {translate('app.identifier.slogan')}</small></h1>
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
