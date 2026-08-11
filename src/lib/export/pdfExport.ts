import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { listEntriesInRange, getMediaForEntry } from '@/lib/db'
import { formatDisplayDate } from '@/lib/dateUtils'
import { getMood } from '@/data/moods'
import { blobToDataUrl } from '@/lib/blobUtils'
import type { JournalEntry } from '@/types/entry'

async function renderEntryNode(entry: JournalEntry): Promise<HTMLDivElement> {
  const mood = getMood(entry.mood)
  const media = await getMediaForEntry(entry.id)
  const images = media.filter((m) => m.kind === 'image')

  const node = document.createElement('div')
  Object.assign(node.style, {
    width: '760px',
    padding: '48px',
    background: '#F9F9F6',
    color: '#2f2e2b',
    fontFamily: "'Inter', system-ui, sans-serif",
    boxSizing: 'border-box',
  })

  const dateEl = document.createElement('div')
  Object.assign(dateEl.style, {
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#6b6a63',
  })
  dateEl.textContent = formatDisplayDate(entry.date)
  node.appendChild(dateEl)

  const titleEl = document.createElement('div')
  Object.assign(titleEl.style, {
    fontFamily: "'Playfair Display', serif",
    fontSize: '28px',
    marginTop: '10px',
  })
  titleEl.textContent = entry.title || 'Untitled reflection'
  node.appendChild(titleEl)

  if (mood) {
    const moodEl = document.createElement('span')
    Object.assign(moodEl.style, {
      display: 'inline-block',
      marginTop: '10px',
      padding: '4px 12px',
      borderRadius: '999px',
      fontSize: '12px',
      color: '#fff',
      background: mood.color,
    })
    moodEl.textContent = mood.label
    node.appendChild(moodEl)
  }

  const bodyEl = document.createElement('div')
  Object.assign(bodyEl.style, {
    marginTop: '20px',
    fontSize: '15px',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
  })
  bodyEl.textContent = entry.body
  node.appendChild(bodyEl)

  if (entry.tags.length) {
    const tagsEl = document.createElement('div')
    Object.assign(tagsEl.style, { marginTop: '16px', fontSize: '12px', color: '#6b6a63' })
    tagsEl.textContent = entry.tags.map((t) => `#${t}`).join('   ')
    node.appendChild(tagsEl)
  }

  if (images.length) {
    const gallery = document.createElement('div')
    Object.assign(gallery.style, {
      marginTop: '20px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
    })
    for (const image of images) {
      const dataUrl = await blobToDataUrl(image.blob)
      const img = document.createElement('img')
      img.src = dataUrl
      Object.assign(img.style, {
        width: '160px',
        height: '160px',
        objectFit: 'cover',
        borderRadius: '12px',
      })
      gallery.appendChild(img)
    }
    node.appendChild(gallery)
  }

  return node
}

export async function exportEntriesToPdf(from: string, to: string): Promise<void> {
  const entries = await listEntriesInRange(from, to)
  const nonEmpty = entries.filter((e) => e.title.trim() || e.body.trim())

  if (nonEmpty.length === 0) {
    throw new Error('No entries found in that date range.')
  }

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const host = document.createElement('div')
  Object.assign(host.style, { position: 'fixed', left: '-9999px', top: '0' })
  document.body.appendChild(host)

  try {
    for (let i = 0; i < nonEmpty.length; i++) {
      const node = await renderEntryNode(nonEmpty[i])
      host.appendChild(node)
      const canvas = await html2canvas(node, { backgroundColor: '#F9F9F6', scale: 2 })
      host.removeChild(node)

      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      if (i > 0) pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight))
    }
  } finally {
    document.body.removeChild(host)
  }

  pdf.save(`dusk-diary-${from}-to-${to}.pdf`)
}
