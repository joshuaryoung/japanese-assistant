import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

class SearchBar extends React.Component {

  render () {
    return(
      <div className = "SearchBar">
        <SearchForm
          handleSubmitClick = {this.props.handleSubmitClick}
          handleInputChange = {this.props.handleInputChange}
        />
      </div>
    );
  }
}

function SearchForm(props)
{
  const style =
  {
    display: 'flex',
    justifyContent: 'center'
  }
  return(
    <form id="SearchBar-form" style = {style}>
      <input type="text" name="keyword" placeholder="Search" onChange={props.handleInputChange}/>
      <input onClick={props.handleSubmitClick} type="submit" value="Submit" />
    </form>
  );
}

export default SearchBar;
