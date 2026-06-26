import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React StrictMode mounts effects twice in development.
  // For a WebGL app this leaks GPU contexts on every HMR reload and hits
  // Chrome's per-page limit (~16), triggering "THREE.WebGLRenderer: Context Lost".
  reactStrictMode: false,
};

export default nextConfig;
