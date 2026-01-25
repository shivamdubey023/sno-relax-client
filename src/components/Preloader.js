// src/components/Preloader.js
import React, { useEffect, useState } from "react";

/**
 * Preloader Component
 * -------------------
 * Purpose:
 * - Displays a temporary full-screen loading UI
 * - Delays rendering of the main application (`children`)
 *
 * Current Implementation:
 * - Uses a fixed 2-second timeout
 * - Renders an iframe (og-image.html) as a splash / branding screen
 *
 * Future Enhancements (optional):
 * - Replace timeout with real loading checks (API, auth, assets)
 * - Replace iframe with React animation (Lottie / SVG)
 * - Make duration configurable via props
 */
export default function Preloader({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated loading delay (2 seconds)
    // This can later be replaced with actual initialization logic
    const timer = setTimeout(() => setLoading(false), 2000);

    // Cleanup to prevent memory leaks if component unmounts early
    return () => clearTimeout(timer);
  }, []);

  // While loading, show splash screen
  if (loading) {
    return (
      <iframe
        src="/og-image.html"
        title="Application loading screen"
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
        }}
      />
    );
  }

  // After loading, render the actual app
  return <>{children}</>;
}
