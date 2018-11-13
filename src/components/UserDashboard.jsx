import React from 'react'
import PropTypes from 'prop-types'
import { displayCards, commaSeparate, flattenArray } from './DisplayCards';

class UserDashboard extends React.Component
{
  render ()
  {
    return(
      <div>
        {this.props.showDashboardResults ? displayCards(this.props.flashCards, this.props.handleAddToFlashCard, this.props.handleDelete, this.props.isLoggedIn) : 'No flashcards have been saved!'}
      </div>
    );
  }
}

export default UserDashboard;
