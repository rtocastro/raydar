
import { useEffect, useState } from 'react'

export default function SavedScanImage({ blob, alt }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!blob) return

    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  return url ? <img src={url} alt={alt} /> : null
}
