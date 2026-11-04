import { useEffect, useRef, useState } from 'react'
import OrientationGuide from './OrientationGuide'
import { saveScan, loadScans } from './photoStorage'
import SavedScanImage from './SavedScanImage'


export default function CameraScanner({ targetId }) {
    const videoRef = useRef(null)
    const streamRef = useRef(null)


    const [camera, setCamera] = useState('environment')
    const [active, setActive] = useState(false)
    const [error, setError] = useState('')
    const [capturedPhoto, setCapturedPhoto] = useState(null)
    const [orientation, setOrientation] = useState(null)
    const [mode, setMode] = useState('horizon')
    const [captureMetadata, setCaptureMetadata] = useState(null)
    const [savedScans, setSavedScans] = useState([])
    const [savingScan, setSavingScan] = useState(false)

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

    useEffect(() => {
        let cancelled = false

        async function restoreScans() {
            try {
                const scans = await loadScans(targetId)
                if (!cancelled) setSavedScans(scans)
            } catch (error) {
                console.error('Could not load scans:', error)
            }
        }

        restoreScans()

        return () => {
            cancelled = true
        }
    }, [targetId])

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
        if (!context) return

        context.drawImage(video, 0, 0)

        canvas.toBlob(blob => {
            if (!blob) return

            const url = URL.createObjectURL(blob)
            setCapturedPhoto(url)

            setCaptureMetadata({
                targetId,
                mode,
                camera,
                capturedAt: new Date().toISOString(),
                orientation: orientation
                    ? {
                        beta: orientation.beta,
                        gamma: orientation.gamma,
                        alpha: orientation.alpha ?? null
                    }
                    : null
            })
        }, 'image/jpeg', 0.9)
    }





    const targetBeta = mode === 'horizon' ? 90 : 0

    const betaError = orientation
        ? orientation.beta - targetBeta
        : 0

    const gammaError = orientation?.gamma ?? 0

    const isAligned =
        orientation !== null &&
        Math.abs(betaError) <= 5 &&
        Math.abs(gammaError) <= 5

    const bubbleX = Math.max(-40, Math.min(40, gammaError * 1.2))
    const bubbleY = Math.max(-40, Math.min(40, betaError * 1.2))

    return (
        <section className="camera-scanner">
            <h3>📷 Raydar Live Scanner</h3>

            <p>
                Preview the sky from your growing spot.
                Rear camera is recommended for scanning surroundings.
            </p>

            <OrientationGuide
                mode={mode}
                onModeChange={setMode}
                onOrientationChange={setOrientation}
            />

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


                {active && (
                    <div className="camera-alignment-overlay">
                        <div className="camera-status">
                            {!orientation
                                ? 'Enable motion sensors for alignment'
                                : isAligned
                                    ? '✓ Aligned — hold steady'
                                    : 'Move your phone to center the bubble'}
                        </div>

                        {orientation && (
                            <div className="camera-crosshair">
                                <div
                                    className={`camera-bubble ${isAligned ? 'aligned' : ''}`}
                                    style={{
                                        transform: `translate(${bubbleX}px, ${bubbleY}px)`
                                    }}
                                />
                            </div>
                        )}

                        <div className="camera-angle-readings">
                            {orientation
                                ? `${orientation.beta.toFixed(1)}° tilt · ${orientation.gamma.toFixed(1)}° roll`
                                : 'Orientation unavailable'}
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
                        {mode === 'horizon'
                            ? 'Hold your phone upright to scan trees and buildings.'
                            : 'Hold your phone flat, screen facing upward, to scan overhead.'}
                    </p>
                </div>


            )}

            {captureMetadata && (
                <div className="capture-metadata">
                    <h4>Capture details</h4>
                    <p>Mode: {captureMetadata.mode}</p>
                    <p>Camera: {captureMetadata.camera}</p>
                    <p>
                        Tilt: {captureMetadata.orientation?.beta?.toFixed(1) ?? 'N/A'}°
                    </p>
                    <p>
                        Roll: {captureMetadata.orientation?.gamma?.toFixed(1) ?? 'N/A'}°
                    </p>
                    <small>
                        Sensor readings are uncalibrated. Compass direction
                        has not yet been verified.
                    </small>
                </div>
            )}


            {capturedPhoto && captureMetadata && (
                <button
                    type="button"
                    disabled={savingScan}
                    onClick={async () => {
                        setSavingScan(true)

                        try {
                            const response = await fetch(capturedPhoto)
                            const blob = await response.blob()

                            const scan = {
                                id: crypto.randomUUID(),
                                ...captureMetadata,
                                image: blob
                            }

                            await saveScan(scan)

                            setSavedScans(previous => [scan, ...previous])
                            setCapturedPhoto(null)
                            setCaptureMetadata(null)
                        } catch (error) {
                            console.error('Could not save scan:', error)
                            alert('Could not save scan. Please try again.')
                        } finally {
                            setSavingScan(false)
                        }
                    }}
                >
                    {savingScan ? 'Saving...' : '💾 Save this scan'}
                </button>
            )}

            {savedScans.length > 0 && (
                <div className="saved-scans">
                    <h4>Saved scans ({savedScans.length})</h4>

                    {savedScans.map(scan => (
                        <div key={scan.id} className="saved-scan-card">
                            <SavedScanImage
                                blob={scan.image}
                                alt={`${scan.mode} scan`}
                            />

                            <div>
                                <strong>
                                    {scan.mode === 'horizon'
                                        ? '🌳 Horizon'
                                        : '☀️ Overhead'}
                                </strong>

                                <p>
                                    {scan.camera === 'environment'
                                        ? 'Rear camera'
                                        : 'Front camera'}
                                </p>

                                <small>
                                    Tilt: {scan.orientation?.beta?.toFixed(1) ?? 'N/A'}°
                                </small>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </section>
    )
}
