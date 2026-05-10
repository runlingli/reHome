import { useEffect, useRef } from 'react'
import { useStore } from './store'
import { Header } from './components/Header'
import { HeroBand } from './components/HeroBand'
import { Feed } from './components/Feed'
import { Footer } from './components/Footer'
import { ItemDetail } from './components/ItemDetail'
import { Messages } from './components/Messages'
import { PostFlow } from './components/PostFlow'
import { Profile } from './components/Profile'
import { AuthModal } from './components/AuthModal'
import { NotifPanel } from './components/NotifPanel'

export default function App() {
  const { overlay, closeOverlay, initSession } = useStore()

  // Guard against React 19 StrictMode double-invocation creating duplicate Firestore listeners.
  const didInit = useRef(false)
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    initSession()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeOverlay() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeOverlay])

  useEffect(() => {
    document.body.style.overflow = overlay.kind ? 'hidden' : ''
  }, [overlay.kind])

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(() => {}, () => {})
  }, [])

  return (
    <>
      <Header />
      <HeroBand />
      <Feed />
      <Footer />

      {overlay.kind === 'item'     && <ItemDetail />}
      {overlay.kind === 'messages' && <Messages />}
      {overlay.kind === 'post'     && <PostFlow />}
      {overlay.kind === 'profile'  && <Profile />}

      <AuthModal />
      <NotifPanel />
    </>
  )
}
