# 运行

```shell
npm i
```

## 修改私钥

修改 hardhat.conf.ts 中的 accounts

```ts
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
```

## 运行测试

```shell
npx hardhat run ./scripts/deploy.ts --network goerli
```
