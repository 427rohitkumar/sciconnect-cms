/**
 * Extracts a YouTube Video ID from various YouTube URL formats.
 * @param url The YouTube URL
 * @returns The extracted Video ID or null if invalid
 */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname.replace(/^www\./, '')

    // Handle youtu.be/VIDEO_ID
    if (hostname === 'youtu.be') {
      const path = parsedUrl.pathname.slice(1)
      if (path && !path.includes('/')) {
        return path
      }
    }

    // Handle youtube.com or m.youtube.com
    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      // Handle /watch?v=VIDEO_ID
      if (parsedUrl.pathname === '/watch') {
        const v = parsedUrl.searchParams.get('v')
        if (v) return v
      }
      
      // Handle /embed/VIDEO_ID
      if (parsedUrl.pathname.startsWith('/embed/')) {
        const path = parsedUrl.pathname.split('/')[2]
        if (path) return path
      }

      // Handle /shorts/VIDEO_ID
      if (parsedUrl.pathname.startsWith('/shorts/')) {
        const path = parsedUrl.pathname.split('/')[2]
        if (path) return path
      }
    }

    return null
  } catch (error) {
    return null
  }
}

/**
 * Returns a secure YouTube embed URL for a given Video ID
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

/**
 * Returns the max-resolution thumbnail URL for a given Video ID
 */
export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
}
