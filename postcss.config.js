/* // postcss.config.js
module.exports = {
  plugins: [
    require("@tailwindcss/postcss")({
      tailwindConfig: "./tailwind.config.js",
    }),
    require("autoprefixer"),
  ],
};
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
