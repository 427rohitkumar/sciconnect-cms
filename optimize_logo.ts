import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

async function optimize() {
  const inputPath = path.resolve('public/logo.png')
  const outputPath = path.resolve('public/logo-optimized.png')
  const iconPath = path.resolve('public/icon-optimized.png')

  // Resize logo to 128x128 PNG
  const buffer128 = await sharp(inputPath)
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 90, compressionLevel: 9 })
    .toBuffer()

  fs.writeFileSync(outputPath, buffer128)
  fs.writeFileSync(inputPath, buffer128) // Overwrite public/logo.png with lightweight 128x128 file

  const base64 = `data:image/png;base64,${buffer128.toString('base64')}`
  
  console.log(`Original size was large. Optimized 128x128 logo size: ${buffer128.length} bytes`)
  console.log('Base64 Data URI created cleanly!')

  // Write base64 helper module
  const tsContent = `// Auto-generated logo data URI
export const LOGO_DATA_URI = "${base64}"
`
  fs.writeFileSync(path.resolve('src/components/admin/logoData.ts'), tsContent)
}

optimize().catch(console.error)
