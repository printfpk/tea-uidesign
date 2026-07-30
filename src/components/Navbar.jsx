import React from 'react'

export default function Navbar() {
  return (
    <nav 
      className="fixed top-0 left-0 w-full z-50 flex justify-between items-center pointer-events-none"
      style={{ 
        paddingTop: '24px', 
        paddingLeft: '48px', 
        paddingRight: '48px', 
        paddingBottom: '24px',
        background: 'rgba(10, 10, 10, 0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      
      {/* LEFT: Brand Logo */}
      <div className="pointer-events-auto">
        <a href="#" className="text-white text-sm tracking-[0.2em] uppercase font-medium">
          Darjeeling Origins
        </a>
      </div>

      {/* RIGHT: White Pill Navigation Buttons */}
      <div className="flex items-center gap-3 pointer-events-auto">
        
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
    </nav>
  )
}
