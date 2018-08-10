import React, { Component } from 'react';
import { NavLink } from "react-router-dom";

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
			<div className = "nav-container">
				<Brand brand = {this.props.brand} />
				{this.props.links ? <JsxLinks links = {this.props.links} /> : null}
        {this.props.highlightEffect ? <div className = "navbar-highlight-effect" style = {{position: 'absolute', top: activeLinkHighlight.y, left: activeLinkHighlight.x}} /> : null}
        {this.props.motto ? <Motto motto = {this.props.motto} /> : null}
        {this.props.login ? <Login /> : null}
			</div>
    );
  }
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
			Log In / Sign Up
		</div>
	);
}

export default NavBar;
