module.exports = {
  algoliaId: process.env.ALGOLIA_ID || "I2VKMNNAXI", // Algolia DB Id
  algoliaKey: process.env.ALGOLIA_KEY || "1a865896c07d9c08f3e2f14736e840bf", // Algolia Private Key
  algoliaPublic: process.env.ALGOLIA_PUBLIC || "2b8406f84cd4cc507da173032c46ee7b", // Algolia Public Key
  sopFetchTimeout: process.env.SOP_FETCH_TIMEOUT || 10, // SOP fetch timeout
  appMode: process.env.APP_MODE || "PRE", // App Mode: PRE/LIVE
  prodMode: process.env.PROD_MODE || "REAL", // Prod Mode: REAL/TEST
}
