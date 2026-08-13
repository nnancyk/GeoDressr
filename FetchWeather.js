 /* Not used by the live app. This was an earlier prototype of the weather-fetching + clothing-suggestion logic, using simple rule-based suggestions
  and Google Shopping search links instead of the OpenAI-based recommendations in ClothingRecommendation.js. */

window.addEventListener("DOMContentLoaded", (event) => {
    const submitButton = document.getElementById("submitButton");
    if(submitButton){
        submitButton.addEventListener("submit", zipSubmit);
    }
});

function zipSubmit() {
    var zipcode = document.getElementById("zipcode").value;
    console.log(zipcode);
    
    if (!zipcode) {
        alert("Input zipcode");
    }
    else {
        getWeatherData(zipcode);
    }
}

function getWeatherData(zipcodeP) {
  const apiKey = CONFIG.OPENWEATHER_API_KEY;
  const zipcode = zipcodeP;
  const apiEndpoint = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode}&appid=${apiKey}&units=imperial`;

  fetch(apiEndpoint)
  .then(response => response.json())
  .then(data => {
    const temperature = data.main.temp;
    const description = data.weather[0].description;
    const category = data.weather[0].main;

    console.log(`Current Temperature: ${temperature}F`);
    console.log(`Current Weather: ${description}`);

    document.getElementById("weatherData").innerHTML = temperature + "F" +" " + description + " " + category;

   // Call function to suggest clothing based on weather
   suggestClothing(category);


  })
  .catch(error => {
    console.error('Error fetching weather data:', error);
    alert('Error fetching weather data.');
  });
}

function suggestClothing(weatherDescription) {
   const lowerCaseWeather = weatherDescription.toLowerCase();

    // Simple clothing suggestions based on weather
    let shirt = 'T-shirt';
    let pants = 'Jeans';
    let shoes = 'Sneakers';

    if (lowerCaseWeather.includes('rain')) {
        shirt = 'Raincoat';
        pants = 'Umbrella';
        shoes = 'Waterproof Boots';
    } else if (lowerCaseWeather.includes('snow')) {
        shirt = 'Winter Jacket';
        pants = 'Snow Pants';
        shoes = 'Snow Boots';
    }

    // Display clothing suggestions on the website
    const clothingSuggestions = document.getElementById('clothing-suggestions');
    clothingSuggestions.innerHTML = "<td style='width:33pc;height: 50px;' align='center'>" + shirt + "</td><td style='width:33pc;height: 50px;' align='center'>" + pants + "</td><td style='height: 50px;' align='center'>" + shoes + "</td>";

	var googleShoppingUrl = "https://www.google.com/search?tbm=shop&tbs=mr:1,price:1,ppr_min:2,ppr_max:27&q=";

	var shirtsQuery = getSearchQuery(lowerCaseWeather + " weather shirts");
	var pantsQuery = getSearchQuery(lowerCaseWeather + " weather pants");
	var shoesQuery = getSearchQuery(lowerCaseWeather + " weather shoes");

	const BuyShirtsLink = document.getElementById('ShirtsLink');
	BuyShirtsLink.innerHTML = "<a href='" + googleShoppingUrl + shirtsQuery + "' target=_blank>Buy Shirts</a>"; 
	
	const BuyPantsLink = document.getElementById('PantsLink');
	BuyPantsLink.innerHTML = "<a href='" + googleShoppingUrl + pantsQuery + "' target=_blank>Buy Pants</a>"; 

	const BuyShoesLink = document.getElementById('ShoesLink');
	BuyShoesLink.innerHTML = "<a href='" + googleShoppingUrl + shoesQuery + "' target=_blank>Buy Shoes</a>"; 

}