import { useRef, useState } from 'react'

export type RecorderStatus = 'idle' | 'recording' | 'denied' | 'error'

export function useAudioRecorder() {
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const resolveRef = useRef<((blob: Blob | null) => void) | null>(null)

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        stream.getTracks().forEach((track) => track.stop())
        resolveRef.current?.(blob)
        resolveRef.current = null
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setStatus('recording')
    } catch (err) {
      setStatus(err instanceof DOMException && err.name === 'NotAllowedError' ? 'denied' : 'error')
    }
  }

  function stop(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state === 'inactive') {
        resolve(null)
        return
      }
      resolveRef.current = resolve
      recorder.stop()
      setStatus('idle')
    })
  }

  return { status, start, stop }
}
