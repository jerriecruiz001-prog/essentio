export const WHATSAPP_PHONE = "2347026064464";

export const SAME_DAY_STATES = ["Lagos", "FCT (Abuja)"];

export const NIGERIA_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT (Abuja)",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const CITY_SUGGESTIONS = {
  Lagos: ["Lagos Island", "Lagos Mainland", "Lekki", "Ikeja", "Victoria Island", "Surulere"],
  "FCT (Abuja)": ["Wuse", "Garki", "Maitama", "Gwarinpa", "Asokoro", "Life Camp"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Bonny Island"],
  Kano: ["Kano Municipal", "Fagge", "Nassarawa"],
  Enugu: ["Enugu", "Nsukka", "Ogui"],
};

export function citySuggestionsFor(state) {
  return CITY_SUGGESTIONS[state] ?? [];
}

export function isSameDayState(state) {
  return SAME_DAY_STATES.includes(state);
}

export function isPodAvailable(state) {
  return isSameDayState(state);
}

export function getDeliveryOption(state) {
  if (isSameDayState(state)) {
    return {
      method: "Same-Day Delivery",
      icon: "bolt",
      estimate: "Today, if ordered before 6:00 PM",
      whatsappLabel: "Same-Day Delivery",
    };
  }

  return {
    method: "Nationwide Delivery",
    icon: "delivery",
    estimate: "2-4 Business Days",
    note: "Estimated delivery time depends on your location.",
    whatsappLabel: "Nationwide Delivery (Estimated 2-4 Business Days)",
  };
}
