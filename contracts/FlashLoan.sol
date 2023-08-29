// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.6.12;

import {FlashLoanReceiverBase} from "@aave/protocol-v2/contracts/flashloan/base/FlashLoanReceiverBase.sol";
import {ILendingPool} from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import {ILendingPoolAddressesProvider} from "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";
import {IERC20} from "@aave/protocol-v2/contracts/dependencies/openzeppelin/contracts/IERC20.sol";

contract FlashLoan is FlashLoanReceiverBase {
    // 保存部署者
    address private immutable owner;

    constructor(
        address _addressProvider
    )
        public
        FlashLoanReceiverBase(ILendingPoolAddressesProvider(_addressProvider))
    {
        owner = msg.sender;
    }

    // 变量无用，注释掉initiator and params
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address /**initiator**/,
        bytes calldata /**params**/
    ) external override returns (bool) {
        // 迭代代币地址
        for (uint256 i = 0; i < assets.length; i++) {
            // 计算出每个代币地址的借贷和利息
            uint256 amountOwing = amounts[i].add(premiums[i]);
            // 授权给池子金额，这样池子能够拿代币
            IERC20(assets[i]).approve(address(LENDING_POOL), amountOwing);
        }
        return true;
    }

    function requestFlashLoan(address _token, uint256 _amount) public {
        address receiverAddress = address(this);
        // 代币地址
        address[] memory assets = new address[](1);
        assets[0] = _token;
        // 借贷数量
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = _amount;
        // 0 = no debt, 1 = stable, 2 = variable
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;
        // 接收代币地址
        address onBehalfOf = address(this);
        LENDING_POOL.flashLoan(
            receiverAddress,
            assets,
            amounts,
            modes,
            onBehalfOf,
            "",
            0
        );
    }

    // 获取
    function getBalance(address _tokenAddress) external view returns (uint256) {
        return IERC20(_tokenAddress).balanceOf(address(this));
    }

    // 提款
    function withdraw(address _tokenAddress) external onlyOwner {
        IERC20(_tokenAddress).transfer(
            msg.sender,
            // 这里查询balanceOf，修改成IERC20(_tokenAddress)
            IERC20(_tokenAddress).balanceOf(address(this))
        );
    }

    // 权限
    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner can call this function"
        );
        _;
    }

    // 接收eth
    receive() external payable {}
}
