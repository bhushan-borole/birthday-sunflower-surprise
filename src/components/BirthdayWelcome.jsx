import { useEffect, useRef, useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import portrait from '../img/popup.jpg'

export default function BirthdayWelcome({ onDismiss }) {
  const dialog = useRef(null)
  const enterButton = useRef(null)
  const [photoFailed, setPhotoFailed] = useState(false)
  useEffect(() => {
    const element = dialog.current
    element.showModal()
    enterButton.current.focus({ preventScroll: true })
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])
  const trapTab = (event) => {
    if (event.key !== 'Tab') return
    const buttons = [...dialog.current.querySelectorAll('button')]
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
  return (
    <main className="welcome-stage">
      <dialog className="birthday-welcome" ref={dialog} aria-labelledby="welcome-title"
        aria-describedby="welcome-message"
        onKeyDown={trapTab}
        onCancel={(event) => { event.preventDefault(); onDismiss() }}>
        <button className="welcome-close" type="button" aria-label="Close birthday welcome"
          onClick={onDismiss}><X size={22} /></button>
        <div className="welcome-portrait">
          {!photoFailed ? (
            <img src={portrait} alt="A birthday portrait of you" onError={() => setPhotoFailed(true)} />
          ) : (
            <div className="portrait-placeholder" role="status">
              <svg viewBox="0 0 180 240" aria-hidden="true" fill="none">
                <path d="M84 229C79 171 116 118 90 62M91 135C131 142 150 114 151 97C113 97 96 115 91 135ZM88 167C57 173 32 145 33 127C66 125 79 144 88 167Z" />
                <path d="M90 64C65 63 55 38 69 29C80 22 91 36 91 36C99 19 119 23 119 35C119 52 102 62 90 64Z" />
              </svg>
              <span>The portrait could not be loaded.</span>
              <span className="sr-only">Please continue to your birthday note.</span>
            </div>
          )}
          <span className="portrait-caption">the loveliest reason to celebrate</span>
        </div>
        <div className="welcome-copy">
          <p className="eyebrow">October 8 · your day</p>
          <h1 id="welcome-title">Happy birthday,<br /><em>my love.</em></h1>
          <p id="welcome-message">Before anything else,<br />a little moment just for you.</p>
          <p className="welcome-note">I'm so glad the world has you.<br />And even gladder that I do.</p>
          <button className="continue-button" type="button" onClick={onDismiss} ref={enterButton}>
            Step inside <ArrowRight size={18} />
          </button>
        </div>
      </dialog>
    </main>
  )
}
