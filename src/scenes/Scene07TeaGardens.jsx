import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SceneNumber from '../components/SceneNumber'

/* ─── Darjeeling Illustration Atlas ─── */
import imgMountain01 from '../assets/atlas/mountain-01.png'
import imgMountain02 from '../assets/atlas/mountain-02.png'
import imgTeaHill01 from '../assets/atlas/tea-hill-01.png'
import imgTeaHill02 from '../assets/atlas/tea-hill-02.png'
import imgTeaBushRow from '../assets/atlas/tea-bush-row.png'
import imgTeaBushCluster from '../assets/atlas/tea-bush-cluster.png'
import imgStonePath from '../assets/atlas/stone-path.png'
import imgFence from '../assets/atlas/wooden-fence.png'
import imgPickerBending from '../assets/atlas/tea-picker-bending.png'
import imgPickerStanding from '../assets/atlas/tea-picker-standing.png'
import imgMist01 from '../assets/atlas/mist-01.png'
import imgMist02 from '../assets/atlas/mist-02.png'

gsap.registerPlugin(ScrollTrigger)

/* ──────────────────────────────────────────────
   THE ORIGIN
   David Whyte–inspired watercolor composition.
   One artist. One painting. Assembled by scroll.
   ────────────────────────────────────────────── */

const PARAGRAPH = [
  'Every remarkable cup begins long before it reaches your hands.',
  '',
  'High in the mist-covered hills of Darjeeling, where cool mountain air meets rich Himalayan soil, generations of skilled tea growers patiently nurture each plant.',
  '',
  'Every tender leaf is carefully hand-plucked at the perfect moment, preserving the delicate aroma, floral character and unmistakable elegance that have made Darjeeling tea celebrated around the world.',
  '',
  'Here, time moves slowly, nature leads every season and craftsmanship transforms simple leaves into an extraordinary experience.',
]

export default function Scene07TeaGardens() {
  const sectionRef = useRef(null)
  const pinRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ═══════════════════════════════════════════════
         ONE MASTER TIMELINE
         100 arbitrary units mapped to 350vh of scroll.
         ═══════════════════════════════════════════════ */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        },
      })

      /* ─── MOUNTAINS (0 → 20) ─── */
      tl.fromTo('.atlas-mountain-01',
        { y: 120, opacity: 0 },
        { y: 0, opacity: 0.9, duration: 20, ease: 'power1.out' },
        0
      )
      tl.fromTo('.atlas-mountain-02',
        { y: 90, opacity: 0 },
        { y: 0, opacity: 0.85, duration: 18, ease: 'power1.out' },
        3
      )

      /* ─── TEA HILLS (15 → 35) ─── */
      tl.fromTo('.atlas-tea-hill-01',
        { x: 140, opacity: 0 },
        { x: 0, opacity: 1, duration: 20, ease: 'power1.out' },
        15
      )
      tl.fromTo('.atlas-tea-hill-02',
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 18, ease: 'power1.out' },
        18
      )

      /* ─── TEA BUSHES (30 → 45) ─── */
      tl.fromTo('.atlas-bush-row',
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 15, ease: 'power1.out' },
        30
      )
      tl.fromTo('.atlas-bush-cluster',
        { x: -80, opacity: 0 },
        { x: 0, opacity: 1, duration: 15, ease: 'power1.out' },
        33
      )

      /* ─── MIST (30 → 50) ─── */
      tl.fromTo('.atlas-mist-02',
        { x: 50, opacity: 0 },
        { x: 0, opacity: 0.55, duration: 20, ease: 'power1.out' },
        30
      )
      tl.fromTo('.atlas-mist-01',
        { x: -40, opacity: 0 },
        { x: 0, opacity: 0.5, duration: 20, ease: 'power1.out' },
        35
      )

      /* ─── STONE PATH (45 → 60) ─── */
      tl.fromTo('.atlas-stone-path',
        { x: -120, opacity: 0 },
        { x: 0, opacity: 1, duration: 15, ease: 'power1.out' },
        45
      )

      /* ─── FENCE (55 → 70) ─── */
      tl.fromTo('.atlas-fence',
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 15, ease: 'power1.out' },
        55
      )

      /* ─── TEA PICKERS (65 → 85) ─── */
      tl.fromTo('.atlas-picker-bending',
        { y: 140, opacity: 0 },
        { y: 0, opacity: 1, duration: 15, ease: 'power1.out' },
        65
      )
      tl.fromTo('.atlas-picker-standing',
        { y: 140, opacity: 0 },
        { y: 0, opacity: 1, duration: 15, ease: 'power1.out' },
        75
      )

      /* ─── TYPOGRAPHY ─── */

      /* Word-by-word reveal (5 → 30) */
      tl.to('.reveal-word', {
        opacity: 1,
        y: 0,
        duration: 1.5,
        stagger: { amount: 23 },
        ease: 'none',
      }, 5)

      /* Text rises and fades (55 → 85) */
      tl.to('.scene-07-text', {
        y: -220,
        opacity: 0,
        duration: 30,
        ease: 'power2.inOut',
      }, 55)

      /* ─── MIST: Independent drift (not scroll-linked) ─── */
      gsap.to('.atlas-mist-01', {
        y: '-=20',
        duration: 5.5,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })
      gsap.to('.atlas-mist-02', {
        y: '+=15',
        duration: 7,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 2,
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  /* ─── Shared positioning class ─── */
  const illu = 'absolute pointer-events-none will-change-transform'

  return (
    <section
      ref={sectionRef}
      className="scene-07 relative"
      style={{ height: '450vh' }}
    >
      <div
        ref={pinRef}
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: '100vh' }}
      >

        {/* ═══ PAPER BACKGROUND ═══ */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #F5F0E8 0%, #EDE6D8 50%, #E8E0D0 100%)',
            zIndex: 0,
          }}
        />

        {/* Paper grain texture (CSS noise) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px',
            opacity: 0.035,
            mixBlendMode: 'multiply',
            zIndex: 0,
          }}
        />

        {/* ═══ LAYER 1: Mountain 01 (far back) ═══ */}
        <img
          src={imgMountain01}
          className={`atlas-mountain-01 ${illu}`}
          style={{
            top: '0%', left: '5%',
            width: '90%', height: 'auto',
            zIndex: 1, opacity: 0,
          }}
          alt=""
        />

        {/* ═══ LAYER 2: Mountain 02 (mid-back) ═══ */}
        <img
          src={imgMountain02}
          className={`atlas-mountain-02 ${illu}`}
          style={{
            top: '8%', left: '0%',
            width: '100%', height: 'auto',
            zIndex: 2, opacity: 0,
          }}
          alt=""
        />

        {/* ═══ LAYER 3: Tea Hill 01 ═══ */}
        <img
          src={imgTeaHill01}
          className={`atlas-tea-hill-01 ${illu}`}
          style={{
            top: '15%', left: '-5%',
            width: '65%', height: 'auto',
            zIndex: 3, opacity: 0,
          }}
          alt=""
        />

        {/* ═══ LAYER 4: Tea Hill 02 ═══ */}
        <img
          src={imgTeaHill02}
          className={`atlas-tea-hill-02 ${illu}`}
          style={{
            top: '18%', right: '-5%',
            width: '60%', height: 'auto',
            zIndex: 3, opacity: 0,
          }}
          alt=""
        />

        {/* ═══ LAYER 5: Tea Bush Row ═══ */}
        <img
          src={imgTeaBushRow}
          className={`atlas-bush-row ${illu}`}
          style={{
            bottom: '12%', left: '0%',
            width: '80%', height: 'auto',
            zIndex: 4, opacity: 0,
          }}
          alt=""
        />

        {/* ═══ LAYER 6: Tea Bush Cluster ═══ */}
        <img
          src={imgTeaBushCluster}
          className={`atlas-bush-cluster ${illu}`}
          style={{
            bottom: '8%', right: '0%',
            width: '45%', height: 'auto',
            zIndex: 4, opacity: 0,
          }}
          alt=""
        />

        {/* ═══ LAYER 7: Stone Path ═══ */}
        <img
          src={imgStonePath}
          className={`atlas-stone-path ${illu}`}
          style={{
            bottom: '5%', left: '20%',
            width: '60%', height: 'auto',
            zIndex: 5, opacity: 0,
          }}
          alt=""
        />

        {/* ═══ LAYER 8: Wooden Fence ═══ */}
        <img
          src={imgFence}
          className={`atlas-fence ${illu}`}
          style={{
            bottom: '0%', left: '10%',
            width: '80%', height: 'auto',
            zIndex: 6, opacity: 0,
          }}
          alt=""
        />

        {/* ═══ LAYER 9: Tea Picker Bending ═══ */}
        <img
          src={imgPickerBending}
          className={`atlas-picker-bending ${illu}`}
          style={{
            bottom: '12%', left: '30%',
            height: '42%', width: 'auto',
            zIndex: 7, opacity: 0,
          }}
          alt=""
        />

        {/* ═══ LAYER 10: Tea Picker Standing ═══ */}
        <img
          src={imgPickerStanding}
          className={`atlas-picker-standing ${illu}`}
          style={{
            bottom: '10%', right: '22%',
            height: '48%', width: 'auto',
            zIndex: 7, opacity: 0,
          }}
          alt=""
        />

        {/* ═══ LAYER 11: Mist 02 (deeper) ═══ */}
        <img
          src={imgMist02}
          className={`atlas-mist-02 ${illu}`}
          style={{
            top: '25%', left: '-10%',
            width: '120%', height: 'auto',
            zIndex: 8, opacity: 0,
            mixBlendMode: 'multiply',
          }}
          alt=""
        />

        {/* ═══ LAYER 12: Mist 01 (front) ═══ */}
        <img
          src={imgMist01}
          className={`atlas-mist-01 ${illu}`}
          style={{
            top: '35%', left: '-5%',
            width: '110%', height: 'auto',
            zIndex: 9, opacity: 0,
            mixBlendMode: 'multiply',
          }}
          alt=""
        />

        {/* ═══ TYPOGRAPHY ═══ */}
        <div
          className="scene-07-text absolute pointer-events-none will-change-transform"
          style={{
            top: '18vh',
            left: '12vw',
            zIndex: 11,
          }}
        >
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 300,
              fontSize: 'clamp(3rem, 6vw, 5.5rem)',
              lineHeight: 1.05,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#1A1A1A',
              marginBottom: '1.8rem',
            }}
          >
            The Origin
          </h2>

          <div style={{ maxWidth: '620px' }}>
            {PARAGRAPH.map((line, lineIdx) => {
              if (line === '') {
                return <br key={`br-${lineIdx}`} />
              }
              const words = line.split(' ')
              return (
                <p
                  key={lineIdx}
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontWeight: 400,
                    fontSize: 'clamp(17px, 1.25vw, 21px)',
                    lineHeight: 1.75,
                    color: '#3A3530',
                    margin: 0,
                  }}
                >
                  {words.map((word, wIdx) => (
                    <span
                      key={`${lineIdx}-${wIdx}`}
                      className="reveal-word"
                      style={{
                        display: 'inline-block',
                        opacity: 0.08,
                        transform: 'translateY(5px)',
                        willChange: 'opacity, transform',
                        marginRight: '0.28em',
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </p>
              )
            })}
          </div>
        </div>

        {/* ═══ SCENE NUMBER ═══ */}
        <div className="absolute top-0 right-0 p-8" style={{ zIndex: 12 }}>
          <SceneNumber number={7} />
        </div>

      </div>
    </section>
  )
}
