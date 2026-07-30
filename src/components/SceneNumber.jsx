export default function SceneNumber({ number }) {
  return (
    <div className="scene-number">
      {String(number).padStart(2, '0')}
    </div>
  )
}
