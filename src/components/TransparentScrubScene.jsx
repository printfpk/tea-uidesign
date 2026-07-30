export default function TransparentScrubScene({
  children,
  className = '',
  scrubDuration = 3,
}) {
  return (
    <section
      className={`scene ${className}`}
      // The height drives the scroll duration for this specific segment of the timeline
      style={{ height: `${scrubDuration * 100}vh`, position: 'relative', display: 'block', zIndex: 1 }}
    >
      <div 
        className="scene-content"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {children}
      </div>
    </section>
  )
}
