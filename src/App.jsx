import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

import './App.css'

import Navbar from './components/Navbar'
import GlobalCanvasScrub from './components/GlobalCanvasScrub'
import Scene01Bowl from './scenes/Scene01Bowl'
import Scene02Ingredients from './scenes/Scene02Ingredients'
import Scene03Infusion from './scenes/Scene03Infusion'
import Scene04Aroma from './scenes/Scene04Aroma'
import Scene05Transformation from './scenes/Scene05Transformation'
import Scene06Distribution from './scenes/Scene06Distribution'
import DavidWhyteExperience from './scenes/DavidWhyteExperience'
import Scene08Craftsmanship from './scenes/Scene08Craftsmanship'
import Scene09Quality from './scenes/Scene09Quality'
import Scene10CTA from './scenes/Scene10CTA'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Brief loading screen for fonts to load, then each CanvasScrub
    // shows its own loading progress while frames preload
    const timer = setTimeout(() => {
      setLoading(false)
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* Loading Screen */}
      {loading && (
        <div className="loading-screen">
          <div className="loading-ring" />
          <div className="loading-text">Darjeeling Origins</div>
        </div>
      )}

      {/* Film Grain */}
      <div className="grain-overlay" />

      {/* Navigation */}
      <Navbar />

      {/* 10 Cinematic Scenes */}
      <main>
        {/* Continuous Video Sequence (Scenes 1-5) */}
        <div className="continuous-sequence" style={{ position: 'relative' }}>
          <GlobalCanvasScrub />
          
          <Scene01Bowl />
          <Scene02Ingredients />
          <Scene03Infusion />
          <Scene04Aroma />
          <Scene05Transformation />
        </div>

        {/* Subsequent Scenes */}
        <Scene06Distribution />
        <DavidWhyteExperience />
        <Scene08Craftsmanship />
        <Scene09Quality />
        <Scene10CTA />
      </main>
    </>
  )
}

export default App
