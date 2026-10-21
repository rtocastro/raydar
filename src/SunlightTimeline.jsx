
import { useMemo, useState } from 'react'
import { calculateDaylight, getSolarDay } from './solarEngine'

const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
]

function formatTime(date) {
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  })
}

export default function SunlightTimeline({ targetName, location }) {
  const [month, setMonth] = useState(new Date().getMonth())

  const result = useMemo(() => {
    if (!location) return null

    const date = new Date(
      new Date().getFullYear(),
      month,
      15,
      12
    )

    const samples = calculateDaylight(
      date,
      location.latitude,
      location.longitude
    )

    const solarDay = getSolarDay(
      date,
      location.latitude,
      location.longitude
    )

    const daylightSamples = samples.filter(
      sample => sample.aboveHorizon
    )

    return {
      sunrise: solarDay.sunrise,
      sunset: solarDay.sunset,
      daylightHours: daylightSamples.length * (5 / 60),
      samples
    }
  }, [month, location])

  return (
    <section className="sun-report">
      <div className="sun-report-heading">
        <div>
          <span className="sun-eyebrow">
            RAYDAR · SOLAR REPORT
          </span>
          <h3>{targetName}</h3>
        </div>
        <span className="sun-demo-badge">
          ASTRONOMICAL
        </span>
      </div>

      {!location ? (
        <p className="sun-disclaimer">
          Select your city above to calculate daylight.
        </p>
      ) : (
        <>
          <label htmlFor="sun-month">
            Explore daylight by month
          </label>

          <select
            id="sun-month"
            value={month}
            onChange={event =>
              setMonth(Number(event.target.value))
            }
          >
            {MONTHS.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>

          <div className="sun-total">
            <span>☀️ Astronomical daylight</span>
            <strong>
              {result.daylightHours.toFixed(1)} hours
            </strong>
            <small>
              Sun above the horizon — not direct sunlight
              reaching your plants.
            </small>
          </div>

          <h4>Sunrise and sunset</h4>

          <div className="sun-window-list">
            <p>🌅 Sunrise: {formatTime(result.sunrise)}</p>
            <p>🌇 Sunset: {formatTime(result.sunset)}</p>
          </div>

          <h4>Daylight timeline</h4>

          <div className="sun-timeline">
            {result.samples
              .filter(sample => sample.aboveHorizon)
              .map((sample, index) => (
                <div
                  key={index}
                  className="sun-window"
                  style={{
                    left: `${(sample.hour / 24) * 100}%`,
                    width: `${(5 / 60 / 24) * 100}%`
                  }}
                />
              ))}
          </div>

          <div className="sun-time-labels">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>12 AM</span>
          </div>

          <p className="sun-disclaimer">
            Calculated for {location.name} on the 15th of
            {` ${MONTHS[month]}`}. Buildings, trees,
            awnings, and other obstructions are not yet
            included.
          </p>
        </>
      )}
    </section>
  )
}
