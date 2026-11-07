import { useEffect, useState } from 'react'

export default function OrientationGuide({
    mode,
    onModeChange,
    onOrientationChange
}) {
    const [permission, setPermission] = useState('idle')
    const [hasReading, setHasReading] = useState(false)

    useEffect(() => {
        if (permission !== 'granted') return

        function handleOrientation(event) {
            if (event.beta == null || event.gamma == null) return

            setHasReading(true)


            onOrientationChange?.({
                beta: event.beta,
                gamma: event.gamma,
                alpha: event.alpha,
                absolute: event.absolute === true,
                compassHeading:
                    typeof event.webkitCompassHeading === 'number'
                        ? event.webkitCompassHeading
                        : null,
                compassAccuracy:
                    typeof event.webkitCompassAccuracy === 'number'
                        ? event.webkitCompassAccuracy
                        : null
            })

        }

        window.addEventListener('deviceorientation', handleOrientation)

        return () => {
            window.removeEventListener(
                'deviceorientation',
                handleOrientation
            )
        }
    }, [permission, onOrientationChange])

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

                setPermission(result === 'granted' ? 'granted' : 'denied')
            } else {
                setPermission('granted')
            }
        } catch (error) {
            console.error('Sensor permission failed:', error)
            setPermission('denied')
        }
    }


    const [absoluteReading, setAbsoluteReading] = useState(null)

    useEffect(() => {
        if (permission !== 'granted') return

        function handleAbsolute(event) {
            setAbsoluteReading({
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma,
                absolute: event.absolute === true
            })
        }

        window.addEventListener(
            'deviceorientationabsolute',
            handleAbsolute
        )

        return () => {
            window.removeEventListener(
                'deviceorientationabsolute',
                handleAbsolute
            )
        }
    }, [permission])


    return (
        <div className="scanner-controls">

            <div className="absolute-diagnostic">
                <h4>🧭 Absolute Orientation Test</h4>

                <p>
                    Event received:{' '}
                    {absoluteReading ? 'Yes' : 'No'}
                </p>

                <p>
                    Absolute: {
                        absoluteReading
                            ? absoluteReading.absolute ? 'Yes' : 'No'
                            : 'Waiting...'
                    }
                </p>

                <p>
                    Alpha: {
                        absoluteReading?.alpha != null
                            ? `${absoluteReading.alpha.toFixed(1)}°`
                            : 'Unavailable'
                    }
                </p>
            </div>

            <div className="scan-mode-buttons">
                <button
                    type="button"
                    className={mode === 'horizon' ? 'active' : ''}
                    onClick={() => onModeChange('horizon')}
                >
                    🌳 Horizon
                </button>

                <button
                    type="button"
                    className={mode === 'overhead' ? 'active' : ''}
                    onClick={() => onModeChange('overhead')}
                >
                    ☀️ Overhead
                </button>
            </div>

            {permission !== 'granted' && (
                <button
                    type="button"
                    className="sensor-enable-button"
                    onClick={enableSensors}
                    disabled={permission === 'unsupported'}
                >
                    Enable motion sensors
                </button>
            )}

            {permission === 'denied' && (
                <p className="scanner-sensor-message">
                    Motion permission was denied. You can still
                    use the camera without alignment guidance.
                </p>
            )}

            {permission === 'unsupported' && (
                <p className="scanner-sensor-message">
                    Motion sensors are unavailable in this browser.
                </p>
            )}

            {permission === 'granted' && !hasReading && (
                <p className="scanner-sensor-message">
                    Waiting for sensor readings...
                </p>
            )}
        </div>
    )
}
