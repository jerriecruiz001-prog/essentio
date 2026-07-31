"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import ClientInteractions from "./ClientInteractions";
import tiktok from "../lib/tiktok";

const whatsapp =
  "https://wa.me/2347026064464?text=Hello%2C%20I%27m%20interested%20in%20Essentio%20products.%20Please%20send%20details.";
const ORDER_REDIRECT_DELAY_MS = 700;

function buildWhatsAppUrl(product) {
  if (!product) return whatsapp;

  const message = `Hello, I'm interested in the Essentio ${product.eyebrow} (${product.price}). Please send details.`;
  return `https://wa.me/2347026064464?text=${encodeURIComponent(message)}`;
}

function parsePrice(value) {
  return Number(String(value).replace(/[^\d.]/g, "")) || 0;
}

function buildTikTokItem(product) {
  const price = parsePrice(product.price);
  return {
    price,
    item: {
      content_id: product.id,
      content_name: product.title,
      content_category: product.eyebrow,
      content_type: "product",
      quantity: 1,
      price,
    },
  };
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

function buildCollectionCheckout() {
  const items = products.map((product) => buildTikTokItem(product).item);
  const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
  return {
    price: total,
    items,
    number_of_items: items.length,
  };
}

const benefits = [
  "Same-day delivery in Lagos, Abuja & PH",
  "Nationwide delivery in 1-3 business days",
  "Worldwide shipping available",
];

const trustSignals = [
  { icon: "delivery", label: "Nationwide Delivery" },
  { icon: "bolt", label: "Same-Day Delivery Available in Abuja & Lagos" },
  { icon: "payment", label: "Pay on Delivery Available in Abuja & Lagos" },
  { icon: "lock", label: "Secure WhatsApp Ordering" },
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

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.1 4.9A9.9 9.9 0 0 0 3.6 16.8L2.5 21.5l4.8-1.1A9.9 9.9 0 0 0 21.5 12a9.8 9.8 0 0 0-2.4-7.1Z" />
      <path d="M8.6 7.8c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.2 3.2c.2.2 2.1 3.4 5.3 4.6 2.6 1 3.2.8 3.7.8.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.7-.4l-2.1-1c-.3-.1-.6-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.8.1-.3-.2-1.4-.5-2.7-1.7-1-1-1.7-2.1-1.9-2.4-.2-.4 0-.6.2-.8.1-.1.3-.4.5-.6.1-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4Z" />
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

function TrustIcon({ type }) {
  if (type === "bolt") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
      </svg>
    );
  }

  if (type === "payment") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18M7 15h4" />
      </svg>
    );
  }

  if (type === "lock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function TrustSection() {
  return (
    <div className="trust-section" aria-label="Ordering and delivery assurances">
      {trustSignals.map((signal) => (
        <div className="trust-section__item" key={signal.label}>
          <TrustIcon type={signal.icon} />
          <span>{signal.label}</span>
        </div>
      ))}
    </div>
  );
}

function WhatsAppOrderLink({
  product,
  onOrder,
  className = "btn btn--whatsapp",
  children = "Buy on WhatsApp",
}) {
  return (
    <a
      href={buildWhatsAppUrl(product)}
      className={className}
      target="_blank"
      rel="noopener"
      onClick={(event) => onOrder(event, product)}
    >
      <WhatsAppIcon />
      {children}
    </a>
  );
}

function featureIcon(feature) {
  return feature.includes("Find My") ? <FindMyIcon /> : <CheckIcon />;
}

function PassportDemoVideo() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const exitAnyFullscreen = () => {
      if (document.fullscreenElement === video) {
        document.exitFullscreen?.().catch(() => {});
      }
      if (video.webkitDisplayingFullscreen) {
        video.webkitExitFullscreen?.();
      }
    };

    const blockFullscreen = (event) => {
      event.preventDefault?.();
      exitAnyFullscreen();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.45 }
    );

    video.addEventListener("webkitbeginfullscreen", blockFullscreen);
    video.addEventListener("fullscreenchange", exitAnyFullscreen);
    document.addEventListener("fullscreenchange", exitAnyFullscreen);
    observer.observe(video);

    return () => {
      observer.disconnect();
      video.removeEventListener("webkitbeginfullscreen", blockFullscreen);
      video.removeEventListener("fullscreenchange", exitAnyFullscreen);
      document.removeEventListener("fullscreenchange", exitAnyFullscreen);
    };
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted && video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }

  return (
    <div className="passport-demo">
      <div className="passport-demo__frame">
        <video
          ref={videoRef}
          className="passport-demo__video"
          src="/images/essentiopassport_demo.mp4"
          poster="/images/passport-holder-black.webp"
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nofullscreen nodownload noremoteplayback noplaybackrate"
          onContextMenu={(event) => event.preventDefault()}
          aria-label="Essentio Passport Holder product demo"
        />
        <div className="passport-demo__controls">
          <button
            className="passport-demo__toggle"
            type="button"
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pause passport demo" : "Play passport demo"}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            className="passport-demo__toggle"
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute passport demo" : "Mute passport demo"}
          >
            {isMuted ? "Sound on" : "Mute"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeProductId, setActiveProductId] = useState(products[0].id);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [variantIndex, setVariantIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const trackedViewContentRef = useRef(new Set());
  const hasTrackedInitialViewRef = useRef(false);
  const redirectTimerRef = useRef(null);
  const activeProduct = useMemo(
    () => products.find((product) => product.id === activeProductId) ?? products[0],
    [activeProductId]
  );
  const activeVariant = previewProduct?.variants[variantIndex] ?? previewProduct?.variants[0];
  const activeImage = activeVariant?.images[imageIndex] ?? activeVariant?.images[0];

  function trackViewContent(product) {
    if (!product || trackedViewContentRef.current.has(product.id)) return;

    const { price, item } = buildTikTokItem(product);
    tiktok.viewContent({
      content_id: product.id,
      product_name: product.title,
      category: product.eyebrow,
      price,
      currency: "NGN",
      contents: [item],
    });
    trackedViewContentRef.current.add(product.id);
  }

  function openProductPreview(product) {
    trackViewContent(product);
    setPreviewProduct(product);
  }

  function trackOrderButtonClick(product) {
    const selectedProduct = product ?? null;
    const checkout = selectedProduct
      ? (() => {
          const { price, item } = buildTikTokItem(selectedProduct);
          return {
            price,
            items: [item],
            number_of_items: 1,
            content_name: selectedProduct.title,
            content_category: selectedProduct.eyebrow,
          };
        })()
      : {
          ...buildCollectionCheckout(),
          content_name: "Essentio Smart Wallet and Passport Holder",
          content_category: "Essentio product collection",
        };

    if (selectedProduct) {
      trackViewContent(selectedProduct);
    }

    tiktok.initiateCheckout({
      total_price: checkout.price,
      currency: "NGN",
      number_of_items: checkout.number_of_items,
      contents: checkout.items,
      content_name: checkout.content_name,
      content_category: checkout.content_category,
    });
  }

  function handleWhatsAppOrderClick(event, product) {
    event.preventDefault();
    const orderUrl = buildWhatsAppUrl(product);

    const popup = window.open("", "_blank");
    if (popup) {
      popup.opener = null;
    }

    trackOrderButtonClick(product);

    if (redirectTimerRef.current) {
      window.clearTimeout(redirectTimerRef.current);
    }

    redirectTimerRef.current = window.setTimeout(() => {
      if (popup && !popup.closed) {
        popup.location.replace(orderUrl);
        return;
      }

      const fallbackWindow = window.open(orderUrl, "_blank", "noopener,noreferrer");
      if (!fallbackWindow) {
        window.location.assign(orderUrl);
      }
    }, ORDER_REDIRECT_DELAY_MS);
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
    if (hasTrackedInitialViewRef.current) return;
    hasTrackedInitialViewRef.current = true;
    trackViewContent(activeProduct);
  }, [activeProduct]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

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
              onClick={(event) => handleWhatsAppOrderClick(event, null)}
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
            onClick={(event) => handleWhatsAppOrderClick(event, null)}
          >
            Order via WhatsApp
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero__grid">
            <div className="hero__copy reveal">
              <p className="eyebrow">Premium everyday & travel essentials</p>
              <h1>Carry less. Stay powered. Look composed.</h1>
              <p>
                Essentio combines premium leather, backup power, RFID protection, and everyday
                organization for professionals who want essentials that feel considered — at home
                or on the move.
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
                    </div>
                    <WhatsAppOrderLink
                      product={product}
                      onOrder={handleWhatsAppOrderClick}
                      className="btn btn--whatsapp btn--sm"
                    />
                  </div>
                  <TrustSection />
                </article>
              ))}
            </div>

            <aside className="wallet-cross-sell reveal" aria-labelledby="wallet-cross-sell-title">
              <div className="wallet-cross-sell__media">
                <video
                  src="/images/essentiopassport_demo.mp4"
                  poster="/images/passport-holder-black.webp"
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Essentio Passport Holder product preview"
                />
              </div>
              <div className="wallet-cross-sell__copy">
                <h3 id="wallet-cross-sell-title">Traveling Soon?</h3>
                <p>
                  Complete your setup with the Essentio Passport Holder featuring RFID protection
                  and Apple Find My compatibility.
                </p>
              </div>
              <a href="#passport-holder" className="btn btn--secondary btn--sm">
                View Passport Holder
              </a>
            </aside>
          </div>
        </section>

        <section className="section section--quiet" id="passport-demo">
          <div className="container">
            <div className="section__header reveal">
              <p className="eyebrow">Passport Holder</p>
              <h2>See how Essentio Passport works.</h2>
              <p>
                A quick look at the layout, charging, and carry flow — so you can see how it works
                before you order.
              </p>
            </div>
            <div className="reveal">
              <PassportDemoVideo />
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
              onClick={(event) => handleWhatsAppOrderClick(event, null)}
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
                </div>
                <WhatsAppOrderLink product={previewProduct} onOrder={handleWhatsAppOrderClick} />
              </div>
              <TrustSection />
            </div>
            <WhatsAppOrderLink
              product={previewProduct}
              onOrder={handleWhatsAppOrderClick}
              className="btn btn--whatsapp buy-modal__sticky-cta"
            />
          </div>
        </div>
      ) : null}

      <ClientInteractions />
    </>
  );
}
