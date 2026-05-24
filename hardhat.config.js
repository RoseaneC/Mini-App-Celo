require("@nomicfoundation/hardhat-toolbox");

const celoPrivateKey = process.env.CELO_MAINNET_PRIVATE_KEY;
const celoscanApiKey = process.env.CELOSCAN_API_KEY ?? "";

/** @type import("hardhat/config").HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    celo: {
      url: "https://forno.celo.org",
      chainId: 42220,
      accounts: celoPrivateKey ? [celoPrivateKey] : [],
    },
  },
  etherscan: {
    apiKey: {
      celo: celoscanApiKey,
    },
    customChains: [
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};
