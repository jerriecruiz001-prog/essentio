import { WHATSAPP_PHONE, getDeliveryOption, isSameDayState } from "./nigeriaLocations";

export function buildOrderMessage({ product, fullName, phone, state, city, paymentLabel }) {
  const delivery = getDeliveryOption(state);
  const sameDay = isSameDayState(state);
  const lines = [
    `Hi! I'd like to order the Essentio ${product.eyebrow}.`,
    "",
    `\u{1F464} Name: ${fullName}`,
  ];

  if (phone) {
    lines.push(`\u{1F4DE} Phone: ${phone}`);
  }

  lines.push(`\u{1F4CD} State: ${state}`, `\u{1F4CD} ${sameDay ? "City/Area" : "City"}: ${city}`);
  lines.push(`\u{1F69A} Delivery Method: ${delivery.whatsappLabel}`);
  lines.push(`\u{1F4B3} Payment Method: ${paymentLabel}`);
  lines.push("");
  lines.push(
    sameDay
      ? "Please confirm my delivery fee and estimated arrival time."
      : "Please confirm my delivery fee and payment details."
  );

  return lines.join("\n");
}

export function buildOrderWhatsAppUrl(orderDetails) {
  const message = buildOrderMessage(orderDetails);
  // api.whatsapp.com is used directly (not the wa.me short link) because wa.me's
  // redirect hop mangles 4-byte UTF-8 emoji (e.g. \u{1F464}) into "�".
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
}
