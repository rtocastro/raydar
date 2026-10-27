
import { useEffect, useState } from 'react'

const MODES = {
  horizon: {
    label: 'Horizon',
    description: 'Hold your phone upright to scan trees and buildings.',
    targetBeta: 90
  },
  overhead: {
    label: 'Overhead',
    description: 'Hold your phone flat with the screen facing upward.',
    targetBeta: 0
  }
}

const TOLERANCE = 5

function angleDifference(a, b) {
  return ((a - b + 540) % 360) - 180
}

export default function OrientationGuide() {
  const [mode, setMode] = useState('horizon')
  const [permission, setPermission] = useState('idle')
  const [tilt, setTilt] = useState({ beta: 0, gamma: 0 })
  const [hasReading, setHasReading] = useState(false)

  useEffect(() => {
    if (permission !== 'granted') return

    function handleOrientation(event) {
      if (event.beta == null || event.gamma == null) return

      setHasReading(true)
      setTilt({
        beta: event.beta,
        gamma: event.gamma
      })
    }

    window.addEventListener('deviceorientation', handleOrientation)

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [permission])

  async function enableSensors() {
    if (!('DeviceOrientationEvent' in window)) {
      setPermission('unsupported')
      return
    }

    try {
      if (
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        const result =
          await DeviceOrientationEvent.requestPermission()

        setPermission(
          result === 'granted' ? 'granted' : 'denied'
        )
      } else {
        setPermission('granted')
      }
    } catch (error) {
      console.error('Sensor permission failed:', error)
      setPermission('denied')
    }
  }

  const selectedMode = MODES[mode]

  const betaDifference = angleDifference(
    tilt.beta,
    selectedMode.targetBeta
  )

  const gammaDifference = tilt.gamma

  const bubbleX = Math.max(
    -55,
    Math.min(55, gammaDifference * 1.2)
  )

  const bubbleY = Math.max(
    -55,
    Math.min(55, betaDifference * 1.2)
  )

  const isAligned =
    hasReading &&
    Math.abs(betaDifference) <= TOLERANCE &&
    Math.abs(gammaDifference) <= TOLERANCE

  return (
    <section className="orientation-guide">
      <h3>🧭 Raydar Alignment Guide</h3>

      <div className="scan-mode-buttons">
        <button
          type="button"
          className={mode === 'horizon' ? 'active' : ''}
          onClick={() => setMode('horizon')}
        >
          🌳 Horizon
        </button>

        <button
          type="button"
          className={mode === 'overhead' ? 'active' : ''}
          onClick={() => setMode('overhead')}
        >
          ☀️ Overhead
        </button>
      </div>

      <p>{selectedMode.description}</p>

      {permission !== 'granted' ? (
        <button
          type="button"
          onClick={enableSensors}
        >
          Enable motion sensors
        </button>
      ) : (
        <>
          <div className="bubble-level">
            <div className="bubble-target" />

            <div
              className={`bubble ${isAligned ? 'aligned' : ''}`}
              style={{
                transform: `translate(
                  ${bubbleX}px,
                  ${bubbleY}px
                )`
              }}
            />
          </div>

          <div className="orientation-readings">
            <span>
              Forward/back: {tilt.beta.toFixed(1)}°
            </span>
            <span>
              Left/right: {tilt.gamma.toFixed(1)}°
            </span>
          </div>

          <p className="orientation-status">
            {!hasReading
              ? 'Waiting for sensor data...'
              : isAligned
                ? '✅ Aligned! Hold steady.'
                : 'Move your phone to center the bubble.'}
          </p>
        </>
      )}

      {permission === 'denied' && (
        <p>Motion access was denied. Check browser permissions.</p>
      )}

      {permission === 'unsupported' && (
        <p>Orientation sensors are unavailable in this browser.</p>
      )}
    </section>
  )
}
