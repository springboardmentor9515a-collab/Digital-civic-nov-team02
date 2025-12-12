// src/pages/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/landing.css";
import HeroImg from "../assets/landing-hero.png";      // put hero image here // optional decorative image    // reuse existing logo

export default function Landing() {
  return (
    <div className="lp-root">
      <header className="lp-topbar">
        <div className="lp-brand">
          <span className="lp-logo">🏛️</span>
          <span className="lp-brand-text">Civix</span>
        </div>

        <div className="lp-cta-row">
          <Link to="/login" className="lp-btn lp-btn-primary">Sign In</Link>
          <Link to="/signup" className="lp-btn lp-btn-primary">Get Started</Link>
        </div>
      </header>

      <main className="lp-main">
        <section className="lp-hero">
          <div className="lp-hero-left">
            <h1 className="lp-headline">
              Empowering Citizens.
              <br />
              <span className="lp-highlight">Transforming Communities.</span>
            </h1>

            <p className="lp-sub">
              Civix lets people raise petitions, vote on local issues, and track government responses — all in one platform.
            </p>

            <div className="lp-actions">
              <Link to="/signup" className="lp-btn lp-btn-primary">Start a Petition</Link>
              <Link to="/login" className="lp-btn lp-btn-primary">Explore Issues</Link>
            </div>
          </div>

          <div className="lp-hero-right" aria-hidden>
            <div className="lp-hero-visual">
              <img src={HeroImg} alt="" />
            </div>
          </div>
        </section>

        <section id="why" className="lp-why">
          <div className="lp-center">
            <h2 className="section-label">Why Civix?</h2>
            <p className="section-desc">
              Citizens often lack transparent, accessible channels to raise local issues. Civix bridges the gap by enabling digital petitions, public sentiment polling, and real-time response tracking.
            </p>

            <div className="lp-why-cards">
              <article className="card lp-card-hover">
                <div className="card-icon">👁️</div>
                <h3>Lack of Transparency</h3>
                <p>Citizens struggle to access clear information about local government decisions and spending.</p>
              </article>

              <article className="card lp-card-hover">
                <div className="card-icon">🧑‍🤝‍🧑</div>
                <h3>Low Civic Participation</h3>
                <p>Bureaucratic processes and limited outreach discourage community involvement in governance.</p>
              </article>

              <article className="card lp-card-hover">
                <div className="card-icon">⏳</div>
                <h3>Slow Government Response</h3>
                <p>Issues raised by citizens often take months to receive an official response or action.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="how" className="lp-how">
          <div className="lp-center">
            <h2 className="section-label">How It Works</h2>
            <p className="section-desc">Four simple steps to make your voice heard and drive real change in your community.</p>

            <div className="lp-steps">
              <div className="step lp-card-hover">
                <div className="step-num">01</div>
                <h4>Raise a Petition</h4>
                <p>Create a petition about any local issue — safety, roads, environmental concerns or community needs.</p>
              </div>

              <div className="step lp-card-hover">
                <div className="step-num">02</div>
                <h4>Gather Community Support</h4>
                <p>Share your petition with neighbors and gather signatures. Geo-targeting ensures relevant stakeholders see it.</p>
              </div>

              <div className="step lp-card-hover">
                <div className="step-num">03</div>
                <h4>Vote & Poll Sentiment</h4>
                <p>Participate in community polls to express opinions on local matters and influence priorities.</p>
              </div>

              <div className="step lp-card-hover">
                <div className="step-num">04</div>
                <h4>Track Official Responses</h4>
                <p>Monitor real-time updates from officials and get notified when action is taken on your petition.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="lp-features">
          <div className="lp-center">
            <h2 className="section-label">Powerful Features</h2>
            <p className="section-desc">Everything you need to participate in local democracy and make your community heard.</p>

            <div className="lp-feature-grid">
              <div className="feature card lp-card-hover">
                <div className="feature-icon">📍</div>
                <h4>Geo-targeted Issues</h4>
                <p>Automatically connect with issues in your neighborhood, ward, or city.</p>
              </div>

              <div className="feature card lp-card-hover">
                <div className="feature-icon">📊</div>
                <h4>Real-time Analytics</h4>
                <p>Track public sentiment with live polling data and visualization dashboards.</p>
              </div>

              <div className="feature card lp-card-hover">
                <div className="feature-icon">✅</div>
                <h4>Verified Accounts</h4>
                <p>Secure citizen verification helps ensure authentic participation.</p>
              </div>

              <div className="feature card lp-card-hover">
                <div className="feature-icon">🗂️</div>
                <h4>Community Dashboards</h4>
                <p>Visualize local progress and engagement metrics for your community.</p>
              </div>

              <div className="feature card lp-card-hover">
                <div className="feature-icon">🔔</div>
                <h4>Smart Notifications</h4>
                <p>Get alerts when officials respond, votes are needed, or issues affect your area.</p>
              </div>

              <div className="feature card lp-card-hover">
                <div className="feature-icon">🌐</div>
                <h4>Multi-language Support</h4>
                <p>Engage in your preferred language with automatic translation for wider reach.</p>
              </div>
            </div>
          </div>
          <footer className="lp-footer">
            <p>© {new Date().getFullYear()} Civix — Empowering Communities.</p>
          </footer>

        </section>
      </main>
    </div>
  );
}
