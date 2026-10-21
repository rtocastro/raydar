
import * as SunCalc from 'suncalc'

const RAD_TO_DEG = 180 / Math.PI

// SunCalc measures azimuth from south, positive toward west.
// Convert it to compass bearings: 0=N, 90=E, 180=S, 270=W.
function toCompassBearing(azimuth) {
  return ((azimuth * RAD_TO_DEG + 180) % 360 + 360) % 360
}

export function getSolarPosition(date, latitude, longitude) {
  const position = SunCalc.getPosition(date, latitude, longitude)

  return {
    altitude: position.altitude * RAD_TO_DEG,
    azimuth: toCompassBearing(position.azimuth)
  }
}

export function getSolarDay(date, latitude, longitude) {
  const times = SunCalc.getTimes(date, latitude, longitude)

  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    solarNoon: times.solarNoon
  }
}

// Samples the sun's position every five minutes.
// This is astronomical daylight, NOT measured direct sunlight.
export function calculateDaylight(
  date,
  latitude,
  longitude,
  intervalMinutes = 5
) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  const samples = []
  const minutesInDay = 24 * 60

  for (let minute = 0; minute < minutesInDay; minute += intervalMinutes) {
    const time = new Date(start.getTime() + minute * 60000)
    const position = getSolarPosition(time, latitude, longitude)

    samples.push({
      time,
      hour: time.getHours() + time.getMinutes() / 60,
      altitude: position.altitude,
      azimuth: position.azimuth,
      aboveHorizon: position.altitude > 0
    })
  }

  return samples
}
