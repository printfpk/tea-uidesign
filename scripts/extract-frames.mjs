/**
 * Extract frames from all tea videos using FFmpeg
 * Creates public/frames/video-N/ directories with JPG sequences
 */
import { execSync } from 'child_process'
import { mkdirSync, readdirSync } from 'fs'
import { resolve, join } from 'path'

const ffmpeg = resolve('node_modules/.pnpm/ffmpeg-static@5.3.0/node_modules/ffmpeg-static/ffmpeg.exe')
const publicDir = resolve('public')

const videos = [
  { src: 'video-1-tea.mp4', dir: 'frames/video-1' },
  { src: 'video-2-tea.mp4', dir: 'frames/video-2' },
  { src: 'video-3-tea.mp4', dir: 'frames/video-3' },
  { src: 'video-4-tea.mp4', dir: 'frames/video-4' },
  { src: 'video-5-tea.mp4', dir: 'frames/video-5' },
]

for (const { src, dir } of videos) {
  const inputPath = join(publicDir, src)
  const outputDir = join(publicDir, dir)

  // Create output directory
  mkdirSync(outputDir, { recursive: true })

  // Get video duration first
  try {
    const probeCmd = `"${ffmpeg}" -i "${inputPath}" 2>&1 | findstr Duration`
    // Skip probe, just extract at 12fps for ~60-120 frames per video
  } catch (e) {
    // ignore
  }

  console.log(`\n🎬 Extracting frames: ${src} → ${dir}/`)

  // Extract at 12fps, quality 2 (high), output as frame_001.jpg etc
  const cmd = `"${ffmpeg}" -i "${inputPath}" -vf "fps=12" -q:v 2 "${join(outputDir, 'frame_%03d.jpg')}" -y`

  try {
    execSync(cmd, { stdio: 'inherit', timeout: 60000 })
    const frameCount = readdirSync(outputDir).filter(f => f.endsWith('.jpg')).length
    console.log(`   ✅ ${frameCount} frames extracted`)
  } catch (err) {
    console.error(`   ❌ Error extracting ${src}:`, err.message)
  }
}

console.log('\n🎉 All frames extracted! Ready for canvas scrub.')
