// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title FilePay
 * @dev Smart contract for handling file purchase payments on Base blockchain
 */
contract FilePay is ReentrancyGuard, Ownable, Pausable {
    // USDC token address on Base
    IERC20 public immutable usdcToken;
    
    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFee = 250;
    uint256 public constant MAX_PLATFORM_FEE = 1000; // 10% max
    
    // Fee recipient
    address public feeRecipient;
    
    struct FilePayment {
        string fileId;
        address creator;
        address buyer;
        uint256 amount;
        uint256 timestamp;
        bool completed;
    }
    
    // Mapping from payment ID to payment details
    mapping(bytes32 => FilePayment) public payments;
    
    // Mapping from file ID to creator
    mapping(string => address) public fileCreators;
    
    // Mapping from file ID to price
    mapping(string => uint256) public filePrices;
    
    // Events
    event FileRegistered(string indexed fileId, address indexed creator, uint256 price);
    event PaymentCreated(bytes32 indexed paymentId, string indexed fileId, address indexed buyer, uint256 amount);
    event PaymentCompleted(bytes32 indexed paymentId, address indexed creator, uint256 creatorAmount, uint256 feeAmount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    
    constructor(address _usdcToken, address _feeRecipient) {
        require(_usdcToken != address(0), "Invalid USDC token address");
        require(_feeRecipient != address(0), "Invalid fee recipient address");
        
        usdcToken = IERC20(_usdcToken);
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Register a file for sale
     * @param fileId Unique identifier for the file
     * @param price Price in USDC (with 6 decimals)
     */
    function registerFile(string calldata fileId, uint256 price) external whenNotPaused {
        require(bytes(fileId).length > 0, "File ID cannot be empty");
        require(price > 0, "Price must be greater than 0");
        require(fileCreators[fileId] == address(0), "File already registered");
        
        fileCreators[fileId] = msg.sender;
        filePrices[fileId] = price;
        
        emit FileRegistered(fileId, msg.sender, price);
    }
    
    /**
     * @dev Update file price (only by creator)
     * @param fileId File identifier
     * @param newPrice New price in USDC
     */
    function updateFilePrice(string calldata fileId, uint256 newPrice) external whenNotPaused {
        require(fileCreators[fileId] == msg.sender, "Only creator can update price");
        require(newPrice > 0, "Price must be greater than 0");
        
        filePrices[fileId] = newPrice;
        emit FileRegistered(fileId, msg.sender, newPrice);
    }
    
    /**
     * @dev Create a payment for file access
     * @param fileId File identifier
     * @return paymentId Unique payment identifier
     */
    function createPayment(string calldata fileId) external whenNotPaused nonReentrant returns (bytes32) {
        require(bytes(fileId).length > 0, "File ID cannot be empty");
        require(fileCreators[fileId] != address(0), "File not registered");
        require(fileCreators[fileId] != msg.sender, "Cannot buy your own file");
        
        uint256 price = filePrices[fileId];
        require(price > 0, "Invalid file price");
        
        // Generate unique payment ID
        bytes32 paymentId = keccak256(abi.encodePacked(fileId, msg.sender, block.timestamp, block.number));
        require(!payments[paymentId].completed, "Payment already exists");
        
        // Transfer USDC from buyer
        require(usdcToken.transferFrom(msg.sender, address(this), price), "USDC transfer failed");
        
        // Store payment details
        payments[paymentId] = FilePayment({
            fileId: fileId,
            creator: fileCreators[fileId],
            buyer: msg.sender,
            amount: price,
            timestamp: block.timestamp,
            completed: false
        });
        
        emit PaymentCreated(paymentId, fileId, msg.sender, price);
        return paymentId;
    }
    
    /**
     * @dev Complete payment and distribute funds
     * @param paymentId Payment identifier
     */
    function completePayment(bytes32 paymentId) external whenNotPaused nonReentrant {
        FilePayment storage payment = payments[paymentId];
        require(payment.amount > 0, "Payment not found");
        require(!payment.completed, "Payment already completed");
        require(payment.buyer == msg.sender, "Only buyer can complete payment");
        
        // Calculate fees
        uint256 feeAmount = (payment.amount * platformFee) / 10000;
        uint256 creatorAmount = payment.amount - feeAmount;
        
        // Mark as completed
        payment.completed = true;
        
        // Transfer funds
        if (feeAmount > 0) {
            require(usdcToken.transfer(feeRecipient, feeAmount), "Fee transfer failed");
        }
        require(usdcToken.transfer(payment.creator, creatorAmount), "Creator transfer failed");
        
        emit PaymentCompleted(paymentId, payment.creator, creatorAmount, feeAmount);
    }
    
    /**
     * @dev Get payment details
     * @param paymentId Payment identifier
     */
    function getPayment(bytes32 paymentId) external view returns (FilePayment memory) {
        return payments[paymentId];
    }
    
    /**
     * @dev Check if payment is valid and completed
     * @param paymentId Payment identifier
     */
    function isPaymentValid(bytes32 paymentId) external view returns (bool) {
        return payments[paymentId].completed && payments[paymentId].amount > 0;
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     * @param token Token address (use address(0) for ETH)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
    
    /**
     * @dev Update platform fee (only owner)
     * @param newFee New fee in basis points
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_PLATFORM_FEE, "Fee too high");
        uint256 oldFee = platformFee;
        platformFee = newFee;
        emit PlatformFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Update fee recipient (only owner)
     * @param newRecipient New fee recipient address
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient address");
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
