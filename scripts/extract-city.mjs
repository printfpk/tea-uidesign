import { execSync } from 'child_process'
import { mkdirSync, readdirSync } from 'fs'
import { resolve, join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const ffmpeg = resolve(root, 'node_modules/.pnpm/ffmpeg-static@5.3.0/node_modules/ffmpeg-static/ffmpeg.exe')
const publicDir = resolve(root, 'public')

const inputPath = join(publicDir, 'city-map.mp4')
const outputDir = join(publicDir, 'frames/city-map')

mkdirSync(outputDir, { recursive: true })

console.log('Extracting frames from city-map.mp4...')
const cmd = `"${ffmpeg}" -i "${inputPath}" -vf "fps=12" -q:v 2 "${join(outputDir, 'frame_%03d.jpg')}" -y`

try {
  execSync(cmd, { stdio: 'inherit', timeout: 60000 })
  const frameCount = readdirSync(outputDir).filter(f => f.endsWith('.jpg')).length
  console.log(`Extracted ${frameCount} frames.`)
} catch (err) {
  console.error('Error extracting:', err.message)
}
