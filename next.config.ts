import path from 'path';



/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Prevent incorrect workspace-root inference when multiple lockfiles exist.
    root: path.join(__dirname),
  },
};


export default nextConfig;

