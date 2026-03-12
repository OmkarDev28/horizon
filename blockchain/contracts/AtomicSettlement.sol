pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AtomicSettlement
 * @dev Handles atomic Delivery vs Payment (DvP) for securities and fiat.
 */
contract AtomicSettlement is Ownable {
    
    // In a production environment, we'd have a registry of approved securities.
    mapping(address => bool) public isApprovedSecurity;
    address public inrToken;

    event DvPSettled(
        address indexed seller,
        address indexed buyer,
        address security,
        uint256 amount,
        uint256 price
    );

    constructor(address _inrToken) Ownable(msg.sender) {
        inrToken = _inrToken;
    }

    function approveSecurity(address _security) external onlyOwner {
        isApprovedSecurity[_security] = true;
    }

    /**
     * @dev Settles a trade atomically.
     * Both buyer and seller MUST have approved this contract for the amounts.
     * @param seller address of the seller
     * @param buyer address of the buyer
     * @param security address of the security token
     * @param amount amount of security units
     * @param totalPrice total INR amount to be paid
     */
    function settle(
        address seller,
        address buyer,
        address security,
        uint256 amount,
        uint256 totalPrice
    ) external {
        
        require(owner() == msg.sender, "Unauthorized");
        require(isApprovedSecurity[security], "Not an approved security");

        // 1. Transfer Security from Seller to Buyer
        require(IERC20(security).transferFrom(seller, buyer, amount), "Security transfer failed");

        // 2. Transfer INR from Buyer to Seller
        require(IERC20(inrToken).transferFrom(buyer, seller, totalPrice), "INR transfer failed");

        emit DvPSettled(seller, buyer, security, amount, totalPrice);
    }
}
