import React from 'react'
import PropTypes from 'prop-types'

import SearchResults from './SearchResults'

class Home extends React.Component {

  render () {
    return(
      <div className = "Home" style={style}>
        {this.props.showSearchResults ? <SearchResults
                                          pitchArray={this.props.pitchArray}
                                          isLoggedIn={this.props.isLoggedIn}
                                          handleShowDashboardResults = {this.props.handleShowDashboardResults}
                                          data={this.props.serverResponse}
                                          handleAddToFlashCard={this.props.handleAddToFlashCard}
                                          keyword={this.props.searchTerm}
																					handleAccUpdate={this.props.handleAccUpdate}
																					timeToMatchProps={this.props.timeToMatchProps}
																					handleTimeToMapProps={this.props.handleTimeToMapProps}
																					getAccData={this.props.getAccData}
																					newData={this.props.newData}
																					handleNewDataSort={this.props.handleNewDataSort}
																					handlePopulateData={this.props.handlePopulateData}
                                        />
                                      : null
        }
      </div>
    )
  }
}

const style =
{
  position: 'absolute',
  top: 0,
  left: 0,
}

export default Home
