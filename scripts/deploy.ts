import hre from "hardhat";
import { ethers } from "hardhat";

// v3地址：0xC911B590248d127aD18546B186cC6B324e99F02c
// v2地址：0x5E52dEc931FFb32f609681B8438A51c675cc232d

const usdcAbi = [
  "constructor(string name, string symbol, uint8 decimals)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function decreaseAllowance(address spender, uint256 subtractedValue) returns (bool)",
  "function increaseAllowance(address spender, uint256 addedValue) returns (bool)",
  "function mint(uint256 value) returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)",
];

const abi = [
  "constructor(address _addressProvider)",
  "function ADDRESSES_PROVIDER() view returns (address)",
  "function LENDING_POOL() view returns (address)",
  "function executeOperation(address[] assets, uint256[] amounts, uint256[] premiums, address, bytes) returns (bool)",
  "function getBalance(address _tokenAddress) view returns (uint256)",
  "function requestFlashLoan(address _token, uint256 _amount)",
  "function withdraw(address _tokenAddress)",
];

const usdcAddress = "0x9FD21bE27A2B059a288229361E2fA632D8D2d074";

const v2FlashAddress = "0x5E52dEc931FFb32f609681B8438A51c675cc232d";
const mintMoney = 1000000000;
async function main() {
  // 获取账户
  const [owner] = await ethers.getSigners();
  // 获取合约
  const FlashLoan = await hre.ethers.getContractFactory("FlashLoan");
  // 部署合约
  const flashLoan = await FlashLoan.deploy(v2FlashAddress);
  await flashLoan.deployed();
  console.log("部署FlashLoanAddress" + flashLoan.address);
  const FlashLoanAddress = flashLoan.address;

  console.log("开始claim");
  // 领取usdc claim
  const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, owner);
  const claim = {
    from: owner.address,
    to: usdcAddress,
    data: usdcContract.interface.encodeFunctionData("mint", [mintMoney]),
  };
  const transactionResponse = await owner.sendTransaction(claim);
  transactionResponse.wait();
  console.log("claim结果" + transactionResponse);

  const balanceOf = await usdcContract.balanceOf(owner.address);
  console.log("转账给flash loan金额" + balanceOf);

  const transferPara = {
    from: owner.address,
    to: usdcAddress,
    data: usdcContract.interface.encodeFunctionData("transfer", [
      FlashLoanAddress,
      balanceOf,
    ]),
  };
  const transferResult = await owner.sendTransaction(transferPara);
  transferResult.wait();
  console.log("转账成功，tx" + transferResult.hash);

  // 拿到flash合约
  const flashLoanContract = new ethers.Contract(flashLoan.address, abi, owner);
  // 创建参数
  const flashLoanParams = {
    from: owner.address,
    to: flashLoan.address,
    data: flashLoanContract.interface.encodeFunctionData("requestFlashLoan", [
      usdcAddress,
      mintMoney,
    ]),
  };
  // 进行借贷
  const flashLoanResult = await owner.sendTransaction(flashLoanParams);
  console.log(`Transaction hash: ${flashLoanResult.hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
