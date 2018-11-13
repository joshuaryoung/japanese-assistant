import React, { Component } from 'react';
import { NavLink } from "react-router-dom";

import SearchBar from './SearchBar';

var activeLinkHighlight = {x: 0, y: 0};

class NavBar extends Component
{
  render()
	{
		if (this.props.activeLocation && this.props.links)
		{
      for (var i = 0; i < this.props.links.length; i++)
      {
        if(this.props.links[i].routeLocation === this.props.activeLocation)
        {
  				activeLinkHighlight = this.props.links[i].activeLinkHighlight;
        }
      }
		}

    return (
			<div className = "nav-container" style={style}>
				<Brand brand = {this.props.brand} />
				{this.props.links ? <JsxLinks links = {this.props.links} /> : null}
        {this.props.highlightEffect ? <div className = "navbar-highlight-effect" style = {{position: 'absolute', top: activeLinkHighlight.y, left: activeLinkHighlight.x}} /> : null}
          <SearchBar
            handleInputChange={this.props.handleInputChange}
            handleSubmitClick={this.props.handleSubmitClick}
            isLoggedIn={this.props.isLoggedIn}
            handleSearchCallBack={this.props.handleSearchCallBack}
            handleShowSearchResults = {this.props.handleShowSearchResults}
          />
        {this.props.motto ? <Motto motto = {this.props.motto} /> : null}
        {this.props.isLoggedIn ? <a href="#" onClick = { this.props.handleLogout } > Logout </a> : <Login />}
			</div>
    );
  }
}

const style =
{
  backgroundColor: 'gray',
  display: 'flex',
  justifyContent: 'space-evenly',
  position: 'absolute',
  width: '100%',
  zIndex: 2,
  top: 0,
  left: 0
}

function JsxLinks(props)
{
	return (
		<div className = "jsxLinks-container">
			{props.links ? props.links.map( (navLinks) => <NavLink key = {navLinks.name} to={navLinks.routeLocation}>{navLinks.name}</NavLink>) : ''}
		</div>
	);
}

function Brand(props)
{
	return (
		<div className = "brand">
			{props.brand}
		</div>
	);
}

function Motto(props)
{
	return (
		<div className = "motto">
			{props.motto}
		</div>
	);
}

function Login(props)
{
	return (
		<div className = "login">
			<NavLink to='/UserLogin'>Log In</NavLink> / <NavLink to='/AddUser'>Sign Up</NavLink>
		</div>
	);
}

export default NavBar;
