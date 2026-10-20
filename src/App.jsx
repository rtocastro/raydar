
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [photo, setPhoto] = useState(null)
  const [targets, setTargets] = useState([])

  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo)
    }
  }, [photo])

  function uploadPhoto(event) {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    setPhoto(URL.createObjectURL(file))
    setTargets([])
  }

  function addTarget(event) {
    const rect = event.currentTarget.getBoundingClientRect()

    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    setTargets(previous => [
      ...previous,
      { id: crypto.randomUUID(), x, y }
    ])
  }

  function removeTarget(id) {
    setTargets(previous => previous.filter(target => target.id !== id))
  }

  return (
    <main className="app">
      <header className="header">
        <img src="/fruitbat.png" alt="The Fruitbat" />
        <div>
          <h1>Raydar</h1>
          <p>Find your light. Grow something great.</p>
        </div>
      </header>

      <section className="workspace">
        <h2>Map your growing space</h2>
        <p>Upload a photo of your balcony, patio, or garden.</p>

        <label className="upload-button">
          Choose a photo
          <input
            type="file"
            accept="image/*"
            onChange={uploadPhoto}
            hidden
          />
        </label>

        {photo && (
          <>
            <p className="instructions">
              Tap anywhere on your photo to mark a growing spot.
            </p>

            <div className="photo-map" onClick={addTarget}>
              <img src={photo} alt="Your growing space" />

              {targets.map((target, index) => (
                <button
                  key={target.id}
                  className="target"
                  style={{ left: `${target.x}%`, top: `${target.y}%` }}
                  title="Click to remove target"
                  onClick={(event) => {
                    event.stopPropagation()
                    removeTarget(target.id)
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="target-info">
              <strong>{targets.length} growing spots marked</strong>
              <button onClick={() => setTargets([])}>
                Clear targets
              </button>
            </div>
          </>
        )}
      </section>

      <footer>
        Made with care by The Fruitbat
      </footer>
    </main>
  )
}

export default App
