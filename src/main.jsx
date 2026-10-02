import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const menu = {
  'From the fire': [
    { name: 'Charred sourdough', detail: 'Cultured butter, smoked sea salt', price: '9', tag: 'A little start' },
    { name: 'Wood-roasted carrots', detail: 'Whipped ricotta, chili honey, dill', price: '16', tag: 'Garden' },
    { name: 'Dry-aged ribeye', detail: '28-day aged, café de Paris butter, fries', price: '48', tag: 'For the table' },
  ],
  'From the garden': [
    { name: 'Heirloom tomato salad', detail: 'Stone fruit, basil, sherry vinaigrette', price: '18', tag: 'Seasonal' },
    { name: 'Wild mushroom toast', detail: 'Hen of the woods, thyme, parmesan', price: '20', tag: 'Wood-fired' },
    { name: 'Brown butter squash', detail: 'Sage, hazelnut, aged balsamic', price: '24', tag: 'Garden' },
  ],
  'Something sweet': [
    { name: 'Olive oil cake', detail: 'Macerated berries, crème fraîche', price: '14', tag: 'House favorite' },
    { name: 'Chocolate pot de crème', detail: 'Maldon salt, burnt orange', price: '15', tag: 'A little rich' },
    { name: 'Market fruit sorbet', detail: 'Three scoops, made in-house', price: '12', tag: 'Dairy free' },
  ],
};

const heroImage = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=2400&q=90';

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });

    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function App() {
  const [activeMenu, setActiveMenu] = useState('From the fire');
  const [bookingState, setBookingState] = useState('idle');
  const [bookingMessage, setBookingMessage] = useState('');
  const [today] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  useReveal();

  useEffect(() => {
    const hero = document.querySelector('.hero__image');
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let frame = 0;
    const move = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY, window.innerHeight) * 0.22;
        hero.style.transform = `translate3d(0, ${offset}px, 0) scale(1.06)`;
      });
    };
    window.addEventListener('scroll', move, { passive: true });
    return () => {
      window.removeEventListener('scroll', move);
      cancelAnimationFrame(frame);
    };
  }, []);

  async function submitReservation(event) {
    event.preventDefault();
    setBookingState('loading');
    setBookingMessage('');
    const form = event.currentTarget;
    const formData = new FormData(form);
    const reservation = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not save your reservation.');
      setBookingState('success');
      setBookingMessage(`Thank you, ${reservation.name}. Your table request for ${reservation.guests} on ${reservation.date} at ${reservation.time} is in.`);
      form.reset();
    } catch (error) {
      setBookingState('error');
      setBookingMessage(error.message || 'We could not reach the reservation service. Please try again.');
    }
  }

  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Savor home">savor<span>.</span></a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#menu">The menu</a>
          <a href="#story">Our story</a>
          <a href="#visit">Find us</a>
        </nav>
        <a className="header-book" href="#reserve">Book a table <span aria-hidden="true">↗</span></a>
      </header>

      <main>
        <section className="hero" id="home" aria-label="Savor restaurant">
          <div className="hero__image" style={{ backgroundImage: `url("${heroImage}")` }} />
          <div className="hero__veil" />
          <div className="hero__content">
            <p className="eyebrow hero__eyebrow"><span /> A neighborhood kitchen · New York</p>
            <h1>A table worth<br /><em>staying for.</em></h1>
            <p className="hero__intro">Wood-fired cooking, the best of the season,<br className="desktop-break" /> and one more glass before you go.</p>
            <a className="button button--orange" href="#reserve">Find your table <span aria-hidden="true">↗</span></a>
          </div>
          <div className="hero__bottom">
            <span>Season-led. Fire-loved.</span>
            <a href="#menu">Scroll to explore <span aria-hidden="true">↓</span></a>
            <span>Open tonight until 10</span>
          </div>
        </section>

        <section className="intro-band">
          <p className="eyebrow reveal">Good food. Good company.</p>
          <h2 className="reveal">Come hungry.<br /><em>Leave a little happier.</em></h2>
          <p className="intro-band__copy reveal">Savor is a small, lively place for the long lunch, the just-because dinner, and everything worth gathering around.</p>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading reveal">
            <div><p className="eyebrow">A taste of the season</p><h2>Made for <em>sharing.</em></h2></div>
            <a className="text-link" href="#reserve">See you at the table <span aria-hidden="true">↗</span></a>
          </div>
          <div className="menu-layout">
            <div className="menu-photo reveal">
              <img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1100&q=85" alt="A colorful seasonal plate served for sharing" />
              <span className="photo-caption">Cooked slowly. Shared freely.</span>
            </div>
            <div className="menu-list reveal">
              <div className="menu-tabs" role="tablist" aria-label="Menu categories">
                {Object.keys(menu).map((category) => (
                  <button key={category} type="button" role="tab" aria-selected={activeMenu === category} className={activeMenu === category ? 'menu-tab active' : 'menu-tab'} onClick={() => setActiveMenu(category)}>{category}</button>
                ))}
              </div>
              <div className="menu-items" key={activeMenu} role="tabpanel">
                {menu[activeMenu].map((item, index) => (
                  <article className="menu-item" style={{ '--item-order': index }} key={item.name}>
                    <div className="menu-item__meta"><span>{item.tag}</span><span>${item.price}</span></div>
                    <h3>{item.name}</h3>
                    <p>{item.detail}</p>
                  </article>
                ))}
              </div>
              <p className="menu-note">Our menu moves with the market. Ask us about tonight’s specials and dietary accommodations.</p>
            </div>
          </div>
        </section>

        <section className="story-section" id="story">
          <div className="story-image reveal">
            <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1300&q=85" alt="Chef preparing a dish in a busy restaurant kitchen" />
            <span className="story-stamp">From our<br />kitchen, with love</span>
          </div>
          <div className="story-copy reveal">
            <p className="eyebrow">A note from the kitchen</p>
            <h2>Good things<br />take <em>their time.</em></h2>
            <p>Chef Mara grew up where the kitchen was always the warmest room in the house. At Savor, she brings that feeling to every plate: produce from people she knows, a fire that never quite goes out, and food made to be passed around.</p>
            <p>Nothing too precious. Everything made with care.</p>
            <span className="signature">Mara Ellis <small>Chef & co-founder</small></span>
          </div>
        </section>

        <section className="reservation-section" id="reserve">
          <div className="reservation-copy reveal">
            <p className="eyebrow">Your seat is waiting</p>
            <h2>Make a little<br /><em>evening of it.</em></h2>
            <p>For parties of 7 or more, or a last-minute table, give us a call at <a href="tel:+12125550148">(212) 555-0148</a>.</p>
            <div className="reservation-hours"><span>Tuesday – Sunday</span><span>5:00 pm – 10:00 pm</span></div>
          </div>
          <form className="reservation-form reveal" onSubmit={submitReservation}>
            <div className="form-heading"><span>01</span><h3>Find your table</h3></div>
            <label className="field field--wide">Your name<input name="name" autoComplete="name" placeholder="Name" maxLength="120" required /></label>
            <label className="field">Email address<input name="email" type="email" autoComplete="email" placeholder="you@email.com" maxLength="254" required /></label>
            <label className="field">Phone <span className="optional">Optional</span><input name="phone" type="tel" autoComplete="tel" placeholder="(212) 555-0100" maxLength="40" /></label>
            <label className="field">Date<input name="date" type="date" min={today} required /></label>
            <label className="field">Time<select name="time" defaultValue="" required><option value="" disabled>Select a time</option><option value="17:00">5:00 pm</option><option value="17:30">5:30 pm</option><option value="18:00">6:00 pm</option><option value="18:30">6:30 pm</option><option value="19:00">7:00 pm</option><option value="19:30">7:30 pm</option><option value="20:00">8:00 pm</option><option value="20:30">8:30 pm</option><option value="21:00">9:00 pm</option></select></label>
            <label className="field">Guests<select name="guests" defaultValue="2" required>{Array.from({ length: 12 }, (_, index) => <option value={index + 1} key={index + 1}>{index + 1} {index === 0 ? 'guest' : 'guests'}</option>)}</select></label>
            <label className="field field--wide">A note for us <span className="optional">Optional</span><textarea name="notes" rows="2" maxLength="500" placeholder="Allergies, a special occasion, or anything else we should know" /></label>
            <button className="button button--orange reserve-submit" type="submit" disabled={bookingState === 'loading'}>{bookingState === 'loading' ? 'Saving your request…' : 'Request a table'} <span aria-hidden="true">↗</span></button>
            <p className={`form-message ${bookingState}`} aria-live="polite">{bookingMessage}</p>
            <p className="form-footnote">Your reservation request is subject to availability. We’ll be in touch to confirm.</p>
          </form>
        </section>

        <section className="visit-section" id="visit">
          <div className="visit-details reveal">
            <p className="eyebrow">Right around the corner</p>
            <h2>Find <em>your way.</em></h2>
            <address>18 Crosby Street<br />New York, NY 10013</address>
            <a className="text-link" href="https://maps.google.com/?q=18+Crosby+Street+New+York+NY+10013" target="_blank" rel="noreferrer">Get directions <span aria-hidden="true">↗</span></a>
            <div className="visit-hours"><span>Tue – Thu <b>5–9 pm</b></span><span>Fri – Sun <b>5–10 pm</b></span><span>Monday <b>Taking a little breather</b></span></div>
          </div>
          <div className="map-frame reveal"><iframe title="Map showing Savor at 18 Crosby Street, New York" src="https://www.openstreetmap.org/export/embed.html?bbox=-73.9998%2C40.7184%2C-73.9922%2C40.7248&amp;layer=mapnik&amp;marker=40.7216%2C-73.9960" loading="lazy" /></div>
        </section>
      </main>

      <footer className="site-footer"><a className="wordmark" href="#home">savor<span>.</span></a><span>Good food, good company. Always.</span><a href="https://instagram.com" target="_blank" rel="noreferrer">Follow along <span aria-hidden="true">↗</span></a><small>© 2026 Savor Kitchen</small></footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);