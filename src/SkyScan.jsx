import { useEffect, useRef, useState } from 'react'
import { saveSkyPhoto, loadSkyPhoto } from './photoStorage'

export default function SkyScan({ target }) {
    const [skyPhoto, setSkyPhoto] = useState(null)
    const [saving, setSaving] = useState(false)
    const [boundaryPoints, setBoundaryPoints] = useState([])
    const imageRef = useRef(null)

    useEffect(() => {
        let cancelled = false
        let imageUrl = null

        async function restore() {
            try {
                const file = await loadSkyPhoto(target.id)

                if (file && !cancelled) {
                    imageUrl = URL.createObjectURL(file)
                    setSkyPhoto(imageUrl)
                }
            } catch (error) {
                console.error('Could not load sky photo:', error)
            }
        }

        setSkyPhoto(null)
        restore()

        return () => {
            cancelled = true
            if (imageUrl) URL.revokeObjectURL(imageUrl)
        }
    }, [target.id])

    async function handleUpload(event) {
        const file = event.target.files?.[0]
        if (!file || !file.type.startsWith('image/')) return

        setSaving(true)

        try {
            await saveSkyPhoto(target.id, file)
            const imageUrl = URL.createObjectURL(file)
            setSkyPhoto(imageUrl)
        } catch (error) {
            console.error('Could not save sky photo:', error)
            alert('Could not save the sky photo. Please try again.')
        } finally {
            setSaving(false)
            event.target.value = ''
        }
    }

    function addBoundaryPoint(event) {
        const rect = event.currentTarget.getBoundingClientRect()

        const x = ((event.clientX - rect.left) / rect.width) * 100
        const y = ((event.clientY - rect.top) / rect.height) * 100

        setBoundaryPoints(previous => [
            ...previous,
            { x, y }
        ])
    }

    return (
        <div className="sky-scan-section">
            <div className="sky-scan-heading">
                <span>☀️ Sky Scan</span>
                <small>Step 4 · Obstruction mapping</small>
            </div>

            <p>
                Take a photo looking toward the sky from this
                growing spot. Include nearby trees, buildings,
                and awnings.
            </p>

            <label className="sky-scan-button">
                {saving ? 'Saving...' : skyPhoto ? 'Replace sky photo' : '📷 Add sky photo'}
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={saving}
                    hidden
                />
            </label>


            {skyPhoto && (
                <div className="sky-scan-preview">
                    <p>
                        Tap along the edge where the visible sky meets
                        buildings, trees, or other obstructions.
                    </p>

                    <div
                        className="sky-boundary-editor"
                        onClick={addBoundaryPoint}
                    >
                        <img
                            ref={imageRef}
                            src={skyPhoto}
                            alt={`Sky view for ${target.name}`}
                        />

                        <svg
                            className="sky-boundary-overlay"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <polyline
                                points={boundaryPoints
                                    .map(point => `${point.x},${point.y}`)
                                    .join(' ')}
                                fill="none"
                                stroke="#ffb12d"
                                strokeWidth="0.6"
                                vectorEffect="non-scaling-stroke"
                            />

                            {boundaryPoints.map((point, index) => (
                                <circle
                                    key={index}
                                    cx={point.x}
                                    cy={point.y}
                                    r="1.2"
                                    fill="#ffffff"
                                    stroke="#e58c16"
                                    strokeWidth="0.4"
                                />
                            ))}
                        </svg>
                    </div>

                    <div className="sky-boundary-actions">
                        <button
                            type="button"
                            onClick={() =>
                                setBoundaryPoints(previous => previous.slice(0, -1))
                            }
                            disabled={boundaryPoints.length === 0}
                        >
                            Undo point
                        </button>

                        <button
                            type="button"
                            onClick={() => setBoundaryPoints([])}
                            disabled={boundaryPoints.length === 0}
                        >
                            Clear boundary
                        </button>
                    </div>

                    <p>{boundaryPoints.length} boundary points marked</p>
                </div>
            )}

        </div>
    )
}
