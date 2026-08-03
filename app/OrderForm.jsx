"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { NIGERIA_STATES, citySuggestionsFor, getDeliveryOption, isPodAvailable } from "../lib/nigeriaLocations";
import { buildOrderWhatsAppUrl } from "../lib/orderMessage";

const REDIRECT_DELAY_MS = 700;
const PHONE_PATTERN = /^(\+?234|0)[\s-]?[7-9]\d{9}$/;

function normalizePhone(value) {
  return value.replace(/[\s-]/g, "");
}

function isValidPhone(value) {
  return PHONE_PATTERN.test(normalizePhone(value));
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.1 4.9A9.9 9.9 0 0 0 3.6 16.8L2.5 21.5l4.8-1.1A9.9 9.9 0 0 0 21.5 12a9.8 9.8 0 0 0-2.4-7.1Z" />
      <path d="M8.6 7.8c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.2 3.2c.2.2 2.1 3.4 5.3 4.6 2.6 1 3.2.8 3.7.8.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.7-.4l-2.1-1c-.3-.1-.6-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.8.1-.3-.2-1.4-.5-2.7-1.7-1-1-1.7-2.1-1.9-2.4-.2-.4 0-.6.2-.8.1-.1.3-.4.5-.6.1-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4Z" />
    </svg>
  );
}

function DeliveryIcon({ sameDay }) {
  if (sameDay) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
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

export default function OrderForm({ open, products, initialProduct, onClose, onSubmit }) {
  const [selectedProduct, setSelectedProduct] = useState(initialProduct ?? null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTimerRef = useRef(null);

  const podAvailable = useMemo(() => isPodAvailable(state), [state]);
  const delivery = useMemo(() => (state ? getDeliveryOption(state) : null), [state]);
  const paymentLabel = paymentMethod === "pod" ? "Pay on Delivery" : "Pay Now";
  const canPickProduct = products.length > 1 && !initialProduct;
  const isSummaryReady = Boolean(
    selectedProduct && fullName.trim() && state && city.trim() && paymentMethod
  );

  useEffect(() => {
    if (!open) return;
    setSelectedProduct(initialProduct ?? null);
    setFullName("");
    setPhone("");
    setState("");
    setCity("");
    setPaymentMethod("");
    setErrors({});
    setIsSubmitting(false);
  }, [open, initialProduct]);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (paymentMethod === "pod" && !podAvailable) {
      setPaymentMethod("");
    }
  }, [podAvailable, paymentMethod]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
    };
  }, []);

  if (!open) return null;

  function validate() {
    const next = {};
    if (fullName.trim().length < 2) next.fullName = "Please enter your full name.";
    if (phone.trim() && !isValidPhone(phone.trim())) {
      next.phone = "Enter a valid Nigerian phone number.";
    }
    if (!state) next.state = "Please select your state.";
    if (!city.trim()) next.city = "Please enter your city or area.";
    if (!paymentMethod) {
      next.paymentMethod = "Please choose a payment method.";
    } else if (paymentMethod === "pod" && !podAvailable) {
      next.paymentMethod = "Pay on Delivery is unavailable for this location.";
    }
    return next;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedCity = city.trim();

    const whatsappUrl = buildOrderWhatsAppUrl({
      product: selectedProduct,
      fullName: trimmedName,
      phone: trimmedPhone,
      state,
      city: trimmedCity,
      paymentLabel,
    });

    const popup = window.open("", "_blank");
    if (popup) popup.opener = null;

    onSubmit?.({
      product: selectedProduct,
      formData: {
        fullName: trimmedName,
        phone: trimmedPhone,
        state,
        city: trimmedCity,
        paymentMethod,
        paymentLabel,
      },
      whatsappUrl,
    });

    setIsSubmitting(true);

    redirectTimerRef.current = window.setTimeout(() => {
      if (popup && !popup.closed) {
        popup.location.replace(whatsappUrl);
      } else {
        const fallback = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        if (!fallback) window.location.assign(whatsappUrl);
      }
      setIsSubmitting(false);
      onClose();
    }, REDIRECT_DELAY_MS);
  }

  return (
    <div className="order-modal" role="dialog" aria-modal="true" aria-labelledby="order-modal-title">
      <button
        className="order-modal__backdrop"
        type="button"
        aria-label="Close order form"
        onClick={onClose}
      />
      <div className="order-modal__panel">
        <button className="order-modal__close" type="button" onClick={onClose}>
          Close
        </button>

        {!selectedProduct ? (
          <div className="order-form__picker">
            <p className="eyebrow">Start your order</p>
            <h2 id="order-modal-title">Which product would you like?</h2>
            <div className="order-form__picker-grid">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="order-form__picker-card"
                  aria-label={`Order ${product.eyebrow}`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="order-form__picker-image">
                    <Image src={product.image} alt={product.alt} fill sizes="220px" />
                  </div>
                  <span className="order-form__picker-name">{product.eyebrow}</span>
                  <span className="order-form__picker-price">{product.price}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form className="order-form" onSubmit={handleSubmit} noValidate>
            <div className="order-form__head">
              <p className="eyebrow">Order details</p>
              <h2 id="order-modal-title">Essentio {selectedProduct.eyebrow}</h2>
              {canPickProduct ? (
                <button
                  type="button"
                  className="order-form__change"
                  onClick={() => setSelectedProduct(null)}
                >
                  Change product
                </button>
              ) : null}
            </div>

            <fieldset className="order-form__section">
              <legend>Customer Information</legend>
              <label className="order-form__field">
                <span>
                  Full Name <em>*</em>
                </span>
                <input
                  type="text"
                  value={fullName}
                  autoComplete="name"
                  placeholder="e.g. Jane Doe"
                  aria-invalid={Boolean(errors.fullName)}
                  onChange={(event) => setFullName(event.target.value)}
                />
                {errors.fullName ? (
                  <small role="alert">{errors.fullName}</small>
                ) : null}
              </label>
              <label className="order-form__field">
                <span>
                  Phone Number <em className="order-form__optional">(optional)</em>
                </span>
                <input
                  type="tel"
                  value={phone}
                  autoComplete="tel"
                  placeholder="e.g. 0803 123 4567"
                  aria-invalid={Boolean(errors.phone)}
                  onChange={(event) => setPhone(event.target.value)}
                />
                {errors.phone ? <small role="alert">{errors.phone}</small> : null}
              </label>
            </fieldset>

            <fieldset className="order-form__section">
              <legend>Delivery Location</legend>
              <label className="order-form__field">
                <span>
                  State <em>*</em>
                </span>
                <select
                  value={state}
                  aria-invalid={Boolean(errors.state)}
                  onChange={(event) => setState(event.target.value)}
                >
                  <option value="">Select your state</option>
                  {NIGERIA_STATES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.state ? <small role="alert">{errors.state}</small> : null}
              </label>
              <label className="order-form__field">
                <span>
                  City / Area <em>*</em>
                </span>
                <input
                  type="text"
                  list="order-city-suggestions"
                  value={city}
                  disabled={!state}
                  placeholder={state ? "e.g. Lagos Island" : "Select a state first"}
                  aria-invalid={Boolean(errors.city)}
                  onChange={(event) => setCity(event.target.value)}
                />
                <datalist id="order-city-suggestions">
                  {citySuggestionsFor(state).map((suggestion) => (
                    <option key={suggestion} value={suggestion} />
                  ))}
                </datalist>
                {errors.city ? <small role="alert">{errors.city}</small> : null}
              </label>
            </fieldset>

            {delivery ? (
              <div
                className={`order-form__delivery ${
                  delivery.icon === "bolt" ? "order-form__delivery--same-day" : "order-form__delivery--nationwide"
                }`}
              >
                <DeliveryIcon sameDay={delivery.icon === "bolt"} />
                <div>
                  <strong>{delivery.method}</strong>
                  <span>Estimated delivery: {delivery.estimate}</span>
                  {delivery.note ? <p>{delivery.note}</p> : null}
                </div>
              </div>
            ) : null}

            <fieldset className="order-form__section">
              <legend>Payment Method</legend>
              <div className="order-form__radio-group" role="radiogroup" aria-label="Payment method">
                <label
                  className={`order-form__radio ${!podAvailable ? "order-form__radio--disabled" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="pod"
                    checked={paymentMethod === "pod"}
                    disabled={!state || !podAvailable}
                    onChange={() => setPaymentMethod("pod")}
                  />
                  <span>Pay on Delivery</span>
                </label>
                <label className="order-form__radio">
                  <input
                    type="radio"
                    name="payment"
                    value="payNow"
                    checked={paymentMethod === "payNow"}
                    disabled={!state}
                    onChange={() => setPaymentMethod("payNow")}
                  />
                  <span>Pay Now</span>
                </label>
              </div>
              {state && !podAvailable ? (
                <p className="order-form__hint">
                  Pay on Delivery is currently unavailable for this location.
                </p>
              ) : null}
              {errors.paymentMethod ? <small role="alert">{errors.paymentMethod}</small> : null}
            </fieldset>

            {isSummaryReady ? (
              <div className="order-form__summary">
                <p className="eyebrow">Order Summary</p>
                <dl>
                  <div>
                    <dt>Product</dt>
                    <dd>Essentio {selectedProduct.eyebrow}</dd>
                  </div>
                  <div>
                    <dt>Price</dt>
                    <dd>{selectedProduct.price}</dd>
                  </div>
                  <div>
                    <dt>Delivery</dt>
                    <dd>{delivery.method}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>
                      {city}, {state}
                    </dd>
                  </div>
                  <div>
                    <dt>Payment</dt>
                    <dd>{paymentLabel}</dd>
                  </div>
                </dl>
              </div>
            ) : null}

            <button type="submit" className="btn btn--whatsapp order-form__submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="order-form__spinner" aria-hidden="true" />
                  Opening WhatsApp...
                </>
              ) : (
                <>
                  <WhatsAppIcon />
                  Continue to WhatsApp
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
