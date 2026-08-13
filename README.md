# GeoDressr

*A weather-based outfit recommender that tells you what to wear and helps you shop for it.*

![GeoDressr screenshot](screenshot-placeholder.png)
<!-- TODO: replace with a real screenshot of trial.html running -->

## The Problem

Checking the weather and then figuring out what to actually wear is two separate steps — you have to translate "62°F and cloudy" into an outfit yourself. GeoDressr collapses that into one step: enter your zip code (or pick a hypothetical weather scenario), and get an AI-generated outfit recommendation with real product images and shopping links, filtered by your price range.

## Features

- **Live weather lookup** — enter a zip code to pull current temperature and conditions from OpenWeatherMap
- **Hypothetical weather mode** — don't want to use your real location? Pick a weather condition and temperature range manually
- **AI-generated outfit recommendations** — sends the weather data to OpenAI, which returns a specific outerwear, top, bottom, and shoe suggestion
- **Visual product search** — each recommended item is turned into a Google Custom Search image query, so you see real product photos instead of just text
- **Refreshable results** — cycle through more image results per category if the first one isn't right
- **Price-range shopping** — set a min/max price per category and jump straight to a filtered Google Shopping search

## Tech Stack

- Vanilla JavaScript, HTML, CSS — no framework or build tool
- [OpenWeatherMap API](https://openweathermap.org/api) — current weather by zip code
- [OpenAI API](https://platform.openai.com/) (`gpt-3.5-turbo`) — outfit recommendation generation
- [Google Custom Search JSON API](https://developers.google.com/custom-search/v1/overview) — product image search

## Setup

This is a static site with no build step — you just need API keys for the three services above.

1. Clone the repo:
   ```
   git clone https://github.com/nnancyk/GeoDressr.git
   cd GeoDressr
   ```
2. Copy the config template and fill in your own keys:
   ```
   cp config.example.js config.js
   ```
   Then open `config.js` and replace the placeholder values with your own OpenWeatherMap, OpenAI, and Google Custom Search keys and CX (Search Engine ID).
3. Open `trial.html` directly in your browser. No server or install step required.

`config.js` is gitignored, so your keys never leave your machine.

## My Role

This was a team project with Ananya Suthram. My main contributions:

- Built the core logic in `ClothingRecommendation.js`: the OpenWeatherMap fetch, the OpenAI prompt construction and API call, and the Google Custom Search image-fetching logic
- Built most of the `trial.html` UI/layout — the input table, weather display, and image-result grid
- Iterated on an earlier rule-based prototype (`FetchWeather.js`, kept in the repo for reference) before moving to the AI-based approach

Ananya built the `updateOutfits()` and `openGoogleShopping()` functions — the hypothetical-weather and price-range shopping feature — and contributed to the `trial.html` layout and styling.

## Challenges & What I Learned

- **Prompt engineering for consistent output**: getting OpenAI to reliably return exactly 4 items in a parseable format (`outerwear: heavy down jacket`) took iteration — the prompt explicitly specifies the format and forbids "or" to avoid ambiguous responses that would break the parsing logic downstream.
- **Chaining async API calls**: the flow (weather → AI recommendation → image search) meant handling multiple sequential `fetch()` calls and making sure each step's data was ready before the next one used it.
- **First exposure to we development**: This was my first project building a website from scratch. By the end of it, I fully grasped how HTML, CSS, and JavaScript work together to create a site.
