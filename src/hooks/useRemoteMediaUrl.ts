import { useEffect, useState } from 'react'
import { mediaApi } from '@/lib/api'

interface RemoteMediaState {
  url: string | null
  loading: boolean
  error: boolean
}

export function useRemoteMediaUrl(mediaId: string | undefined): RemoteMediaState {
  const [state, setState] = useState<RemoteMediaState>({ url: null, loading: false, error: false })

  useEffect(() => {
    if (!mediaId) {
      setState({ url: null, loading: false, error: false })
      return
    }

    let cancelled = false
    let objectUrl: string | null = null
    setState({ url: null, loading: true, error: false })

    mediaApi
      .fetchBlob(mediaId)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setState({ url: objectUrl, loading: false, error: false })
      })
      .catch(() => {
        if (!cancelled) setState({ url: null, loading: false, error: true })
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [mediaId])

  return state
}
