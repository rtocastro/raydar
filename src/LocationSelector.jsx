
import { useState } from 'react'

const LOCATIONS = [
  {
    name: 'Los Angeles, CA',
    latitude: 34.0522,
    longitude: -118.2437
  },
  {
    name: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194
  },
  {
    name: 'New York, NY',
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    name: 'Miami, FL',
    latitude: 25.7617,
    longitude: -80.1918
  }
]

export default function LocationSelector({ onLocationChange }) {
  const [selected, setSelected] = useState('')

  function handleChange(event) {
    const value = event.target.value
    setSelected(value)

    const location = LOCATIONS.find(item => item.name === value)
    if (location) onLocationChange(location)
  }

  return (
    <div className="location-selector">
      <label htmlFor="raydar-location">
        📍 Where is your growing space?
      </label>

      <select
        id="raydar-location"
        value={selected}
        onChange={handleChange}
      >
        <option value="">Select your city</option>

        {LOCATIONS.map(location => (
          <option key={location.name} value={location.name}>
            {location.name}
          </option>
        ))}
      </select>

      <p>
        Raydar uses approximate city coordinates to calculate
        the sun's position. Your exact address isn't needed.
      </p>
    </div>
  )
}
