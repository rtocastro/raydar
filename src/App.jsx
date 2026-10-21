
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [photo, setPhoto] = useState(null)
  const [targets, setTargets] = useState([])
  const [selectedTargetId, setSelectedTargetId] = useState(null)

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

    const newTarget = {
      id: crypto.randomUUID(),
      x,
      y,
      name: `Growing Spot ${targets.length + 1}`,
      plant: '',
      status: 'empty'
    }

    setTargets(previous => [...previous, newTarget])
    setSelectedTargetId(newTarget.id)
  }

  function updateTarget(id, updates) {
    setTargets(previous =>
      previous.map(target =>
        target.id === id ? { ...target, ...updates } : target
      )
    )
  }

  const selectedTarget = targets.find(
    target => target.id === selectedTargetId
  )


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
                    setSelectedTargetId(target.id)
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>


            {selectedTarget && (
              <div className="spot-panel">
                <div className="spot-panel-header">
                  <h3>{selectedTarget.name}</h3>
                  <button onClick={() => setSelectedTargetId(null)}>
                    Close
                  </button>
                </div>

                <label htmlFor="spot-name">Location name</label>
                <input
                  id="spot-name"
                  type="text"
                  value={selectedTarget.name}
                  onChange={event =>
                    updateTarget(selectedTarget.id, {
                      name: event.target.value
                    })
                  }
                />

                <label htmlFor="spot-status">Location status</label>
                <select
                  id="spot-status"
                  value={selectedTarget.status}
                  onChange={event =>
                    updateTarget(selectedTarget.id, {
                      status: event.target.value
                    })
                  }
                >
                  <option value="empty">Available for planting</option>
                  <option value="occupied">Already growing something</option>
                </select>

                {selectedTarget.status === 'occupied' && (
                  <>
                    <label htmlFor="spot-plant">Plant name</label>
                    <input
                      id="spot-plant"
                      type="text"
                      placeholder="e.g. Dragon Fruit"
                      value={selectedTarget.plant}
                      onChange={event =>
                        updateTarget(selectedTarget.id, {
                          plant: event.target.value
                        })
                      }
                    />
                  </>
                )}

                <div className="sunlight-placeholder">
                  <strong>☀️ Sunlight analysis</strong>
                  <p>Not measured yet. Sky scanning is coming next.</p>
                </div>

                <button
                  className="delete-spot"
                  onClick={() => {
                    removeTarget(selectedTarget.id)
                    setSelectedTargetId(null)
                  }}
                >
                  Remove growing spot
                </button>
              </div>
            )}


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
