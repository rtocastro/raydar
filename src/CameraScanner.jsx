
import { useEffect, useRef, useState } from 'react'
const [orientation, setOrientation] = useState(null)
import OrientationGuide from './OrientationGuide'

export default function CameraScanner() {
    const videoRef = useRef(null)
    const streamRef = useRef(null)

    const [camera, setCamera] = useState('environment')
    const [active, setActive] = useState(false)
    const [error, setError] = useState('')
    const [capturedPhoto, setCapturedPhoto] = useState(null)

    useEffect(() => {
        return () => {
            streamRef.current?.getTracks().forEach(track => track.stop())
        }
    }, [])

    useEffect(() => {
        return () => {
            if (capturedPhoto) URL.revokeObjectURL(capturedPhoto)
        }
    }, [capturedPhoto])

    async function startCamera(facingMode = camera) {
        setError('')

        streamRef.current?.getTracks().forEach(track => track.stop())
        streamRef.current = null
        setActive(false)

        if (!navigator.mediaDevices?.getUserMedia) {
            setError('Camera access requires HTTPS or a supported browser.')
            return
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: { ideal: facingMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            })

            streamRef.current = stream

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
            }

            setActive(true)
        } catch (err) {
            console.error('Camera error:', err)
            setError('Could not open the camera. Check browser permissions.')
        }
    }

    function stopCamera() {
        streamRef.current?.getTracks().forEach(track => track.stop())
        streamRef.current = null

        if (videoRef.current) {
            videoRef.current.srcObject = null
        }

        setActive(false)
    }

    async function switchCamera() {
        const next = camera === 'environment' ? 'user' : 'environment'
        setCamera(next)
        await startCamera(next)
    }

    function capturePhoto() {
        const video = videoRef.current
        if (!video || !video.videoWidth) return

        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const context = canvas.getContext('2d')
        context.drawImage(video, 0, 0)

        canvas.toBlob(blob => {
            if (!blob) return

            const url = URL.createObjectURL(blob)
            setCapturedPhoto(url)
        }, 'image/jpeg', 0.9)
    }

    return (
        <section className="camera-scanner">
            <h3>📷 Raydar Live Scanner</h3>

            <p>
                Preview the sky from your growing spot.
                Rear camera is recommended for scanning surroundings.
            </p>

            <OrientationGuide onOrientationChange={setOrientation} />

            <div className="camera-preview">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                        display: active ? 'block' : 'none',
                        transform: camera === 'user' ? 'scaleX(-1)' : 'none'
                    }}
                />

                {active && orientation && (
                    <div className="camera-alignment-overlay">
                        <div className="camera-crosshair">
                            <div
                                className="camera-bubble"
                                style={{
                                    transform: `translate(
            ${Math.max(-40, Math.min(40, orientation.gamma))}px,
            ${Math.max(-40, Math.min(40, orientation.beta - 90))}px
          )`
                                }}
                            />
                        </div>
                    </div>
                )}

                {!active && (
                    <p className="camera-placeholder">
                        Camera is off
                    </p>
                )}
            </div>

            <div className="camera-actions">
                {!active ? (
                    <button onClick={() => startCamera()}>
                        Open camera
                    </button>
                ) : (
                    <>
                        <button onClick={capturePhoto}>
                            📸 Capture
                        </button>

                        <button onClick={switchCamera}>
                            🔄 Switch camera
                        </button>

                        <button onClick={stopCamera}>
                            Stop camera
                        </button>
                    </>
                )}
            </div>

            {error && <p className="camera-error">{error}</p>}

            {capturedPhoto && (
                <div className="camera-capture">
                    <h4>Captured photo</h4>
                    <img src={capturedPhoto} alt="Captured sky scan" />
                    <p>
                        Test capture only. Saving to your growing spot
                        comes next.
                    </p>
                </div>
            )}
        </section>
    )
}
