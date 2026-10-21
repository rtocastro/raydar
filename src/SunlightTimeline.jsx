
import { useState } from 'react'
// import './SunlightTimeline.css'

const DEMO_WINDOWS = {
  0: [[12.5, 14]],
  1: [[12, 14]],
  2: [[11, 14.5]],
  3: [[10, 12], [14, 16]],
  4: [[10, 15]],
  5: [[11, 16.5]],
  6: [[11, 17]],
  7: [[11, 16]],
  8: [[12, 16]],
  9: [[12, 14], [15, 17]],
  10: [[12, 15]],
  11: [[12.5, 14]]
}

const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
]

function formatTime(hour) {
  const hours = Math.floor(hour)
  const minutes = Math.round((hour - hours) * 60)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12

  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`
}

export default function SunlightTimeline({ targetName }) {
  const [month, setMonth] = useState(new Date().getMonth())

  const windows = DEMO_WINDOWS[month]
  const totalHours = windows.reduce(
    (total, [start, end]) => total + (end - start),
    0
  )

  return (
    <section className="sun-report">
      <div className="sun-report-heading">
        <div>
          <span className="sun-eyebrow">RAYDAR · SUNLIGHT REPORT</span>
          <h3>{targetName}</h3>
        </div>
        <span className="sun-demo-badge">DEMO</span>
      </div>

      <label htmlFor="sun-month">Explore sunlight by month</label>
      <select
        id="sun-month"
        value={month}
        onChange={event => setMonth(Number(event.target.value))}
      >
        {MONTHS.map((name, index) => (
          <option key={name} value={index}>{name}</option>
        ))}
      </select>

      <div className="sun-total">
        <span>☀️ Illustrative direct sunlight</span>
        <strong>{totalHours.toFixed(1)} hours / day</strong>
        <small>Example data — not a measurement of your garden</small>
      </div>

      <h4>When sunlight reaches this spot</h4>

      <div className="sun-timeline">
        {windows.map(([start, end], index) => (
          <div
            key={index}
            className="sun-window"
            style={{
              left: `${((start - 6) / 14) * 100}%`,
              width: `${((end - start) / 14) * 100}%`
            }}
          />
        ))}
      </div>

      <div className="sun-time-labels">
        <span>6 AM</span>
        <span>9 AM</span>
        <span>12 PM</span>
        <span>3 PM</span>
        <span>6 PM</span>
        <span>8 PM</span>
      </div>

      <div className="sun-window-list">
        {windows.map(([start, end], index) => (
          <p key={index}>
            ☀️ {formatTime(start)} – {formatTime(end)}
          </p>
        ))}
      </div>

      <p className="sun-disclaimer">
        These times are placeholders. Actual estimates will use your
        location, solar position, and measured sky obstructions.
      </p>
    </section>
  )
}
