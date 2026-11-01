import { useState } from "react";
import { ArrowRight, Globe2, Heart, Menu, MoonStar, ShieldCheck, Sparkles, X } from "lucide-react";

const currencies = [
  { code: "USD", label: "United States · USD" },
  { code: "INR", label: "India · INR" },
  { code: "GBP", label: "United Kingdom · GBP" },
  { code: "EUR", label: "Europe · EUR" },
  { code: "CAD", label: "Canada · CAD" },
  { code: "AUD", label: "Australia · AUD" },
  { code: "AED", label: "UAE · AED" }
];

export default function App() {
  const [currency, setCurrency] = useState("USD");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main>
      <div className="announcement"><Sparkles size={14} /> A more thoughtful space for personal guidance <span>Explore Lumsic <ArrowRight size={13} /></span></div>
      <header className="site-header">
        <a className="brand" href="#" aria-label="Lumsic home"><span className="brand-mark"><MoonStar size={21} /></span><span>LUMSIC</span></a>
        <nav className={menuOpen ? "nav nav-open" : "nav"}>
          <a href="#readers" onClick={() => setMenuOpen(false)}>Our readers</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>Our approach</a>
          <a href="#support" onClick={() => setMenuOpen(false)}>Support</a>
        </nav>
        <div className="header-actions">
          <label className="currency-select"><Globe2 size={15} /><select aria-label="Choose currency" value={currency} onChange={e => setCurrency(e.target.value)}>{currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}</select></label>
          <a className="login-link" href="#login">Log in</a>
          <a className="button button-small" href="#readers">Get started <ArrowRight size={15} /></a>
        </div>
        <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span></span> A little clarity can change a lot</div>
          <h1>Find your way.<br /><em>In your own time.</em></h1>
          <p className="hero-text">Life doesn't always come with clear answers. Connect with thoughtful astrology and psychic readers who can help you explore what comes next.</p>
          <div className="hero-buttons"><a className="button" href="#readers">Meet our readers <ArrowRight size={17} /></a><a className="text-link" href="#how-it-works">How Lumsic works <span>↗</span></a></div>
          <div className="hero-note"><ShieldCheck size={16} /> Private conversations. Your choices, always.</div>
        </div>
        <div className="hero-art" aria-label="Abstract celestial artwork">
          <div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div>
          <div className="moon-disc"><div className="moon-cut"></div><Sparkles className="sparkle sparkle-one" size={22} /><Sparkles className="sparkle sparkle-two" size={15} /></div>
          <div className="art-caption"><span>YOUR JOURNEY</span><strong>Starts with a question.</strong></div>
          <span className="star star-a">✦</span><span className="star star-b">✧</span><span className="star star-c">✦</span>
        </div>
      </section>

      <section className="trust-strip">
        <div><Heart size={18} /><span>Guidance with empathy</span></div>
        <div><ShieldCheck size={18} /><span>Your privacy matters</span></div>
        <div><Globe2 size={18} /><span>A welcoming global community</span></div>
      </section>

      <section className="section readers-section" id="readers">
        <div className="section-heading"><div><div className="eyebrow">YOUR NEXT STEP</div><h2>Meet the readers</h2><p>Find a reader whose approach feels right for you.</p></div><span className="coming-soon">Reader profiles are being prepared</span></div>
        <div className="empty-readers"><div className="empty-icon"><Sparkles size={24} /></div><h3>A considered match takes time.</h3><p>We're preparing reader profiles and availability. Check back soon to explore verified introductions and choose the right conversation for you.</p></div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="section-heading centered"><div className="eyebrow">SIMPLE BY DESIGN</div><h2>A conversation, your way.</h2><p>Thoughtful guidance should feel easy to access and comfortable to explore.</p></div>
        <div className="steps">
          <article><span>01</span><div className="step-icon"><Globe2 /></div><h3>Explore</h3><p>Discover reader approaches and find the kind of guidance you're looking for.</p></article>
          <article><span>02</span><div className="step-icon"><Heart /></div><h3>Choose</h3><p>Review reader profiles, availability and session details before you decide.</p></article>
          <article><span>03</span><div className="step-icon"><MoonStar /></div><h3>Connect</h3><p>Start a private conversation when you're ready, at a pace that feels right.</p></article>
        </div>
      </section>

      <section className="about-band" id="about"><div className="about-symbol"><MoonStar size={30} /></div><div><div className="eyebrow">THE LUMSIC APPROACH</div><h2>Guidance should empower, not decide for you.</h2><p>We believe a good reading creates room for reflection. Your decisions remain yours, always.</p></div></section>

      <footer id="support"><a className="brand footer-brand" href="#"><span className="brand-mark"><MoonStar size={20} /></span><span>LUMSIC</span></a><p>Space to pause. Guidance to reflect. Your path to choose.</p><div className="footer-links"><a href="#about">About</a><a href="#support">Contact</a><a href="#support">Privacy</a><a href="#support">Terms</a></div><small>© {new Date().getFullYear()} Lumsic. All rights reserved.</small></footer>
    </main>
  );
}