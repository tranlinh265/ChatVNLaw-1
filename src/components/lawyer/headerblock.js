import React, { Component } from 'react';
import ReactStars from 'react-stars';

let translate = require('counterpart');

class HeaderBlock extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div className='profile-header'>
        <div className='row'>
          <div className='col-sm-12 col-md-6'>
            <div className='avatar'>
              <img src={this.props.user.photoURL}/>
            </div>
            <div className='basic-infor'>
              <div className='left-block'>
                <p className='name'>
                  {this.props.profile.fullname}
                </p>
                <p className='expert'>
                  {this.props.convertContent(this.props.profile.category)}
                </p>
                <p className='rate'>
                <ReactStars
                  count={5}
                  value={this.props.profile.rate}
                  size={24}
                  color2={'#ffd700'} />
                </p>
                <button className='btn-blue'>
                  {translate('app.lawyer.online_counsel')}
                </button>
              </div>
              <div className='right-block'>
                <p className='cost'>
                  {this.props.convertContent(this.props.profile.price)} $ /
                   {translate('app.home.recent_lawyer.hour')}
                </p>
              </div>
            </div>
          </div>
          <div className='col-sm-12 col-md-6'>
            <div className='another-infor'>
              <div className='left-block'>
                <b>{translate('app.lawyer.birthday')}:</b>
                <b>{translate('app.lawyer.card_number')}:</b>
                <b>{translate('app.lawyer.certificate')}:</b>
                <b>{translate('app.lawyer.experience')}:</b>
              </div>
              <div className='right-block'>
                <p>{this.props.convertContent(this.props.profile.birthday)}</p>
                <p>{this.props.convertContent(this.props.profile.cardNumber)}</p>
                <p>{this.props.convertContent(this.props.profile.certificate)}</p>
                <p>{this.props.convertContent(this.props.profile.exp)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default HeaderBlock;
