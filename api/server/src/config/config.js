// src/config/config.js
const path = require('path');
const tsNode = require('ts-node'); // Register ts-node to handle TypeScript
// Register TypeScript with ts-node
tsNode.register({
  transpileOnly: true, // Transpile TypeScript without type checking
});
module.exports = require('./config.ts').default;
// console.log(require('./config.ts').default)