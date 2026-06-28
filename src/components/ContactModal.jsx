import { useEffect, useState } from 'react'
import { useContactOpen, closeContact } from '../hooks/uiStore'
import { FORM_ENDPOINT, FORM_TO } from '../data/contacts'

// Liquid-glass contact form (same look as the project modal). Opens from the
// "interested in working with me?" star. Submits to FORM_ENDPOINT if set;
// otherwise opens a pre-filled mailto: so it's usable before the endpoint exists.
export function ContactModal() {
  const open = useContactOpen()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  // reset to a clean form whenever it reopens
  useEffect(() => {
    if (open) setStatus('idle')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && closeContact()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const mailtoFallback = () => {
    const subject = encodeURIComponent(`Portfolio enquiry — ${form.name || 'hello'}`)
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name}${form.email ? ` (${form.email})` : ''}`)
    window.location.href = `mailto:${FORM_TO}?subject=${subject}&body=${body}`
    setStatus('sent')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    if (!FORM_ENDPOINT) return mailtoFallback()
    setStatus('sending')
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className={`cmodal-root ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="modal-backdrop" onClick={closeContact} />
      <div className="cmodal" role="dialog" aria-modal="true" aria-label="Contact">
        <span className="modal__cat">Get in touch</span>
        <h2 className="modal__title">Let’s talk.</h2>
        {status === 'sent' ? (
          <p className="cmodal__sent">Sent ✓ — thank you, I’ll be in touch.</p>
        ) : (
          <form className="cmodal__form" onSubmit={onSubmit}>
            <input
              className="cmodal__field"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={set('name')}
              required
            />
            <input
              className="cmodal__field"
              type="email"
              placeholder="Your email"
              value={form.email}
              onChange={set('email')}
              required
            />
            <textarea
              className="cmodal__field cmodal__area"
              placeholder="A few words…"
              rows={5}
              value={form.message}
              onChange={set('message')}
              required
            />
            {status === 'error' && (
              <span className="cmodal__err">Couldn’t send — try again, or email {FORM_TO} directly.</span>
            )}
            <button className="cmodal__send" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send'}
            </button>
          </form>
        )}
        <button className="modal__close" onClick={closeContact} aria-label="Close">
          ✕
        </button>
      </div>
    </div>
  )
}
