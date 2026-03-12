pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SecurityToken is ERC20, Ownable {
    string private _isin; // International Securities Identification Number

    constructor(string memory name, string memory symbol, string memory isin_) 
        ERC20(name, symbol) 
        Ownable(msg.sender) 
    {
        _isin = isin_;
    }

    function isin() external view returns (string memory) {
        return _isin;
    }

    // Only authorized clearing corporations can mint or burn securities
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
