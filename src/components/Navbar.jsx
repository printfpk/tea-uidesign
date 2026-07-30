import React, { useState } from 'react'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <nav 
        className="fixed top-0 left-0 w-full z-[60] flex justify-between items-center pointer-events-none px-6 py-8 md:px-12 md:py-12"
        style={{ 
          background: isMobileMenuOpen ? 'transparent' : 'rgba(10, 10, 10, 0.25)',
          backdropFilter: isMobileMenuOpen ? 'none' : 'blur(24px) saturate(150%)',
          WebkitBackdropFilter: isMobileMenuOpen ? 'none' : 'blur(24px) saturate(150%)',
          borderBottom: isMobileMenuOpen ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: isMobileMenuOpen ? 'none' : '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease'
        }}
      >
        
        {/* LEFT: Brand Logo */}
        <div className="pointer-events-auto z-[60]">
          <a href="#" className="text-white text-sm tracking-[0.2em] uppercase font-medium">
            Darjeeling Origins
          </a>
        </div>

        {/* RIGHT: White Pill Navigation Buttons (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-3 pointer-events-auto">
          
          <button 
            className="flex items-center gap-1.5 bg-white text-black rounded-full text-[15px] hover:bg-gray-100 transition-colors"
            style={{ padding: '10px 24px' }}
          >
            Shop
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          <button 
            className="flex items-center gap-1.5 bg-white text-black rounded-full text-[15px] hover:bg-gray-100 transition-colors"
            style={{ padding: '10px 24px' }}
          >
            Learn
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          <button 
            className="bg-white text-black rounded-full text-[15px] hover:bg-gray-100 transition-colors"
            style={{ padding: '10px 24px' }}
          >
            Subscription
          </button>

          <button className="flex items-center justify-center bg-white text-black w-[42px] h-[42px] rounded-full text-[15px] hover:bg-gray-100 transition-colors">
            Fr
          </button>

          <button className="flex items-center justify-center bg-white text-black w-[42px] h-[42px] rounded-full hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20a6 6 0 0 0-12 0"/>
              <circle cx="12" cy="10" r="4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </button>

          <button className="flex items-center justify-center bg-white text-black w-[42px] h-[42px] rounded-full hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1.5"/>
              <circle cx="19" cy="21" r="1.5"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
          </button>
        </div>

        {/* MOBILE: Hamburger Menu */}
        <div className="flex md:hidden items-center pointer-events-auto z-[60]">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-center bg-white text-black w-[42px] h-[42px] rounded-full hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* MOBILE FULLSCREEN MENU */}
      <div 
        className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col justify-center items-center gap-6 transition-all duration-500 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <button className="text-white text-3xl font-medium tracking-wide hover:text-gray-300 transition-colors">
          Shop
        </button>
        <button className="text-white text-3xl font-medium tracking-wide hover:text-gray-300 transition-colors">
          Learn
        </button>
        <button className="text-white text-3xl font-medium tracking-wide hover:text-gray-300 transition-colors">
          Subscription
        </button>
        
        <div className="flex gap-4 mt-8">
          <button className="flex items-center justify-center bg-white/10 text-white w-[50px] h-[50px] rounded-full hover:bg-white/20 transition-colors">
            Fr
          </button>
          <button className="flex items-center justify-center bg-white/10 text-white w-[50px] h-[50px] rounded-full hover:bg-white/20 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20a6 6 0 0 0-12 0"/>
              <circle cx="12" cy="10" r="4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </button>
          <button className="flex items-center justify-center bg-white/10 text-white w-[50px] h-[50px] rounded-full hover:bg-white/20 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1.5"/>
              <circle cx="19" cy="21" r="1.5"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
