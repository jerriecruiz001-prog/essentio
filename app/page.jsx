"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import ClientInteractions from "./ClientInteractions";

const whatsapp =
  "https://wa.me/2348000000000?text=Hello%2C%20I%27m%20interested%20in%20Essentio%20products.%20Please%20send%20details.";

const products = [
  {
    id: "smart-wallet",
    eyebrow: "Smart Wallet",
    title: "Power, cards, and security in one everyday carry.",
    price: "₦70,000",
    image: "/images/smart-wallet.png",
    alt: "Black premium leather smart wallet with card slots",
    description:
      "A premium leather wallet with built-in 8000mAh power, RFID protection, MagSafe-compatible charging, NFC sharing, and tracker-ready storage.",
    features: ["8000mAh power bank", "RFID-blocking lining", "NFC card included"],
  },
  {
    id: "transit-case",
    eyebrow: "Transit Case",
    title: "A calmer way to move through airports.",
    price: "₦65,000",
    image: "/images/transit-case.png",
    alt: "Black premium leather smart passport holder and travel case",
    description:
      "A structured leather travel case for passports, cards, boarding documents, and backup power while you move between cities.",
    features: ["Passport-ready layout", "USB-C charging", "Tracker compatible"],
  },
];

const benefits = [
  "Same-day delivery in Lagos, Abuja & PH",
  "Nationwide delivery in 1-3 business days",
  "Worldwide shipping available",
];

const faqs = [
  {
    question: "How long does the battery take to charge?",
    answer:
      "A full charge takes about 2-3 hours via USB-C and can provide 1-2 phone top-ups depending on your device.",
  },
  {
    question: "Will the wallet feel bulky?",
    answer:
      "No. The Smart Wallet is designed to stay slim while carrying the power bank and card protection inside the leather body.",
  },
  {
    question: "How do I order?",
    answer:
      "Tap any order button and we will confirm product availability, delivery location, payment details, and tracking through WhatsApp.",
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export default function Home() {
  const [activeProductId, setActiveProductId] = useState(products[0].id);
  const [previewProduct, setPreviewProduct] = useState(null);
  const activeProduct = useMemo(
    () => products.find((product) => product.id === activeProductId) ?? products[0],
    [activeProductId]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveProductId((currentId) => {
        const currentIndex = products.findIndex((product) => product.id === currentId);
        return products[(currentIndex + 1) % products.length].id;
      });
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = previewProduct ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [previewProduct]);

  return (
    <>
      <header className="nav" id="nav">
        <div className="container nav__inner">
          <a href="#" className="brand" aria-label="Essentio home">
            Essentio<span>™</span>
          </a>

          <nav className="nav__menu" aria-label="Main navigation">
            <a href="#products">Products</a>
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="nav__actions">
            <button className="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
              <svg className="theme-toggle__sun" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
              <svg className="theme-toggle__moon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8Z" />
              </svg>
            </button>
            <a href={whatsapp} className="btn btn--sm nav__cta" target="_blank" rel="noopener">
              Order
            </a>
            <button className="nav__toggle" id="navToggle" aria-label="Open menu" aria-expanded="false">
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        <div className="nav__mobile-menu">
          <a href="#products" data-nav-close>
            Products
          </a>
          <a href="#features" data-nav-close>
            Features
          </a>
          <a href="#faq" data-nav-close>
            FAQ
          </a>
          <a href={whatsapp} className="btn" target="_blank" rel="noopener">
            Order via WhatsApp
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero__grid">
            <div className="hero__copy reveal">
              <p className="eyebrow">Premium smart travel essentials</p>
              <h1>Carry less. Stay powered. Look composed.</h1>
              <p>
                Essentio combines premium leather, backup power, RFID protection, and travel-ready
                organization for professionals who want essentials that feel considered.
              </p>
              <div className="hero__actions">
                <button className="btn" type="button" onClick={() => setPreviewProduct(activeProduct)}>
                  View {activeProduct.eyebrow}
                  <ArrowIcon />
                </button>
                <a href="#products" className="btn btn--secondary">
                  View products
                </a>
              </div>
              <div className="hero__switcher" aria-label="Hero product selector">
                {products.map((product) => (
                  <button
                    className={product.id === activeProduct.id ? "active" : ""}
                    key={product.id}
                    type="button"
                    onClick={() => setActiveProductId(product.id)}
                  >
                    <span>{product.eyebrow}</span>
                    <strong>{product.price}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="hero__media reveal">
              {products.map((product) => (
                <button
                  aria-label={`Preview ${product.eyebrow}`}
                  className={`hero__slide ${product.id === activeProduct.id ? "active" : ""}`}
                  key={product.id}
                  type="button"
                  onClick={() => setPreviewProduct(product)}
                >
                  <Image
                    src={product.image}
                    alt={product.alt}
                    fill
                    priority={product.id === products[0].id}
                    sizes="(max-width: 900px) 100vw, 52vw"
                  />
                </button>
              ))}
              <div className="hero__caption">
                <span>{activeProduct.eyebrow}</span>
                <strong>{activeProduct.price}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="proof">
          <div className="container proof__grid">
            <div>
              <strong>8000mAh</strong>
              <span>Integrated power</span>
            </div>
            <div>
              <strong>RFID</strong>
              <span>Card protection</span>
            </div>
            <div>
              <strong>USB-C</strong>
              <span>Modern charging</span>
            </div>
            <div>
              <strong>12 mo.</strong>
              <span>Warranty support</span>
            </div>
          </div>
        </section>

        <section className="section" id="products">
          <div className="container">
            <div className="section__header reveal">
              <p className="eyebrow">The collection</p>
              <h2>Two essentials. One cleaner carry system.</h2>
            </div>

            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card reveal" id={product.id} key={product.id}>
                  <button
                    className="product-card__image"
                    type="button"
                    onClick={() => setPreviewProduct(product)}
                    aria-label={`Preview ${product.eyebrow}`}
                  >
                    <Image src={product.image} alt={product.alt} fill sizes="(max-width: 900px) 100vw, 50vw" />
                  </button>
                  <div>
                    <p className="eyebrow">{product.eyebrow}</p>
                    <h3>{product.title}</h3>
                    <p>{product.description}</p>
                  </div>
                  <ul>
                    {product.features.map((feature) => (
                      <li key={feature}>
                        <CheckIcon />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="product-card__footer">
                    <span>{product.price}</span>
                    <button className="btn btn--sm" type="button" onClick={() => setPreviewProduct(product)}>
                      View & buy
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--quiet" id="features">
          <div className="container split">
            <div className="reveal">
              <p className="eyebrow">Built for real use</p>
              <h2>Less decoration. More daily value.</h2>
              <p>
                The redesign keeps the message direct: premium materials, useful technology, and
                reliable delivery. No crowded feature maze, no endless repeated cards.
              </p>
            </div>
            <div className="feature-list reveal">
              <div>
                <span>01</span>
                <h3>Power where you need it</h3>
                <p>Charge your phone without carrying a separate battery pack.</p>
              </div>
              <div>
                <span>02</span>
                <h3>Protection built in</h3>
                <p>RFID blocking helps keep cards and passport data shielded.</p>
              </div>
              <div>
                <span>03</span>
                <h3>Designed to stay found</h3>
                <p>Tracker-ready storage helps you keep tabs on your essentials.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container delivery-panel reveal">
            <div>
              <p className="eyebrow">Delivery</p>
              <h2>Order confirmed and tracked on WhatsApp.</h2>
            </div>
            <ul>
              {benefits.map((benefit) => (
                <li key={benefit}>
                  <CheckIcon />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section--tight" id="faq">
          <div className="container faq">
            <div className="section__header reveal">
              <p className="eyebrow">FAQ</p>
              <h2>Quick answers before you order.</h2>
            </div>
            <div className="faq__list">
              {faqs.map((item) => (
                <div className="faq__item reveal" key={item.question}>
                  <button className="faq__question" aria-expanded="false">
                    {item.question}
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  <div className="faq__answer">
                    <div className="faq__answer-inner">{item.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="container cta__inner reveal">
            <p className="eyebrow">Essentio by JCRUIZ & CO</p>
            <h2>Upgrade the essentials you carry every day.</h2>
            <a href={whatsapp} className="btn" target="_blank" rel="noopener">
              Start order
              <ArrowIcon />
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <a href="#" className="brand">
            Essentio<span>™</span>
          </a>
          <p>© 2026 JCRUIZ & CO. All rights reserved.</p>
        </div>
      </footer>

      {previewProduct ? (
        <div className="buy-modal" role="dialog" aria-modal="true" aria-labelledby="buy-modal-title">
          <button
            className="buy-modal__backdrop"
            type="button"
            aria-label="Close product preview"
            onClick={() => setPreviewProduct(null)}
          />
          <div className="buy-modal__panel">
            <button className="buy-modal__close" type="button" onClick={() => setPreviewProduct(null)}>
              Close
            </button>
            <div className="buy-modal__image">
              <Image src={previewProduct.image} alt={previewProduct.alt} fill sizes="(max-width: 900px) 100vw, 48vw" />
            </div>
            <div className="buy-modal__content">
              <p className="eyebrow">{previewProduct.eyebrow}</p>
              <h2 id="buy-modal-title">{previewProduct.title}</h2>
              <p>{previewProduct.description}</p>
              <ul>
                {previewProduct.features.map((feature) => (
                  <li key={feature}>
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="buy-modal__footer">
                <span>{previewProduct.price}</span>
                <a href={whatsapp} className="btn" target="_blank" rel="noopener">
                  Buy on WhatsApp
                  <ArrowIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ClientInteractions />
    </>
  );
}
