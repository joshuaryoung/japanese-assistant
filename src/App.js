import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { TransitionGroup, CSSTransition } from "react-transition-group"
import axios from 'axios'

import Home from './components/Home'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import UserLogin from './components/UserLogin'
import AddUser from './components/AddUser'
import UserDashboard from './components/UserDashboard'
import { displayCards, commaSeparate, flattenArray, scrub, accValExtraction, scrubDuplicates } from './components/DisplayCards'

import './App.css'

const mongoUrl = `http://localhost:${process.env.REACT_APP_SERVER_PORT}/mongo`,
      fbAuthUrl = `http://localhost:${process.env.REACT_APP_SERVER_PORT}/auth/facebookProxy`,
      jishoUrl = `http://localhost:${process.env.REACT_APP_SERVER_PORT}/`,
			wikiUrl = `http://localhost:${process.env.REACT_APP_SERVER_PORT}/acc`,
			sectionsParams = {action: 'parse', prop: 'sections', format: 'json'},
			pronunciationParams = {action: 'parse', prop: 'wikitext', format: 'json'},
			accRegex = /(acc.=\S|acc=\S)/m,
			initialData = [{
				isCommon: null,
				partsOfSpeech: null,
				englishDefinitions: null,
				japanese: {
					kanji: null,
					hiragana: null,
					accValue: null
				}
			}]
			
var keyword, newData = initialData, callBackCounter

class App extends Component {
  constructor(props)
  {
    super(props)

    this.initialState = {
      cards: [],
			sData: [],
      showSearchResults: false,
      showDashboardResults: false,
      isLoggedIn: false,
			timeToMapProps: false,
      id: '',
      pic: '',
      email: '',
      name: '',
      serverResponse: '',
			pitchArray: null
    }

    this.state = this.initialState
		if (this.state.isLoggedIn) {
			this.fetchCardsFromDB()
		}
  }
	
	handleNewDataSort = () =>
	{
		newData.sort((a,b) => b.isCommon - a.isCommon)
	}
	
	handlePopulateData = (newerData) =>
	{
		newerData = ( newerData ? newerData.map((mapData, i) => ({isCommon: mapData.is_common, japanese: {kanji: scrubDuplicates(flattenArray(mapData.japanese.map((jdata, k) => ( jdata.word ) ))), hiragana: scrubDuplicates(mapData.japanese.map((jdata) => (jdata.reading)))}, englishDefinitions: mapData.senses.map((sData) => sData.english_definitions.map((EDData) => EDData)), partsOfSpeech: commaSeparate(scrub('Wikipedia Definition', scrubDuplicates(mapData.senses.map((sData) => sData.parts_of_speech) ) ))})) : '')

		return newerData
	}

  handleInputChange = (e) =>
  {
    keyword = e.target.value
  }

  initializeSearchVars = () =>
  {
    newData = ''
		callBackCounter = 0
    this.setState({pitchArray: []})
  }
	
	accValExtraction = (data) =>
	{
		let accVal = -1, equalSignIndex = -1
		equalSignIndex = data.indexOf('=')
		if(equalSignIndex > -1)
		{
			accVal = data[equalSignIndex+1]
		}

		if(accVal === 'h')
		{
			accVal = 0
		}
		if(accVal === 'a')
		{
			accVal = 1
		}
		if(accVal === 'n')
		{
			accVal = 2
		}
		if(accVal === 'o')
		{
			accVal = 3
		}
		accVal = parseInt(accVal)

		return accVal
	}
	
	getAccData = () =>
	{
		if(newData)
		{
			if(Array.isArray(newData)) // IF DATA IS AN ARRAY
			{
				let sections, pWikiText, pIndex = -1, accValue, accString
				callBackCounter = newData.length
				newData.map( (mapData, i) =>
				{
					axios.get(wikiUrl, {params: {...sectionsParams, page: mapData.japanese.kanji[0] ? mapData.japanese.kanji[0] : mapData.japanese.hiragana[0]}})
					.then((response) =>  // SECTION SUCCESS
					{
						console.log('Section CALLBACK success')
						if(response.data.parse)
						{
							let japaneseSecFound = false
							sections = response.data.parse.sections
							sections.map( (secMap, k) => // FIND JAPANESE SECTION
							{
								if(japaneseSecFound && secMap.line === 'Pronunciation') // IF JAPANESE SEC FOUND AND K REPRESENTS
								{																												// THE PRONUNCIATION SECTION
									pIndex = k+1
									k = sections.length
									axios.get(wikiUrl, {params: {...pronunciationParams, page: mapData.japanese.kanji[0] ? mapData.japanese.kanji[0] : mapData.japanese.hiragana[0], section: pIndex}})
								  .then(response => // PRONUNCIATION SUCCESS
								  {
										console.log('Pronunciation CALLBACK success. i:', i, 'k:', k)
										if(response.data.parse) // IF DATA COMES BACK IN THE CORRECT FORMAT
										{
											pWikiText = response.data.parse.wikitext['*']
											accString = pWikiText.match(accRegex)
											if(accString) // IF ACC STRING IS FOUND
											{
												accValue = this.accValExtraction(accString[0])
											}
											if(accValue > -1) // ACC VALUE IS ACTUAL PITCH VALUE
											{
												newData[i].japanese.accValue = accValue
												console.log('handleSDataUpdate about to be called and accValue was found')
												this.handleSDataUpdate()
												if(callBackCounter === 1)
												{
													console.log('DONE LOADING ACC DATA')
												}else
												{
													console.log('callBackCounter:', callBackCounter, 'mapData.japanese.kanji:', mapData.japanese.kanji[0] ? mapData.japanese.kanji : mapData.japanese.hiragana)
													callBackCounter --
												}
											}else // ACC VALUE NOT AVAILABLE
											{  
												console.log('handleSDataUpdate about to be called and acc value not available')
												this.handleSDataUpdate()
												throw 'no accent value found in accString'
											}
										}else // WIKTIONARY ENTRY NOT FOUND
										{
											console.log('handleSDataUpdate about to be called')
											this.handleSDataUpdate()
											throw 'wiktionary entry not found'
										}
									})
									.catch(error => // PRONUNCIATION ERROR
									{
										console.log('handleSDataUpdate about to be called')
										this.handleSDataUpdate()
										console.log('Pronunciation callback error: ', error, 'i:', i)
										if(callBackCounter === 1)
										{
											console.log('DONE LOADING ACC DATA', 'mapData.japanese.kanji:', mapData.japanese.kanji[0] ? mapData.japanese.kanji : mapData.japanese.hiragana)
										}else
										{
											console.log('callBackCounter:', callBackCounter, 'mapData.japanese.kanji:', mapData.japanese.kanji ? mapData.japanese.kanji : mapData.japanese.hiragana)
											callBackCounter --
										}
									})
								}
								
								//AFTER JAPANESE SECTION IS FOUND OR LOOP FINISHES
								if(k + 1 === sections.length)
								{
									console.log('callBackCounter:', callBackCounter)
									callBackCounter --
									if(!japaneseSecFound) // NO JAPANESE SECTION FOUND
									{
										console.log('handleSDataUpdate about to be called')
										this.handleSDataUpdate()
										console.log('No Japanese Section Found')
										throw 'No Japanese Section Found'
									}
									if (pIndex === -1) // NO PRONUNCIATION SECTION
									{
										console.log('handleSDataUpdate about to be called')
										this.handleSDataUpdate()
										throw 'No pronunciation section found'
									}
								}
								
								if(!japaneseSecFound && secMap.line === 'Japanese')
								{
									japaneseSecFound = true
								}
							})
							
							
						}
					})
					.catch(error =>  // SECTION ERROR
					{
						console.log('handleSDataUpdate about to be called, callBackCounter', callBackCounter)
						this.handleSDataUpdate()
						console.log('Section error:', error)
						if(callBackCounter === 1)
						{
							console.log('DONE LOADING ACC DATA')
						}else
						{
							console.log('callBackCounter:', callBackCounter, 'mapData.japanese.kanji:', mapData.japanese.kanji[0] ? mapData.japanese.kanji : mapData.japanese.hiragana)
							callBackCounter --
						}
					})
					
				})
			}
			
			
			
			
			
			
			
			
			
			
			// else
			// {
				
						
							
							
						// }else {
							// throw 'wiktionary entry not found'
						// }
					// },
				 // response => //ERROR CALLBACK
					// {
						// console.log('CALLBACK ERROR from', data, response)
					// })
					// .then(response =>
				 // {
					 // , response => console.log('CALLBACK ERROR from', data, response))
			 // }, response => console.log('CALLBACK ERROR from', data, response))
			// }
		// }
		// // data.prototype.accValue = accValue
		// return data
		}
	}

  handleSDataUpdate = (pitchVal, key) =>
  {
		let pitchArrayBuffer = newData.map( mData => mData.japanese.accValue )
    console.log('handleSDataUpdate called')
    console.log('newData', newData, 'pitchArrayBuffer', pitchArrayBuffer)
		this.setState({sData: newData, pitchArray: pitchArrayBuffer})
  }

  handleSubmitClick = (e) =>
  {
    e.preventDefault()
    this.initializeSearchVars()
    let searchTerm = keyword
    axios.get(jishoUrl, {params: {keyword: '"'+ searchTerm + '"'}})
		.then(response =>
		{
      this.handleShowSearchResults()
      this.handleSearchCallBack(response)
    },
    error => 
		{
			this.setState({serverResponse: error, isDisplayingResults: true})
			console.log(error)
		})
  }

  handleSearchCallBack = (response) =>
  {
		newData = this.handlePopulateData(response.data.data)
		this.handleNewDataSort()
		this.getAccData()
    this.setState({serverResponse: response, sData: newData})
  }

  handleLogout = (e) =>
  {
    e.preventDefault()
    window.FB.logout()
    this.setState(this.initialState)
    console.log("handleLogout called")
  }

  responseFacebook = response =>
  {
    this.setState({
      isLoggedIn: true,
      id: response.id,
      pic: response.picture.data.url,
      email: response.email,
      name: response.name
    })
    this.fetchCardsFromDB()
  }

  handleSaveFlashCardsToDB = (e) =>
  {
    axios.get(mongoUrl+'updatecards', {params: {id: this.state.id, cards: this.state.cards}}).then(response => console.log(response.data), response => console.log(response))
  }

  handleAddToFlashCard = (data, i, e) =>
  {
    let cardsCopy = this.state.cards
    cardsCopy.push(data)
    this.handleShowDashboardResults()
    this.setState({cards: cardsCopy})
    this.handleSaveFlashCardsToDB()
  }

  handleDelete = (data, i, e) =>
  {
    let cardsCopy = this.state.cards
    cardsCopy.splice(i,1)
    if(cardsCopy.length < 1)
    {
      this.setState({
        showDashboardResults: false
      })
    }
    this.setState({cards: cardsCopy})
    this.handleSaveFlashCardsToDB()
  }

  handleShowSearchResults = () =>
  {
    this.setState({
      showSearchResults: true
    })
  }

  handleShowDashboardResults = () =>
  {
    this.setState({
      showDashboardResults: true
    })
  }

  fetchCardsFromDB = () =>
  {
    axios.get(mongoUrl+'readcards', {params: {id: this.state.id}})
    .then( (value) =>
      {
        this.setState({cards: value.data, showDashboardResults: true})
      },
      (response) =>
      {
        console.log(response)
        return response
      }
    )
  }

  render() {
    return (
      <div className="App">
        <Router className = "Router">
          <Route className = "Route" render = { ( {location} ) =>
            <div className = "RouteDiv">
              <NavBar
                handleInputChange={this.handleInputChange}
                handleSubmitClick={this.handleSubmitClick}
                links={navLinks}
                handleSearchCallBack={this.handleSearchCallBack}
                handleShowDashboardResults = {this.handleShowDashboardResults}
                showSearchResults = {this.state.showSearchResults}
                handleShowSearchResults = {this.handleShowSearchResults}
                handleAddToFlashCard = {this.state.handleAddToFlashCard}
                isLoggedIn={this.state.isLoggedIn}
                activeLocation = {location.pathname}
                brand = "Japanese Vocab Assitant"
                motto = "Learn it right, the first time."
                isLoggedIn = {this.state.isLoggedIn}
                handleLogout = {this.handleLogout}
                highlightEffect = {false}
              />
              <TransitionGroup>
                <CSSTransition key = {location.key} classNames="fade" timeout={{enter:0, exit:300}}>
                  <Switch location = {location}>
                    <Route exact path = "/" render=
                    {
                      (rProps)=> // HOME
                        <Home
                          {...rProps}
                          pitchArray={this.state.pitchArray}
                          serverResponse={this.state.serverResponse}
                          searchTerm={this.state.searchTerm}
                          isLoggedIn={this.state.isLoggedIn}
                          handleShowDashboardResults = {this.handleShowDashboardResults}
                          showSearchResults = {this.state.showSearchResults}
                          handleAddToFlashCard = {this.handleAddToFlashCard}
													handleAccUpdate={this.handleAccUpdate}
													timeToMatchProps={this.state.timeToMatchProps}
													handleTimeToMapProps={this.handleTimeToMapProps}
													getAccData={this.getAccData}
													newData={this.state.sData}			
													handleNewDataSort={this.handleNewDataSort}
													handlePopulateData={this.handlePopulateData}
                        />
                    } />
                  <Route exact path = "/UserLogin" render={ (rProps)=> // HOME
                        <UserLogin
                           handleLogout={this.handleLogout}
                           componentClicked={this.componentClicked}
                           responseFacebook={this.responseFacebook}
                           isLoggedIn={this.state.isLoggedIn}
                           pic={this.state.pic}
                           email={this.state.email}
                           name={this.state.name}
                           {...rProps}
                        />
                    } />
                    <Route exact path = "/AddUser" render={ (rProps)=> // HOME
                        <AddUser  {...rProps} />
                    } />
                  <Route exact path = "/UserDashboard" render={ (rProps)=> // HOME
                        <UserDashboard
                          isLoggedIn = {this.state.isLoggedIn}
                          showDashboardResults = {this.state.showDashboardResults}
                          handleDelete = {this.handleDelete}
                          handleAddToFlashCard = {this.handleAddToFlashCard}
                          flashCards = {this.state.cards.length > 0 ? this.state.cards : null} {...rProps}
                        />
                    } />
                    <Route render={() => <div>Not Found</div>} />
                  </Switch>
                </CSSTransition>
              </TransitionGroup>
              <Footer />
            </div>
          } />
        </Router>
      </div>
    )
  }
}

const navLinks = [
  {name:'Home', component: Home, routeLocation: '/', activeLinkHighlight: {x: '32.9vw', y: '0vh'}},
  {name:'UserLogin', component: UserLogin, routeLocation: '/UserLogin', activeLinkHighlight: {x: '32.9vw', y: '0vh'}},
  {name:'AddUser', component: AddUser, routeLocation: '/AddUser', activeLinkHighlight: {x: '32.9vw', y: '0vh'}},
  {name:'UserDashboard', component: UserDashboard, routeLocation: '/UserDashboard', activeLinkHighlight: {x: '32.9vw', y: '0vh'}}
]

export default App
