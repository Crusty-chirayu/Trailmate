'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Mountain, MapPin, Route, Backpack, BarChart3, Share2, ArrowRight, Menu, X, ChevronDown, Compass, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/utils'

const NAV_LINKS = [
  { label: 'Explore', href: '#explore' },
  { label: 'Trips', href: '#trips' },
  { label: 'Routes', href: '#routes' },
  { label: 'Gear', href: '#gear' },
  { label: 'Analytics', href: '#analytics' },
]

const SECTIONS = [
  { id: 'explore', title: 'Discover your next adventure', description: 'Find trails, plan routes, and prepare for the outdoors with confidence.', icon: Compass },
  { id: 'trips', title: 'Plan with precision', description: 'Create trips with dates, activities, difficulty estimates, and visibility controls.', icon: MapPin },
  { id: 'routes', title: 'Track in real time', description: 'Record GPS waypoints as you move. Offline-first persistence keeps your route safe.', icon: Route },
  { id: 'gear', title: 'Pack with confidence', description: 'Build reusable gear templates and track packing progress.', icon: Backpack },
  { id: 'analytics', title: 'Understand your progress', description: 'Distance, elevation, moving time measured only from recorded routes.', icon: BarChart3 },
  { id: 'share', title: 'Share your story', description: 'Make trips public or share with friends. Let others follow your path.', icon: Share2 },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [scrollY, setScrollY] = useState(0)
  const [videoLoaded, setVideoLoaded] = useState(false)
const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id) }) },
      { threshold: 0.3 }
    )
    SECTIONS.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false) }
  }, [])
// Accessible mobile menu: Escape closes it, focus is moved into the menu
  // when it opens and returned to the trigger when it closes.
  const closeMenu = useCallback(() => {
    if (!mobileMenuOpen) return
    setMobileMenuOpen(false)
    menuTriggerRef.current?.focus()
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return
    menuRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeMenu()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileMenuOpen, closeMenu])

  return (
    <div className='page-shell'>
      <a href='#main-content' className='skip-link'>Skip to content</a>
      <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-500', scrollY > 50 ? 'bg-background/90 backdrop-blur-xl border-b border-border/80' : 'bg-transparent')}>
        <nav className='section-container flex items-center justify-between h-16 sm:h-20'>
          <Link href='/' className='flex items-center gap-2 group'>
            <Mountain className='h-6 w-6 text-primary-text transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110' />
            <span className='text-lg font-semibold tracking-[0.02em]'>TrailMate</span>
          </Link>
          <div className='hidden lg:flex items-center gap-8'>
            {NAV_LINKS.map(({ label, href }) => (
              <button key={label} onClick={() => scrollToSection(href.slice(1))} className={cn('text-sm font-medium transition-colors hover:text-primary', activeSection === href.slice(1) ? 'text-primary' : 'text-muted-foreground')}>{label}</button>
            ))}
          </div>
          <div className='hidden lg:flex items-center gap-4'>
            <Link href='/login' className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'>Sign in</Link>
            <Link href='/signup'><Button size='sm' className='rounded-full px-6'>Start Exploring</Button></Link>
          </div>
          <button ref={menuTriggerRef} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className='lg:hidden p-2 text-foreground hover:text-primary transition-colors' aria-expanded={mobileMenuOpen} aria-controls='mobile-menu' aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}>
            {mobileMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
          </button>
        </nav>
        {mobileMenuOpen && (
          <div ref={menuRef} id='mobile-menu' tabIndex={-1} className='lg:hidden bg-background/95 backdrop-blur-md border-b border-border'>
            <div className='section-container py-4 space-y-1'>
              {NAV_LINKS.map(({ label, href }) => (
                <button key={label} onClick={() => scrollToSection(href.slice(1))} className='block w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors'>{label}</button>
              ))}
              <div className='pt-4 px-4 space-y-3 border-t border-border mt-4'>
                <Link href='/login' className='block'><Button variant='outline' className='w-full'>Sign in</Button></Link>
                <Link href='/signup' className='block'><Button className='w-full'>Start Exploring</Button></Link>
              </div>
            </div>
          </div>
        )}
      </header>
      <main id='main-content'>
        <section className='relative min-h-screen flex items-center justify-center overflow-hidden'>
          <div className='absolute inset-0 z-0'>
            <video autoPlay loop muted playsInline onLoadedData={() => setVideoLoaded(true)} className={cn('absolute inset-0 w-full h-full object-cover transition-opacity duration-1000', videoLoaded ? 'opacity-100' : 'opacity-0')}>
              <source src='https://cdn.sceneai.art/Hero%20Section%20Video/01d1f8de-fec0-4bf5-8b48-9fc2dbc8c6b0.mp4' type='video/mp4' />
            </video>
            <div className='absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background' />
          </div>
          <div className='absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-background' />
          <div className='relative z-20 section-container text-center max-w-4xl mx-auto'>
            <div className='animate-fade-in-up'>
              <p className='eyebrow mb-6 motion-rise'>Outdoor Adventure Platform</p>
              <h1 className='motion-rise text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-8xl'>Plan the journey. <span className='gradient-text'>Live the trail.</span></h1>
              <p className='motion-rise mx-auto mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg'>Track GPS routes in real time, manage gear, analyze your progress, and share your outdoor adventures.</p>
              <div className='motion-rise flex flex-col items-center justify-center gap-4 sm:flex-row'>
                <Link href='/signup'><Button size='lg' className='rounded-full px-8 text-base font-semibold glow-sm'>Start Exploring<ArrowRight className='ml-2 h-5 w-5' /></Button></Link>
                <Link href='#explore'><Button variant='outline' size='lg' className='rounded-full px-8 text-base border-white/20 hover:border-white/40'>Learn More</Button></Link>
              </div>
            </div>
            <div className='absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce'><ChevronDown className='h-6 w-6 text-muted-foreground/50' /></div>
          </div>
        </section>
        <section className='py-24 sm:py-32'>
          <div className='section-container'>
            <div className='mb-16 max-w-2xl'>
              <p className='section-kicker mb-5'>The TrailMate field guide</p>
              <h2 className='text-3xl font-semibold tracking-[-0.03em] sm:text-5xl'>Everything you need for the trail</h2>
              <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>From planning to tracking to remembering.</p>
            </div>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {SECTIONS.map(({ id, title, description, icon: Icon }) => (
                <div key={id} id={id} className={cn('group interactive-lift border border-border/80 bg-card/70 p-7 motion-rise')}>
                  <div className='mb-10 flex h-11 w-11 items-center justify-center border border-primary/30 bg-primary/10 text-primary-text transition-colors group-hover:bg-primary/20'><Icon className='h-5 w-5' /></div>
                  <h3 className='text-lg font-semibold mb-3'>{title}</h3>
                  <p className='text-muted-foreground leading-relaxed'>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className='border-y border-border/80 bg-card/30 py-20'>
          <div className='section-container'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-8 text-center'>
              {[{ value: 'GPS', label: 'Real-time tracking', icon: MapPin },{ value: 'Offline', label: 'Works without signal', icon: Zap },{ value: 'GPX', label: 'Import & export routes', icon: Route },{ value: 'Free', label: 'Open source', icon: Mountain }].map(({ value, label, icon: Icon }) => (
                <div key={label} className='space-y-3'><div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto'><Icon className='h-5 w-5 text-primary' /></div><div className='text-2xl font-bold'>{value}</div><div className='text-sm text-muted-foreground'>{label}</div></div>
              ))}
            </div>
          </div>
        </section>
        <section className='py-28 sm:py-40'>
          <div className='section-container text-center'>
            <p className='section-kicker mb-5 justify-center'>Make the miles count</p>
            <h2 className='text-3xl font-semibold tracking-[-0.03em] sm:text-5xl'>Ready for your next adventure?</h2>
            <p className='text-muted-foreground text-lg max-w-xl mx-auto mb-10'>Join TrailMate and start planning your outdoor experiences today.</p>
            <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              <Link href='/signup'><Button size='lg' className='rounded-full px-8 text-base font-semibold'>Start Exploring<ArrowRight className='ml-2 h-5 w-5' /></Button></Link>
              <Link href='/login'><Button variant='ghost' size='lg' className='rounded-full px-8 text-base'>Already have an account?</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <footer className='border-t border-border py-12'>
        <div className='section-container'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-6'>
            <div className='flex items-center gap-2'><Mountain className='h-5 w-5 text-primary' /><span className='font-semibold'>TrailMate</span></div>
            <p className='text-sm text-muted-foreground'>Plan the journey. Live the trail.</p>
            <div className='flex items-center gap-6'><Link href='/login' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>Sign in</Link><Link href='/signup' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>Get started</Link></div>
          </div>
        </div>
      </footer>
    </div>
  )
}
