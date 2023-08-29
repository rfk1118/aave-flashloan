import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.6.12",
  },
  networks: {
    goerli: {
      url: "https://ethereum-goerli.publicnode.com",
      accounts: ["请编写自己私钥"],
    },
  },
};

export default config;
