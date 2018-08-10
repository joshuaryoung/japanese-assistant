import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

class SearchBar extends React.Component {
  constructor(props)
  {
    super(props);
    this.state = {keyword: ''};
  }

  handleInputChange(e)
  {
    this.setState({keyword: e.target.value});
  }

  handleSubmitClick(e)
  {
    e.preventDefault();
    axios.get(message, {params: {keyword: this.state.keyword}}).then(response => console.log(response));
  }
  render () {
    return(
      <div className = "SearchBar">
        <form onSubmit={this.handleSubmitClick.bind(this)} id="SearchBar-form">
          <input type="text" name="keyword" placeholder="Search" onChange={this.handleInputChange.bind(this)}/>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

const message = 'https://jisho.org/api/v1/search/words';

export default SearchBar;
