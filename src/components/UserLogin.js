import React from 'react'
import PropTypes from 'prop-types'
import { GoogleLogin } from 'react-google-login'
import FacebookLogin from 'react-facebook-login'

class UserLogin extends React.Component
{
  render ()
  {
    let fbContent = (this.props.isLoggedIn ?
      <div>
        <img src={this.props.pic}></img>
        Welcome {this.props.name}
        <button onClick={this.props.handleLogout}>
          Logout
        </button>
      </div> : <FacebookLogin
        appId={process.env.REACT_APP_FACEBOOK_AP_ID}
        autoLoad={false}
        isMobile={false}
        fields="name,email,picture"
        onClick={this.props.componentClicked}
        callback={this.props.responseFacebook}
        />)

    return(
      <div>
        {fbContent}
      </div>
    )
  }
}

const style=
{
  textAlign: 'center'
}

export default UserLogin
