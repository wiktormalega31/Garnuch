export function readPremiumCookie() {
  // szukamy premiumstatus=…
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith("premiumstatus="))
    ?.split("=")[1]; // "true:hash" / "false:hash"

  if (!raw) return undefined; // brak cookie

  // Django: "<wartość>:<podpis>"
  const value = raw.split(":")[0]; // pierwsza część przed „:”
  return value === "true";
}
