/*
  Nancy Kim and Ananya Suthram
  1/19/2024

  ClothingRecommendation.js is the backend file for Geo Dresser project.
  This program takes zipcode input and uses Open Weather API to obtain weather data,
  or takes hypothetical weather data. Using either weather data, this pogram
  creates a prompt that asks Open AI API for clothing recommendations, and uses 
  Google Custom Search API to obtain images & website links of recommended 
  clothing pieces.
*/

/*
  zipSubmit() function takes zipcode input from trial.html to
  call fetchWeather() function
*/
function zipSubmit() {
    var zipcode = document.getElementById("zipcode").value;
    console.log(`Zipcode: ${zipcode}`);
    
    if (!zipcode) {
        alert("Input zipcode");
    }
    else {
        fetchWeather(zipcode);
    }
}

/*
  fetchWeather() function takes a parameter of the user's zipcode to call
  Current Weather Data API. From the API's JSON response, the city name, current
  temperature, weather description, and matching icon are extracted.
  The function calls getRecommendation() function with the weather data.
*/
function fetchWeather(zipcodeP) {
  const zipcode = zipcodeP;
  const apiKey = CONFIG.OPENWEATHER_API_KEY;
  const apiEndpoint = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode}&appid=${apiKey}&units=imperial`;

  // call Open Weather API with custom api key and zipcode
  fetch(apiEndpoint)
  .then(response => response.json())
  .then(data => {
    // extract specific data from JSON response
    const city = data.name;
    const temp = data.main.temp;
    const descr = data.weather[0].description;
    const iconID = data.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconID}@2x.png`;
    
    console.log(`City: ${city}`);
    console.log(`Current Temperature: ${temp}F`);
    console.log(`Current Weather: ${descr}`);
    console.log(`Weather icon: ${iconID}`);

    // display weather data on website through trial.html
    document.getElementById("city").innerHTML = city;
    document.getElementById("weatherData").innerHTML = temp + "F, " + descr;
    document.getElementById('weatherIcon').src = iconUrl;
    document.getElementById('selectedWeather').value = descr;

    const weatherIcon = document.getElementById('weatherIcon');
    weatherIcon.style.display = 'block';
    
    // call getRecommendation() method with weather data
    getRecommendation(temp, descr);
  })
  .catch(error => {
    alert('Error fetching weather data.');
  });
}

/*
  getRecommendation() function takes two parameters for temperature
  and weather description to create a prompt that asks for clothing
  recommendations. Open AI API is called with the prompt and responds with
  a string of clothing recommendations. The function calls formatQueries() 
  with the string response.
*/
async function getRecommendation(tempP, descrP) {
  const prompt = "The weather is " + tempP + " degrees F and " + descrP + 
  ". Give me 1 outerwear, 1 top, 1 bottom, and 1 shoe recommendation." +
   "Format like this: outerwear: heavy down jacket. Don't use 'or'";

  if (!prompt) {
      alert('Prompt error.');
      return;
  }

  const apiKey = CONFIG.OPENAI_API_KEY;
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  var response;

  // conditions of the open ai chat
  const data = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  }

  // call Open AI API with the prompt
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
  })
  .then(data => {
    // save open ai's string reponse
    response = data.choices[0].message.content;
    console.log(response);

    // call formatQueries() to modify the string response
    formatQueries(response);
  })
  .catch(error => {
    alert('Error fetching data from OpenAI API.');
  });
}

/*
  formatQueries() takes a parameter of a string and
  modifies it to create an array of clothing items. The function
  calls searchImages() with the new array.
*/
function formatQueries(response) {
  // split string into clothing items and add to an array
  const linesArray = response.split('\n');
  const modifiedArray = linesArray.map(line => line.replace(/^[^:]+: /, ' '));
  console.log(modifiedArray);

  // display clothing suggestions to user through trial.html
  document.getElementById("openAI").innerHTML = modifiedArray;

  // call searchImages() function with the array of clothing items
  searchImages(modifiedArray);
}

// variables used in searchImages(), displayImage() and refresh() functions
var itemIndex = [0, 0, 0, 0];
var dataArray = [];

/*
  searchImages() function takes a parameter of an array of clothing items and
  searches each item with Google Custom Search API. From the API's JSON
  response of a search, the first (out of 10) image result is extracted. 
  The function calls displayImage() with the data of the image.
*/
function searchImages(queries) {
  const apiKey = CONFIG.GOOGLE_SEARCH_API_KEY;
  const cx = CONFIG.GOOGLE_SEARCH_CX;

  // API called for each clothing item in the array of queries
  for (let queryIndex = 0; queryIndex < queries.length; queryIndex++) {
      var currentQuery = queries[queryIndex];
      const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${currentQuery}&key=${apiKey}&cx=${cx}&searchType=image`;

      fetch(apiUrl)
          .then(response => response.json())
          .then(data => {
              // save response in an array of each clothing item's search reponse
              dataArray[queryIndex] = data;

              // call displayImage() with the data of the first image result
              displayImage(data.items[0], queryIndex);
          })
          .catch(error => console.error('Error fetching data:', error));

      console.log("Custom search api called");
      
      // un-hide the item's refresh button and the refresh all button in trial.html
      const refreshButton = document.getElementById('refreshButton' + queryIndex);
      refreshButton.style.display = 'block';
      const refreshAllButton = document.getElementById('refreshAll');
      refreshAllButton.style.display = 'block';
  }

  console.log(dataArray);
}

/*
  displayImage() function takes parameters of an image's data and clothing category
  number to display a clothing suggestion's corresponding image. The image is 
  embedded with a context link to take the user to the image's website if 
  clicked.
*/
function displayImage(info, queryIndex) {
  // identify the column that corresponds to the current part of the outfit
  const imageResultDiv = document.getElementById('imageResult' + queryIndex);
  imageResultDiv.innerHTML = '';

  if (info) {
      // extract necessary information from the image's data
      const imgElement = document.createElement('img');
      imgElement.src = info.link;
      imgElement.alt = info.title;

      imgElement.style.maxWidth = '200px';
      imgElement.style.margin = '5px';

      // embed the image with its context link to open in a new tab if clicked
      imgElement.addEventListener('click', function () {
          window.open(info.image.contextLink, '_blank');
      });
      
      // display the image in the correct column
      imageResultDiv.appendChild(imgElement);
  } 
  else {
      imageResultDiv.innerText = 'No image found.';
  }
}

/*
  refresh() function uses the itemIndex array to initiate the display of the
  clothing item's next image result out of 10.
*/
function refresh(queryIndex) {
  console.log("Refresh executed");

  // circle back to the first image result if end of list has been reached
  if (itemIndex[queryIndex] === 9) {
    itemIndex[queryIndex] = 0;
    displayImage(dataArray[queryIndex].items[itemIndex[queryIndex]], queryIndex);
  } 
  else {
    // increment value in array to keep track of item number out of 10
    itemIndex[queryIndex] += 1;
    displayImage(dataArray[queryIndex].items[itemIndex[queryIndex]], queryIndex);
  }
}

/*
  refreshAll() function creates a loop to call refresh() function for
  each clothing item.
*/
function refreshAll() {
  console.log("Refresh all executed");

  for (let queryIndex = 0; queryIndex < dataArray.length; queryIndex++) {
    refresh(queryIndex);
  }
}

/*
  updateOutfits() function updates the weather information
  as selected by the user and calls getRecommendation() function with the weather data.
*/
function updateOutfits() {
  // variables to store input or HTML element values
  var city = 'custom-weather'
  var weather = document.getElementById("weather").value;
  var temperature = document.getElementById("temperature").value;

  // logging information to console
  console.log(`City: ${city}`);
  console.log(`Current Temperature: ${temperature}F`);
  console.log(`Current Weather: ${weather}`);
 
  // update display
  document.getElementById("city").innerHTML = city;
  document.getElementById("weatherData").innerHTML = temperature + "F, " + weather;
  
  // update selected weather to use in search later
  document.getElementById('selectedWeather').value = weather;

  // function call to get outfit reccomendations
  getRecommendation(temperature, weather);
}

/*
  getSearchQuery function to encode URI component to use in the links
*/
function getSearchQuery(searchTerm) {
  return encodeURIComponent(searchTerm);
}

/*
  openGoogleShopping function to launch google shopping link for similar outfit reccomendation.
  This function also considers the price range
*/
function openGoogleShopping(outfitType) {
  // get the min and max price element names for outfit
  const outfitMinPrice = 'minPrice_' + outfitType;
  const outfitMaxPrice = 'maxPrice_' + outfitType;

  // get the selected weather to use in the search
  const selectedWeatherDescription = document.getElementById('selectedWeather').value
  // get the min and max price for the outfit
  const minPrice = document.getElementById(outfitMinPrice).value;
  const maxPrice = document.getElementById(outfitMaxPrice).value;

  var googleShoppingLink = "https://www.google.com/search?tbm=shop&tbs=mr:1,price:1";

  // if min price given, append to the link
  if (minPrice !== '') {
    googleShoppingLink = googleShoppingLink + ',ppr_min:' + minPrice;
  }

  // if max price given, append to the link
  if (maxPrice !== '') {
    googleShoppingLink = googleShoppingLink + ',ppr_max:' + maxPrice;
  }

  // append the URI encoded weather description to the link
  var shopForQuery = getSearchQuery(selectedWeatherDescription + " weather " + outfitType);

  googleShoppingLink = googleShoppingLink + '&q=' + shopForQuery;

  // sample google shopping link, searching for Watch for min price of 2 and max price od 27
  //var googleShoppingLink = "https://www.google.com/search?tbm=shop&tbs=mr:1,price:1,ppr_min:2,ppr_max:27&q=watch";

  // make sure to allow popups on the page
  window.open(googleShoppingLink, '_blank');
}
// End of Code