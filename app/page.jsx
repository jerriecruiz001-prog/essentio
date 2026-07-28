"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import ClientInteractions from "./ClientInteractions";
import tiktok from "../lib/tiktok";

const whatsapp =
  "https://wa.me/2348000000000?text=Hello%2C%20I%27m%20interested%20in%20Essentio%20products.%20Please%20send%20details.";

function parsePrice(value) {
  return Number(String(value).replace(/[^\d.]/g, "")) || 0;
}

const products = [
  {
    id: "smart-wallet",
    eyebrow: "Smart Wallet",
    title: "Power, cards, and security in one everyday carry.",
    price: "₦59,999",
    oldPrice: "₦89,999",
    discount: "33%",
    image: "/images/smart-wallet-black-front.webp",
    alt: "Black premium leather bifold smart wallet with card slots",
    description:
      "A premium leather bifold wallet with built-in 8000mAh power, RFID protection, and MagSafe-compatible charging.",
    features: ["8000mAh power bank", "RFID-blocking lining", "MagSafe wireless charging"],
    variants: [
      {
        name: "Black",
        colorHex: "#1c1a18",
        images: [
          {
            src: "/images/smart-wallet-black-front.webp",
            alt: "Essentio Smart Wallet in black leather, front view",
            label: "Front",
          },
          {
            src: "/images/smart-wallet-black-inside.webp",
            alt: "Essentio Smart Wallet in black leather, interior view with power bank",
            label: "Inside",
          },
        ],
      },
      {
        name: "Brown",
        colorHex: "#7a4a30",
        images: [
          {
            src: "/images/smart-wallet-brown-front.webp",
            alt: "Essentio Smart Wallet in brown leather, front view",
            label: "Front",
          },
          {
            src: "/images/smart-wallet-brown-inside.webp",
            alt: "Essentio Smart Wallet in brown leather, interior view with power bank",
            label: "Inside",
          },
        ],
      },
    ],
  },
  {
    id: "passport-holder",
    eyebrow: "Passport Holder",
    title: "A calmer way to move through airports.",
    price: "₦54,999",
    oldPrice: "₦84,999",
    discount: "35%",
    image: "/images/passport-holder-black.webp",
    alt: "Black premium leather smart passport holder",
    description:
      "A structured leather passport holder for passports, cards, boarding documents, and backup power while you move between cities.",
    features: ["Passport-ready layout", "USB-C charging", "Works with Apple Find My"],
    variants: [
      {
        name: "Black",
        colorHex: "#1c1a18",
        images: [
          {
            src: "/images/passport-holder-black.webp",
            alt: "Essentio Passport Holder in black leather",
            label: "Front",
          },
        ],
      },
      {
        name: "Brown",
        colorHex: "#d1652f",
        images: [
          {
            src: "/images/passport-holder-brown.webp",
            alt: "Essentio Passport Holder in burnt orange leather",
            label: "Front",
          },
        ],
      },
    ],
  },
];

const comparisons = [
  {
    eyebrow: "Wallet",
    regularTitle: "A regular wallet",
    regularPoints: [
      "Just holds cards and cash",
      "No backup power if your phone dies",
      "No protection against card skimming",
      "One more separate item to carry and charge",
    ],
    essentioTitle: "Essentio Smart Wallet",
    essentioPoints: [
      "8000mAh power bank built into the leather",
      "RFID-blocking lining protects your cards",
      "MagSafe-compatible wireless charging",
      "One premium item replaces three",
    ],
  },
  {
    eyebrow: "Passport holder",
    regularTitle: "A regular passport holder",
    regularPoints: [
      "Only stores your documents",
      "No power when you need it most at the gate",
      "Bulky once you add a separate charger",
    ],
    essentioTitle: "Essentio Passport Holder",
    essentioPoints: [
      "Passport, cards, and boarding pass in one layout",
      "USB-C charging built in for travel days",
      "Works with Apple Find My, so it's never lost",
    ],
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

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function FindMyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21" />
    </svg>
  );
}

function featureIcon(feature) {
  return feature.includes("Find My") ? <FindMyIcon /> : <CheckIcon />;
}

export default function Home() {
  const [activeProductId, setActiveProductId] = useState(products[0].id);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [variantIndex, setVariantIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const activeProduct = useMemo(
    () => products.find((product) => product.id === activeProductId) ?? products[0],
    [activeProductId]
  );
  const activeVariant = previewProduct?.variants[variantIndex] ?? previewProduct?.variants[0];
  const activeImage = activeVariant?.images[imageIndex] ?? activeVariant?.images[0];

  function openProductPreview(product) {
    tiktok.viewContent({
      content_id: product.id,
      product_name: product.title,
      category: product.eyebrow,
      price: parsePrice(product.price),
      currency: "NGN",
    });
    setPreviewProduct(product);
  }

  function trackWhatsAppOrder(product) {
    if (!product) {
      tiktok.contact();
      return;
    }
    const price = parsePrice(product.price);
    tiktok.initiateCheckout({
      total_price: price,
      currency: "NGN",
      number_of_items: 1,
      contents: [
        {
          content_id: product.id,
          content_name: product.title,
          content_category: product.eyebrow,
          quantity: 1,
          price,
        },
      ],
    });
  }

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

  useEffect(() => {
    setVariantIndex(0);
    setImageIndex(0);
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
            <a
              href={whatsapp}
              className="btn btn--sm nav__cta"
              target="_blank"
              rel="noopener"
              onClick={() => trackWhatsAppOrder(null)}
            >
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
          <a
            href={whatsapp}
            className="btn"
            target="_blank"
            rel="noopener"
            onClick={() => trackWhatsAppOrder(null)}
          >
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
                <button className="btn" type="button" onClick={() => openProductPreview(activeProduct)}>
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
                    <div className="hero__switcher-head">
                      <span>{product.eyebrow}</span>
                      <span className="discount-badge discount-badge--sm">-{product.discount}</span>
                    </div>
                    <div className="hero__switcher-prices">
                      <strong>{product.price}</strong>
                      <em className="price-old price-old--sm">{product.oldPrice}</em>
                    </div>
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
                  onClick={() => openProductPreview(product)}
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
                <div className="hero__caption-top">
                  <span>{activeProduct.eyebrow}</span>
                  <span className="discount-badge discount-badge--sm">-{activeProduct.discount}</span>
                </div>
                <div className="hero__caption-prices">
                  <strong>{activeProduct.price}</strong>
                  <em className="price-old price-old--sm">{activeProduct.oldPrice}</em>
                </div>
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
                    onClick={() => openProductPreview(product)}
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
                        {featureIcon(feature)}
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="product-card__footer">
                    <div className="product-card__prices">
                      <div className="price-row">
                        <span className="price">{product.price}</span>
                        <span className="discount-badge discount-badge--sm">-{product.discount}</span>
                      </div>
                      <span className="price-old">{product.oldPrice}</span>
                    </div>
                    <button className="btn btn--sm" type="button" onClick={() => openProductPreview(product)}>
                      View & buy
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="why-essentio">
          <div className="container">
            <div className="section__header reveal">
              <p className="eyebrow">Why Essentio</p>
              <h2>Not just another wallet. Not just another passport holder.</h2>
            </div>

            <div className="compare-stack">
              {comparisons.map((item) => (
                <div className="compare-grid reveal" key={item.eyebrow}>
                  <div className="compare-card">
                    <p className="eyebrow">{item.regularTitle}</p>
                    <ul>
                      {item.regularPoints.map((point) => (
                        <li key={point}>
                          <CrossIcon />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="compare-card compare-card--essentio">
                    <p className="eyebrow">{item.essentioTitle}</p>
                    <ul>
                      {item.essentioPoints.map((point) => (
                        <li key={point}>
                          <CheckIcon />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
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
                <p>The Passport Holder works with Apple Find My, so you always know where it is.</p>
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
            <a
              href={whatsapp}
              className="btn"
              target="_blank"
              rel="noopener"
              onClick={() => trackWhatsAppOrder(null)}
            >
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
              <Image
                key={activeImage.src}
                src={activeImage.src}
                alt={activeImage.alt}
                fill
                sizes="(max-width: 900px) 100vw, 48vw"
              />
              <div className="buy-modal__gallery">
                {previewProduct.variants.length > 1 ? (
                  <div className="buy-modal__swatches" aria-label="Choose color">
                    {previewProduct.variants.map((variant, index) => (
                      <button
                        key={variant.name}
                        type="button"
                        className={index === variantIndex ? "active" : ""}
                        style={{ "--swatch": variant.colorHex }}
                        aria-label={variant.name}
                        aria-pressed={index === variantIndex}
                        onClick={() => {
                          setVariantIndex(index);
                          setImageIndex(0);
                        }}
                      />
                    ))}
                  </div>
                ) : null}
                {activeVariant.images.length > 1 ? (
                  <div className="buy-modal__thumbs" aria-label="Choose view">
                    {activeVariant.images.map((image, index) => (
                      <button
                        key={image.label}
                        type="button"
                        className={index === imageIndex ? "active" : ""}
                        onClick={() => setImageIndex(index)}
                      >
                        {image.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="buy-modal__content">
              <p className="eyebrow">{previewProduct.eyebrow}</p>
              <h2 id="buy-modal-title">{previewProduct.title}</h2>
              <p>{previewProduct.description}</p>
              <ul>
                {previewProduct.features.map((feature) => (
                  <li key={feature}>
                    {featureIcon(feature)}
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="buy-modal__footer">
                <div className="buy-modal__prices">
                  <div className="price-row">
                    <span className="price price--lg">{previewProduct.price}</span>
                    <span className="discount-badge discount-badge--lg">-{previewProduct.discount}</span>
                  </div>
                  <span className="price-old price-old--lg">{previewProduct.oldPrice}</span>
                </div>
                <a
                  href={whatsapp}
                  className="btn"
                  target="_blank"
                  rel="noopener"
                  onClick={() => trackWhatsAppOrder(previewProduct)}
                >
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
