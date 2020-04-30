import React from 'react'
import axios from 'axios'
import { displayCards, commaSeparate, flattenArray, scrub, accValExtraction, scrubDuplicates } from './DisplayCards'

var keyword, displayData

class SearchResults extends React.Component
{
  render ()
  {
    return(
      <div className = "SearchResults-container">
        <div id="SearchResults-table" style={SearchResultsTableStyle}>
          <ParseSearchResults
            isLoggedIn={this.props.isLoggedIn}
            data={this.props.data}
            handleAddToFlashCard={this.props.handleAddToFlashCard}
						handleAccUpdate={this.props.handleAccUpdate}
						pitchArray={this.props.pitchArray}
						timeToMatchProps={this.props.timeToMatchProps}
						handleTimeToMapProps={this.props.handleTimeToMapProps}
						getAccData={this.props.getAccData}
						newData={this.props.newData}
						handleNewDataSort={this.props.handleNewDataSort}
						handlePopulateData={this.props.handlePopulateData}
          />
        </div>
      </div>
    )
  }
}

const SearchResultsTableStyle =
{
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center'
}

class ParseSearchResults extends React.Component
{
  // componentDidMount()
  // {
    // displayData = displayCards(this.props.newData, this.props.handleAddToFlashCard, null, this.props.isLoggedIn)
  // }

	shouldComponentUpdate(nextProps, nextState)
	{
		// const thisPropsAccArray = this.props.newData.map( (mapData) =>
			// mapData.japanese.accValue
		// )
		// const nextPropsAccArray = nextProps.newData.map( (mapData) =>
			// mapData.japanese.accValue
		// )
		// console.log('thisPropsAccArray:', thisPropsAccArray, 'nextPropsAccArray:', nextPropsAccArray)
		// if(nextProps !== this.props)
		// {
			// console.log('CHANGE DETECTED IN PROPS', this.props, nextProps)
			// displayData = displayCards(nextProps.newData, nextProps.handleAddToFlashCard, null, nextProps.isLoggedIn)
			// return true
		// }else
		// {
			// return false
		// }
    // if( (nextProps.data.data ? nextProps.data.data : 0) === (this.props.data.data ? this.props.data.data : 0) )
    // {
      // console.log('NO CHANGE IN PROPS', this.props, nextProps)
			// console.log('MAPPING PITCH DATA', nextProps.pitchArray.length)
			// // nextProps.pitchArray.map( (pitchMap, i) => {
				// // newerData[i].japanese.accValue = pitchMap
			// // })

			// displayData = displayCards(this.props.newData, nextProps.handleAddToFlashCard, null, this.props.isLoggedIn)
			// console.log('PITCH DATA MAPPED:', this.props.newData)
      // return true
    // }else {
      // console.log('CHANGE DETECTED IN PROPS', this.props, nextProps)
      // if(nextProps.data)
      // {
        // // newerData = populateData(nextProps.data.data.data, nextProps.handleAccUpdate)
				// this.props.handlePopulateData()
        // displayData = displayCards(nextProps.newData, this.props.handleAddToFlashCard, null, this.props.isLoggedIn)
      // }

      // if(Array.isArray(this.props.newData))
      // {
        // // newerData.sort((a,b) => b.isCommon - a.isCommon)
				// this.props.handleNewDataSort()
        // this.props.newData.map( (ndMap, i) => this.props.getAccData(ndMap.japanese.kanji, i, this.props.handleAccUpdate) )
      // }
      // console.log('this.props.newData: ', this.props.newData)
      // return true
    // }
		return true
  }

  render()
  {
    displayData = displayCards(this.props.newData, this.props.handleAddToFlashCard, null, this.props.isLoggedIn)
    return(
      displayData ? displayData : null
    )
  }

}

export default SearchResults
