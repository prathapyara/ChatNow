/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env:{
    NEXT_PUBLIC_ZEGO_APP_ID:77911981,
    NEXT_PUBLIC_ZEGO_SERVER_ID:"04e5dff527646299d4b199814241d811"
  },
  images:{
    domains:["localhost"],
  }
};

module.exports = nextConfig;
