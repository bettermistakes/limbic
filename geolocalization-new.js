/**
 * Webflow Geolocation Script (V6 - Target by Class)
 *
 * This script uses the FREE BigDataCloud Reverse Geocode Client API
 * to determine a user's location and set the correct policy links
 * on elements with `.terms-of-use-local` and `.privacy-policy-local` classes.
 */
document.addEventListener("DOMContentLoaded", function () {
  // --- CONFIGURATION ---
  const CONFIG = {
    storageKey: "userLocationCode",
    defaultLocationCode: "uk",
    locations: {
      us: {
        terms: "/terms-us",
        carePrivacy: "/privacy-us",
        accessPrivacy: "/us-policies/access-privacy-policy-us",
      },
      uk: {
        terms: "/terms-uk",
        carePrivacy: "/privacy-uk",
        accessPrivacy: "/uk-policies/privacy-intake",
      },
      ca: {
        terms: "/terms-canada",
        carePrivacy: "/privacy-ca",
        accessPrivacy: "/",
      },
    },
  };
  // --- SCRIPT LOGIC ---
  function updateLinks(locationCode) {
    const urls =
      CONFIG.locations[locationCode] ||
      CONFIG.locations[CONFIG.defaultLocationCode];
    if (!urls) {
      console.error(
        "Configuration error: Default location URLs are not defined.",
      );
      return;
    }
    console.log(`Updating links for location: "${locationCode}"`);
    // Find all "Terms of Use" links and set their href
    document.querySelectorAll(".terms-of-use-local").forEach((link) => {
      link.setAttribute("href", urls.terms);
    });
    // Find all "Privacy Policy" links and set their href
    document.querySelectorAll(".privacy-policy-local").forEach((link) => {
      link.setAttribute("href", urls.carePrivacy);
    });
    // Find all "Access Privacy Policy" links and set their href
    document
      .querySelectorAll(".access-privacy-policy-local")
      .forEach((link) => {
        link.setAttribute("href", urls.accessPrivacy);
      });
  }
  async function fetchAndStoreLocation() {
    console.log("Fetching location from Reverse Geocode Client API...");
    try {
      const response = await fetch(
        "https://api.bigdatacloud.net/data/reverse-geocode-client",
      );

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      const data = await response.json();

      console.log(`Detected country name: ${data.countryName}`);
      const countryCode = data.countryCode.toLowerCase();
      const locationToStore = CONFIG.locations[countryCode]
        ? countryCode
        : CONFIG.defaultLocationCode;
      console.log(
        `API success. Detected Country Code: ${countryCode.toUpperCase()}. Storing location: "${locationToStore}".`,
      );
      localStorage.setItem(CONFIG.storageKey, locationToStore);
      updateLinks(locationToStore);
    } catch (error) {
      console.error("Error fetching location:", error);
      console.log(
        `API failed. Falling back to default location: "${CONFIG.defaultLocationCode}"`,
      );
      updateLinks(CONFIG.defaultLocationCode);
    }
  }
  function initialize() {
    const cachedLocation = localStorage.getItem(CONFIG.storageKey);
    if (cachedLocation) {
      console.log(`Found cached location: "${cachedLocation}".`);
      updateLinks(cachedLocation);
    } else {
      console.log("No cached location found. Fetching from API.");
      fetchAndStoreLocation();
    }
  }
  initialize();
});
