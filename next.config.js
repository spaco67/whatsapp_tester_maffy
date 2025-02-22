const { withTamagui } = require("@tamagui/next-plugin");
const { join } = require("path");

const tamaguiConfig = {
  config: "./tamagui.config.ts",
  components: ["tamagui"],
  importsWhitelist: ["constants.js", "colors.js"],
  logTimings: true,
  disableExtraction: process.env.NODE_ENV === "development",
  excludeReactNativeWebExports: [
    "Switch",
    "ProgressBar",
    "Picker",
    "CheckBox",
    "Touchable",
  ],
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@tamagui/core", "tamagui", "@tamagui/config"],
  images: {
    domains: ["gate.whapi.cloud"],
  },
};

module.exports = withTamagui(tamaguiConfig)(nextConfig);
