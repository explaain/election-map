module.exports = {
  algoliaId: process.env.ALGOLIA_ID || "I2VKMNNAXI", // Algolia DB Id
  algoliaKey: process.env.ALGOLIA_KEY || "1a865896c07d9c08f3e2f14736e840bf", // Algolia Private Key
  algoliaPublic: process.env.ALGOLIA_PUBLIC || "2b8406f84cd4cc507da173032c46ee7b", // Algolia Public Key
  sopFetchTimeout: process.env.SOP_FETCH_TIMEOUT || 10, // SOP fetch timeout
  startDate: process.env.START_DATE?process.env.START_DATE:"Wed Jun 7 2017 23:23:59 GMT+0100 (BST)"
}
