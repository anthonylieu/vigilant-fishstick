// Global variables
var apiKey = "417c16f9d2a5b6380aafa3dac636a4e5";
var searchButton = $("#searchBtn");

// Weather variables
var citySearch = $("#citySearch");
var cityName = $(".cityName");
var cityDate = $("#currentDate");
var cityTemp = $("#temp");
var cityHumidity = $("#humidity");
var windSpeed = $("#wind");
var uvIndexel = $("#uvIndex");
var cityHistory = $("#cityHistory");
var cityIcon = $("#cityIcon");
var time;

let cities = [];

// API Weather Call
function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  time = date + " " + month + " " + year;
  return time;
}

// API Info Call
var getWeather = async function (city) {
  console.log(city);
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
  );

  let data = await response.json();

  var { temp, humidity } = data.main;
  var { icon } = data.weather[0];
  var { speed } = data.wind;
  var { dt, name } = data;
  var { lon, lat } = data.coord;
  //  Second API call for lon / lat
  let secondResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`
  );

  let secondData = await secondResponse.json();
  var { uvi } = secondData.current;
  console.log(uvi);

  timeConverter(dt);
  getFiveDay();
  postWeather(temp, humidity, icon, speed, time, name, uvi);
  changeColors(uvi);
  saveCity(name);
};

var getFiveDay = async function () {
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=charlotte&units=imperial&appid=417c16f9d2a5b6380aafa3dac636a4e5`
  );
  let data = await response.json();
  let i = 24;
  for (let j = 7; j < 40; j += 8) {
    const { temp, humidity } = data.list[j].main;
    const { icon } = data.list[j].weather[0];
    const { speed } = data.list[j].wind;
    const { dt_txt: date } = data.list[j];

    const dateModified = date.split(" ")[0];

    postFiveDay(i, temp, humidity, icon, speed, dateModified);
    i += 24;
  }
};

var postFiveDay = function (i, temp, humidity, icon, speed, date) {
  $(`#date${i}`).text(date);
  $(`#temp${i}`).html(`Temp: ${temp} F`);
  $(`#humidity${i}`).html(`Humidity: ${humidity} %`);
  $(`#img${i}`).attr("src", `./assets/icons/${icon}.png`);
  $(`#speed${i}`).html(`Wind Speed: ${speed} MPH`);
};

var postWeather = function (temp, humidity, icon, speed, time, name, uvi) {
  cityTemp.html(`Temp: ${temp} &#176F`);
  cityIcon.attr("src", `./assets/icons/${icon}.png`);
  cityName.html(name);
  windSpeed.html(`Wind Speed: ${speed} MPH`);
  cityHumidity.html(`Humidity: ${humidity} %`);
  cityDate.html(time);
  uvIndexel.empty();
  uvIndexel.text(uvi);
};

// Changes color if the UV Index gets too high
const changeColors = function (uvi) {
  if (uvi <= 2) {
    uvIndexel.addClass("good");
  }
  if (uvi === 3) {
    uvIndexel.addClass("moderate");
  }
  if (uvi >= 4) {
    uvIndexel.addClass("bad");
  }
};

searchButton.on("click", function () {
  const cityInput = citySearch.val();
  console.log(cityInput);
  getWeather(cityInput);
});

const saveCity = function (city) {
  if (cities.indexOf(city) === -1) {
    cities.unshift(city);
    localStorage.setItem("cities", JSON.stringify(cities));
    loadCity();
  }
};

const loadCity = function () {
  const checkCities = JSON.parse(localStorage.getItem("cities"));

  cityHistory.empty();
  if (checkCities != null) {
    for (let i = 0; i < checkCities.length; i++) {
      const cityItem = checkCities[i];
      console.log(cityItem);

      cityHistory.append(`<li class='cityItem'>${cityItem}</li>`);
    }

    // Add click event listener to each city item
    $(".cityItem").on("click", function () {
      const city = $(this).text();
      getWeather(city);
    });

    return (cities = checkCities);
  }
};

loadCity();
