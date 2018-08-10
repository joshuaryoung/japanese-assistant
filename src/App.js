import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import Home from './components/Home';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router className = "Router">
          <Route className = "Route" render = { ( {location} ) =>
            <div className = "RouteDiv">
              <NavBar activeLocation = {location.pathname} brand = "Japanese Vocab Assitant" motto = "Learn it right, the first time." login = {true} highlightEffect = {false} />
              <TransitionGroup>
                <CSSTransition key = {location.key} classNames="fade" timeout={{enter:0, exit:300}}>
                  <RoutePaths location = {location}/>
                </CSSTransition>
              </TransitionGroup>
              <Footer />
            </div>
          } />
        </Router>
      </div>
    );
  }
}

const navLinks = [
  {name:'Home', component: Home, routeLocation: '/', activeLinkHighlight: {x: '32.9vw', y: '0vh'}}
];

function RoutePaths(props)
{
  return(
    <Switch location = {props.location}>
      {navLinks.map( (link, i) => <Route key={i} exact path = {link.routeLocation} component={link.component} /> )}
      <Route render={() => <div>Not Found</div>} />
    </Switch>
  );
}

export default App;
