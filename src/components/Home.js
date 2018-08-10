import React from 'react';
import PropTypes from 'prop-types';

import SearchBar from './SearchBar';

class Home extends React.Component {
  render () {
    return(
      <div className = "Home">
        <SearchBar />
      </div>
    );
  }
}

export default Home;
