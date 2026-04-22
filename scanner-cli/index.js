#!/usr/bin/env node

const { discoverDevices, getDefaultTarget } = require("./network-discovery");

function parseArguments(argv) {
  const args = {
    target: ""
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--target" && argv[index + 1]) {
      args.target = argv[index + 1];
      index += 1;
    }
  }

  return args;
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  const target = args.target || getDefaultTarget();

  try {
    const result = await discoverDevices(target);
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scanner failure";
    process.stderr.write(`Scanner failed: ${message}\n`);
    process.exit(1);
  }
}

main();
