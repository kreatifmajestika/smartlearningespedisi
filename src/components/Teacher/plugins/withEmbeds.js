// withEmbeds.js
import { Transforms, Element } from 'slate'

export const withEmbeds = editor => {
  const { isVoid } = editor

  editor.isVoid = element => {
    return element.type === 'video' ? true : isVoid(element)
  }

  editor.insertVideo = (url) => {
    // YouTube patterns
    const youtubePatterns = [
      /youtu\.be\/([^#&?]{11})/,
      /youtube\.com\/watch\?v=([^#&?]{11})/,
      /youtube\.com\/embed\/([^#&?]{11})/,
      /youtube\.com\/v\/([^#&?]{11})/,
      /youtube\.com\/shorts\/([^#&?]{11})/
    ]

    // TikTok patterns
    const tiktokPatterns = [
      /tiktok\.com\/@[^/]+\/video\/(\d+)/,
      /vm\.tiktok\.com\/[^/]+\//,
      /vt\.tiktok\.com\/[^/]+\//
    ]

    let videoElement = {
      type: 'video',
      url,
      children: [{ text: '' }]
    }

    // Check YouTube URLs
    for (const pattern of youtubePatterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        videoElement.provider = 'youtube'
        videoElement.id = match[1]
        Transforms.insertNodes(editor, videoElement)
        return
      }
    }

    // Check TikTok URLs
    for (const pattern of tiktokPatterns) {
      const match = url.match(pattern)
      if (match) {
        videoElement.provider = 'tiktok'
        videoElement.id = match[1] || match[0].split('/').pop()
        Transforms.insertNodes(editor, videoElement)
        return
      }
    }

    alert('URL tidak valid. Harap masukkan URL YouTube atau TikTok yang valid.')
  }

  return editor
}