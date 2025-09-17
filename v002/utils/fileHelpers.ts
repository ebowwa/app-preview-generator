/**
 * Read a file and convert it to a data URL
 * @param file - File to read
 * @returns Promise resolving to data URL string
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('Failed to read file as data URL'))
      }
    }
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Read a file as text
 * @param file - File to read
 * @returns Promise resolving to text content
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('Failed to read file as text'))
      }
    }
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsText(file)
  })
}

/**
 * Create a download link and trigger download
 * @param url - Data URL or blob URL
 * @param filename - Name for the downloaded file
 */
export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
}

/**
 * Create a blob from data and trigger download
 * @param data - Data to download
 * @param filename - Name for the downloaded file
 * @param mimeType - MIME type of the data
 */
export const downloadData = (data: string, filename: string, mimeType: string): void => {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  downloadFile(url, filename)
  // Clean up the URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * Generate a timestamp-based filename
 * @param prefix - Filename prefix
 * @param extension - File extension (without dot)
 * @returns Formatted filename with timestamp
 */
export const generateTimestampFilename = (prefix: string, extension: string): string => {
  const timestamp = Date.now()
  return `${prefix}-${timestamp}.${extension}`
}