
import { useEffect, useState } from 'react'

export default function OrientationGuide() {
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
      window.removeEventListener(
        'deviceorientation',
        handleOrientation
      )
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
        const result = await DeviceOrientationEvent.requestPermission()
        setPermission(result === 'granted' ? 'granted' : 'denied')
      } else {
        setPermission('granted')
      }
    } catch (error) {
      console.error('Orientation permission failed:', error)
      setPermission('denied')
    }
  }

  const bubbleX = Math.max(-45, Math.min(45, tilt.gamma))
  const bubbleY = Math.max(-45, Math.min(45, tilt.beta))
  const isLevel =
    hasReading &&
    Math.abs(tilt.gamma) < 5 &&
    Math.abs(tilt.beta) < 5

  return (
    <section className="orientation-guide">
      <h3>🧭 Raydar Alignment Guide</h3>

      <p>
        Enable motion sensors, then gently tilt your phone
        to test the bubble level.
      </p>

      {permission !== 'granted' ? (
        <button type="button" onClick={enableSensors}>
          Enable motion sensors
        </button>
      ) : (
        <>
          <div className="bubble-level">
            <div className="bubble-target" />

            <div
              className={`bubble ${isLevel ? 'aligned' : ''}`}
              style={{
                transform: `translate(
                  ${bubbleX * 1.2}px,
                  ${bubbleY * 1.2}px
                )`
              }}
            />
          </div>

          <div className="orientation-readings">
            <span>Forward/back: {tilt.beta.toFixed(1)}°</span>
            <span>Left/right: {tilt.gamma.toFixed(1)}°</span>
          </div>

          <p className="orientation-status">
            {!hasReading
              ? 'Waiting for sensor data...'
              : isLevel
                ? '✅ Aligned! Hold steady.'
                : 'Move your phone to center the bubble.'}
          </p>
        </>
      )}

      {permission === 'denied' && (
        <p>Motion access was denied. Check browser permissions.</p>
      )}

      {permission === 'unsupported' && (
        <p>This browser does not support orientation sensors.</p>
      )}
    </section>
  )
}
