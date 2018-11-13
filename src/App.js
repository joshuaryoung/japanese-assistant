import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import axios from 'axios';

import Home from './components/Home';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import UserLogin from './components/UserLogin';
import AddUser from './components/AddUser';
import UserDashboard from './components/UserDashboard';
import { displayCards, commaSeparate, flattenArray, scrub, accValExtraction, scrubDuplicates } from './components/DisplayCards';

import './App.css';

const mongoUrl = 'http://localhost:3001/mongo',
      fbAuthUrl = 'http://localhost:3001/auth/facebookProxy',
      jishoUrl = 'http://localhost:3001/',
			wikiUrl = 'http://localhost:3001/acc',
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
			}];
			
var keyword, newData = initialData, accAsyncTotal;

class App extends Component {
  constructor(props)
  {
    super(props);

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
			pitchArray: []
    };

    this.state = this.initialState;
  }
	
	handleNewDataSort = () =>
	{
		newData.sort((a,b) => b.isCommon - a.isCommon);
	}
	
	handlePopulateData = (newerData) =>
	{
		newerData = ( newerData ? newerData.map((mapData, i) => ({isCommon: mapData.is_common, japanese: {kanji: scrubDuplicates(flattenArray(mapData.japanese.map((jdata, k) => ( jdata.word ) ))), hiragana: scrubDuplicates(mapData.japanese.map((jdata) => (jdata.reading)))}, englishDefinitions: mapData.senses.map((sData) => sData.english_definitions.map((EDData) => EDData)), partsOfSpeech: commaSeparate(scrub('Wikipedia Definition', scrubDuplicates(mapData.senses.map((sData) => sData.parts_of_speech) ) ))})) : '');

		return newerData;
	}

  handleInputChange = (e) =>
  {
    keyword = e.target.value;
  }

  initializeSearchVars = () =>
  {
    newData = '';
		accAsyncTotal = 0;
    this.setState({pitchArray: []});
  }
	
	accValExtraction = (data) =>
	{
		let accVal = -1, equalSignIndex = -1;
		equalSignIndex = data.indexOf('=');
		if(equalSignIndex > -1)
		{
			accVal = data[equalSignIndex+1];
		}

		if(accVal === 'h')
		{
			accVal = 0;
		}
		if(accVal === 'a')
		{
			accVal = 1;
		}
		if(accVal === 'n')
		{
			accVal = 2;
		}
		if(accVal === 'o')
		{
			accVal = 3;
		}
		accVal = parseInt(accVal);

		return accVal;
	}
	
	getAccData = () =>
	{
		if(newData)
		{
			if(Array.isArray(newData)) // IF DATA IS AN ARRAY
			{
				let sections, pWikiText, pIndex = -1, accValue, accString;
				newData.map( (mapData, i) =>
				{
					axios.get(wikiUrl, {params: {...sectionsParams, page: mapData.japanese.kanji[0]}})
					.then((response) =>
					{
						if(response.data.parse)
						{
							let japaneseSecFound = false;
							sections = response.data.parse.sections;
							// FIND JAPANESE SECTION
							sections.map( (secMap, k) => 
							{
								if(japaneseSecFound && secMap.line === 'Pronunciation')
								{
									pIndex = k+1;
									console.log(mapData.japanese.kanji, 'Pronunciation section:', pIndex);
									k = sections.length;
									console.log('mapData[' + i + ']', mapData)
									axios.get(wikiUrl, {params: {...pronunciationParams, page: mapData.japanese.kanji[0], section: pIndex}})
									 .then(response =>
									 {
										 if(response.data.parse)
										 {
											 pWikiText = response.data.parse.wikitext['*'];
											 accString = pWikiText.match(accRegex);
											 if(accString)
											 {
												 console.log(mapData.japanese.kanji, accString, accString[0]);
												 accValue = this.accValExtraction(accString[0]);
											 }
											 if(accValue > -1)
											 {
												 newData[i].japanese.accValue = accValue;
												 console.log(mapData, accValue);
												 console.log(mapData, pWikiText);
												if(i + 1 == newData.length) // LOGIC TO DETERMINE IF THIS IS THE LAST CALLBACK
												{
													console.log('handleSDataUpdate about to be called');
													this.handleSDataUpdate();
												}
											 }else {
												 if(i + 1 == newData.length) // LOGIC TO DETERMINE IF THIS IS THE LAST CALLBACK
													{
														console.log('handleSDataUpdate about to be called');
														this.handleSDataUpdate();
													}
												 throw 'no accent value found in accString'
											 }
										 }else {
											 if(i + 1 == newData.length) // LOGIC TO DETERMINE IF THIS IS THE LAST CALLBACK
													{
														console.log('handleSDataUpdate about to be called');
														this.handleSDataUpdate();
													}
											 throw 'wiktionary entry not found';
										 }
									 })
									 .catch(error =>
										{
											if(i + 1 == newData.length) // LOGIC TO DETERMINE IF THIS IS THE LAST CALLBACK
											{
												console.log('handleSDataUpdate about to be called');
												this.handleSDataUpdate();
											}
											console.log(error);
										})
								}
								if(!japaneseSecFound && secMap.line === 'Japanese')
								{
									japaneseSecFound = true;
									console.log(mapData, 'Japanese Section: ', k+1);
								}
							});
							if(!japaneseSecFound)
							{
								if(i + 1 == newData.length) // LOGIC TO DETERMINE IF THIS IS THE LAST CALLBACK
								{
									console.log('handleSDataUpdate about to be called');
									this.handleSDataUpdate();
								}
								console.log('No Japanese Section Found');
								throw 'No Japanese Section Found';
							}
							if (pIndex === -1)
							{
								if(i + 1 == newData.length) // LOGIC TO DETERMINE IF THIS IS THE LAST CALLBACK
								{
									console.log('handleSDataUpdate about to be called');
									this.handleSDataUpdate();
								}
								throw 'No pronunciation section found'
							}
						}
					})
					.catch(error =>
					{
						if(i + 1 == newData.length) // LOGIC TO DETERMINE IF THIS IS THE LAST CALLBACK
						{
							console.log('handleSDataUpdate about to be called');
							this.handleSDataUpdate();
						}
						console.log(error);
					})
					
				});
			}
			
			
			
			
			
			
			
			
			
			
			// else
			// {
				
						
							
							
						// }else {
							// throw 'wiktionary entry not found';
						// }
					// },
				 // response => //ERROR CALLBACK
					// {
						// console.log('CALLBACK ERROR from', data, response);
					// })
					// .then(response =>
				 // {
					 // , response => console.log('CALLBACK ERROR from', data, response))
			 // }, response => console.log('CALLBACK ERROR from', data, response));
			// }
		// }
		// // data.prototype.accValue = accValue;
		// return data;
		}
	}

  handleSDataUpdate = (pitchVal, key) =>
  {
    console.log('handleSDataUpdate called');
    console.log('sData:', this.state.newData, 'newData', newData);
		this.setState({sData: newData})
  }

  handleSubmitClick = (e) =>
  {
    e.preventDefault();
    this.initializeSearchVars();
    let searchTerm = keyword;
    axios.get(jishoUrl, {params: {keyword: '"'+ searchTerm + '"'}})
		.then(response =>
		{
      this.handleShowSearchResults();
      this.handleSearchCallBack(response);
    },
    error => 
		{
			this.setState({serverResponse: error, isDisplayingResults: true})
			console.log(error);
		});
  }

  handleSearchCallBack = (response) =>
  {
		newData = this.handlePopulateData(response.data.data);
		console.log('NEWDATA:', newData)
		this.getAccData();
    this.setState({serverResponse: response, sData: newData});
  }

  handleLogout = (e) =>
  {
    e.preventDefault();
    window.FB.logout();
    this.setState(this.initialState);
    console.log("handleLogout called");
  }

  responseFacebook = response =>
  {
    this.setState({
      isLoggedIn: true,
      id: response.id,
      pic: response.picture.data.url,
      email: response.email,
      name: response.name
    });
    this.fetchCardsFromDB();
    console.log('responseFacebook called', this.state);
  }

  handleSaveFlashCardsToDB = (e) =>
  {
    console.log('FLASHCARDS SAVED', this.state.cards);
    axios.get(mongoUrl+'updatecards', {params: {id: this.state.id, cards: this.state.cards}}).then(response => console.log(response.data), response => console.log(response));
  }

  handleAddToFlashCard = (data, i, e) =>
  {
    console.log('Add to flashcard for: ', i+1);
    let cardsCopy = this.state.cards;
    cardsCopy.push(data);
    this.handleShowDashboardResults();
    this.setState({cards: cardsCopy});
    this.handleSaveFlashCardsToDB();
  }

  handleDelete = (data, i, e) =>
  {
    let cardsCopy = this.state.cards;
    cardsCopy.splice(i,1);
    console.log(cardsCopy);
    if(cardsCopy.length < 1)
    {
      this.setState({
        showDashboardResults: false
      })
    }
    this.setState({cards: cardsCopy});
    this.handleSaveFlashCardsToDB();
  }

  handleShowSearchResults = () =>
  {
    this.setState({
      showSearchResults: true
    });
  }

  handleShowDashboardResults = () =>
  {
    this.setState({
      showDashboardResults: true
    });
  }

  fetchCardsFromDB = () =>
  {
    axios.get(mongoUrl+'readcards', {params: {id: this.state.id}})
    .then( (value) =>
      {
        console.log('line 108 success');
        console.log(value.data);
        this.setState({cards: value.data, showDashboardResults: true});
      },
      (response) =>
      {
        console.log('line 114 error');
        console.log(response)
        return response;
      }
    );
  }

  componentDidMount()
  {
    this.state.isLoggedIn ? this.fetchCardsFromDB() : null
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
    );
  }
}

const navLinks = [
  {name:'Home', component: Home, routeLocation: '/', activeLinkHighlight: {x: '32.9vw', y: '0vh'}},
  {name:'UserLogin', component: UserLogin, routeLocation: '/UserLogin', activeLinkHighlight: {x: '32.9vw', y: '0vh'}},
  {name:'AddUser', component: AddUser, routeLocation: '/AddUser', activeLinkHighlight: {x: '32.9vw', y: '0vh'}},
  {name:'UserDashboard', component: UserDashboard, routeLocation: '/UserDashboard', activeLinkHighlight: {x: '32.9vw', y: '0vh'}}
];

export default App;
