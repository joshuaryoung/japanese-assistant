import React from 'react'
import PropTypes from 'prop-types'

function displayCards(newerData, handleAddToFlashCard, handleDelete, isLoggedIn)
{
  const style = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: '90%'
  }

  return(
    <div style={style}>
      {newerData ? (newerData.map((mapData, i) =>
        <div key={i+1} id={'result-box'+(i+1)} className={'result-box'}>
          <div className="japanese-container">
            <div className="kanji-container">
              {(i + 1) + ') ' + (Array.isArray(mapData.japanese.kanji) ? mapData.japanese.kanji.join(', ') : mapData.japanese.kanji)}
            </div>
            <div className="hiragana-container">
              {'(' + mapHiragana( mapData.japanese.hiragana ) }{mapData.japanese.accValue !== undefined ? ' Pitch Pattern:  ' + mapData.japanese.accValue + ')' : ')' }
            </div>
          </div>
          <div className="english-container">
            <div className="parts-of-speech-container">
              {(mapData.isCommon ? 'Common ' : 'Uncommon ') + mapData.partsOfSpeech }
            </div>
            <div>
              {mapEnglishDefs(mapData.englishDefinitions)}
            </div>
          </div>
          <div>
            {isLoggedIn ? (<button onClick={handleDelete ? (e) => handleDelete(mapData, i, e) : (e) => handleAddToFlashCard(mapData, i, e)}>{handleDelete ? 'Delete' : 'Save'}</button>) : null  }
          </div>
        </div>) ) : null}
    </div>
  );
}


function mapHiragana (mapData)
{
  return(commaSeparate(mapData));
}

function mapEnglishDefs (mapData)
{
  return(commaSeparate(mapData));
}

function commaSeparate(Data)
{
  let buffer = [], bufferIndex = 0, flatArray = flattenArray(Data);
  if(Array.isArray(flatArray))
  {
    for(let k = 0; k < flatArray.length; k++)
    {
      buffer[bufferIndex] = flatArray[k];
      bufferIndex++;
    }
  }

  return (buffer[0] ? buffer.join(', ') : '');
}


function flattenArray(data)
{
  let flatArray = [];
  function flattenHelper(arr)
  {
    if(Array.isArray(arr))
    {
      for (var i = 0; i < arr.length; i++)
      {
        if(Array.isArray(arr[i]))
        {
          flattenHelper(arr[i]);
        }else {
          if(arr[i])
           flatArray.push(arr[i]);
        }
      }
    }else {
      if(data)
        flatArray.push(data);
    }

    return flatArray;
  }
  flattenHelper(data);
  return flatArray;
}


const scrubDuplicates = (data) =>
{
  let flatData = flattenArray (data);

  if(Array.isArray(flatData))
  {
    let dupIndex;
    for (var i = flatData.length -1; i >= 0 ; i--)
    {
      dupIndex = flatData.indexOf(flatData[i]);
      if(dupIndex !== i && dupIndex !== -1)
      {
        flatData.splice(dupIndex, 1);
      }
    }
		
    return flatData;
  }else{
    return flatData;
  }
}

const accValExtraction = (data) =>
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

const scrub = (searchTerm, data)  =>
{
  if(searchTerm === 'null')
  {
    let bufferArray = flattenArray(data);
    return (bufferArray)
  }
  else // FUNCTION WILL SCRUB SEARCH TERMS
  {
    let isMatch, bufferArray = flattenArray(data);

    if(Array.isArray(bufferArray))
    {
      isMatch = bufferArray.indexOf(searchTerm);
      for(let i = 0; i < bufferArray.length ; i++)
      {
        while(isMatch > -1)
        {
          bufferArray.splice(isMatch, 1);
          isMatch = bufferArray.indexOf(searchTerm);
        }
      }
      return (bufferArray[0] ? bufferArray[0] : null );
    }else {
      isMatch = bufferArray.indexOf(searchTerm);

      while(isMatch > -1)
      {
        bufferArray.splice(isMatch, 1);
        isMatch = bufferArray.indexOf(searchTerm);
      }
      return bufferArray;
    }
  }
}

export {displayCards, commaSeparate, flattenArray, scrub, accValExtraction, scrubDuplicates};
