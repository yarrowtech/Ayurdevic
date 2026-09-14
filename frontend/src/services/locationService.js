// Photon API: https://github.com/komoot/photon/blob/master/docs/api-v1.md
export async function getCurrentAddress(signal) {
  if (!window.isSecureContext) {
    throw new Error("Location access requires HTTPS or localhost. You can enter your address manually.");
  }
  if (!navigator.geolocation) {
    throw new Error("Your browser does not support location access. Please enter your address manually.");
  }

  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, error => {
      const messages = {
        1: "Location permission was denied. Allow location in your browser settings or enter your address manually.",
        2: "Your location is unavailable. Turn on device location services and try again.",
        3: "Finding your location timed out. Please try again or enter your address manually.",
      };
      reject(new Error(messages[error.code] || "Unable to find your location. Please enter your address manually."));
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  });
  signal.throwIfAborted();

  const endpoint = import.meta.env?.VITE_GEOCODING_URL || "https://photon.komoot.io/reverse";
  const url = new URL(endpoint);
  url.search = new URLSearchParams({ lat: position.coords.latitude, lon: position.coords.longitude, lang: "en", limit: "1" });
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 10000);
  try {
    const response = await fetch(url, { signal: controller.signal, credentials: "omit" });
    if (!response.ok) throw new Error("Address lookup is unavailable. Please try again or enter your address manually.");
    const data = await response.json();
    const address = data.features?.[0]?.properties;
    if (!address || ![address.street, address.city, address.district, address.locality, address.state, address.country].some(Boolean)) {
      throw new Error("No address was found for this location. Please enter your address manually.");
    }
    const text = (value, max) => typeof value === "string" ? value.slice(0, max) : "";
    return {
      line1: [address.housenumber, address.street].filter(Boolean).join(" ").slice(0, 200),
      city: text(address.city || address.district || address.locality, 100),
      state: text(address.state, 100),
      postalCode: text(address.postcode, 12),
      country: text(address.country, 60),
    };
  } catch (error) {
    if (error.name === "AbortError" && !signal.aborted) {
      throw new Error("Address lookup timed out. Please try again or enter your address manually.");
    }
    if (error instanceof TypeError) {
      throw new Error("Unable to connect to address lookup. Check your connection or enter your address manually.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}
