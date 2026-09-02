// src/services/weatherService.js

const getWeatherEmoji = (code) => {
  if (code === 0) return '☀️'; 
  if (code >= 1 && code <= 3) return '⛅'; 
  if (code === 45 || code === 48) return '🌫️'; 
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return '🌧️'; 
  if (code >= 71 && code <= 77) return '❄️'; 
  if (code >= 95 && code <= 99) return '⛈️'; 
  return '🌡️'; 
};

export async function fetchLocalWeather(locationString) {
  try {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationString)}&count=1`);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) throw new Error("Location not found");
    const { latitude, longitude } = geoData.results[0];

    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`);
    const weatherData = await weatherRes.json();

    const current = weatherData.current;
    
    // Map the 7-day forecast and bundle hourly data inside it
    const forecastArray = weatherData.daily.time.map((time, index) => {
      // Open-Meteo gives 168 straight hours. slice them into 24-hour chunks per day.
      const startIdx = index * 24;
      const endIdx = startIdx + 24;
      
      const hourlyData = weatherData.hourly.time.slice(startIdx, endIdx).map((hTime, hIndex) => {
        return {
          time: new Date(hTime).toLocaleTimeString([], { hour: 'numeric' }),
          temp: `${Math.round(weatherData.hourly.temperature_2m[startIdx + hIndex])}°`,
          icon: getWeatherEmoji(weatherData.hourly.weather_code[startIdx + hIndex])
        };
      });

      return {
        day: new Date(time).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
        max: `${Math.round(weatherData.daily.temperature_2m_max[index])}°`,
        min: `${Math.round(weatherData.daily.temperature_2m_min[index])}°`,
        icon: getWeatherEmoji(weatherData.daily.weather_code[index]),
        hourly: hourlyData
      };
    });

    return {
      temp: `${Math.round(current.temperature_2m)}°`,
      feelsLike: `${Math.round(current.apparent_temperature)}°`,
      condition: getWeatherEmoji(current.weather_code),
      forecast: forecastArray 
    };
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return { temp: '--°', condition: '☁️', feelsLike: '--°', forecast: [] };
  }
}