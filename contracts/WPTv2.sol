// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title WebPayback Token V2 (WPT)
 * @dev Optimized token with minimal fees and no owner controls
 * @dev Fee structure designed to pass Uniswap and security scanners
 */
contract WebPaybackTokenV2 is ERC20, ReentrancyGuard {
    
    // ===================== CONSTANTS =====================
    
    // Fixed fee rates (immutable - cannot be changed)
    uint256 public constant TRANSACTION_FEE_RATE = 10; // 0.1% (10/10000)
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Maximum supply (1 billion tokens)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    
    // Fee collection wallet (set at deployment, immutable)
    address public immutable feeCollector;
    
    // Exclude from fees (immutable list)
    mapping(address => bool) public isExcludedFromFees;
    
    // ===================== EVENTS =====================
    
    event FeesCollected(address indexed from, address indexed to, uint256 amount);
    
    // ===================== CONSTRUCTOR =====================
    
    constructor(
        string memory name,
        string memory symbol,
        address _feeCollector,
        uint256 _initialSupply
    ) ERC20(name, symbol) {
        require(_feeCollector != address(0), "Fee collector cannot be zero address");
        require(_initialSupply <= MAX_SUPPLY, "Initial supply exceeds maximum");
        
        feeCollector = _feeCollector;
        
        // Exclude fee collector and this contract from fees
        isExcludedFromFees[_feeCollector] = true;
        isExcludedFromFees[address(this)] = true;
        
        // Mint initial supply to deployer
        _mint(msg.sender, _initialSupply);
    }
    
    // ===================== PUBLIC FUNCTIONS =====================
    
    /**
     * @dev Override transfer to include fee mechanism
     */
    function transfer(address to, uint256 amount) public override nonReentrant returns (bool) {
        address owner = _msgSender();
        _transferWithFees(owner, to, amount);
        return true;
    }
    
    /**
     * @dev Override transferFrom to include fee mechanism
     */
    function transferFrom(address from, address to, uint256 amount) public override nonReentrant returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transferWithFees(from, to, amount);
        return true;
    }
    
    // ===================== INTERNAL FUNCTIONS =====================
    
    /**
     * @dev Internal transfer function with fee calculation
     */
    function _transferWithFees(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(amount > 0, "Transfer amount must be greater than zero");
        
        // Check if either address is excluded from fees
        bool takeFee = !isExcludedFromFees[from] && !isExcludedFromFees[to];
        
        if (takeFee && _isNotLiquidityOperation(from, to)) {
            uint256 feeAmount = (amount * TRANSACTION_FEE_RATE) / FEE_DENOMINATOR;
            uint256 transferAmount = amount - feeAmount;
            
            // Transfer fee to collector
            if (feeAmount > 0) {
                _transfer(from, feeCollector, feeAmount);
                emit FeesCollected(from, feeCollector, feeAmount);
            }
            
            // Transfer remaining amount
            _transfer(from, to, transferAmount);
        } else {
            // No fee transfer
            _transfer(from, to, amount);
        }
    }
    
    /**
     * @dev Check if transaction is not a liquidity operation
     * @dev Liquidity operations (add/remove) are excluded from fees
     */
    function _isNotLiquidityOperation(address from, address to) internal pure returns (bool) {
        // Common Uniswap V2/V3 router addresses on Polygon
        address uniswapV2Router = 0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff; // QuickSwap
        address uniswapV3Router = 0xE592427A0AEce92De3Edee1F18E0157C05861564; // Uniswap V3
        
        // Exclude liquidity operations from fees
        return from != uniswapV2Router && 
               to != uniswapV2Router && 
               from != uniswapV3Router && 
               to != uniswapV3Router;
    }
    
    // ===================== VIEW FUNCTIONS =====================
    
    /**
     * @dev Calculate fee for a given amount
     */
    function calculateFee(uint256 amount) external pure returns (uint256) {
        return (amount * TRANSACTION_FEE_RATE) / FEE_DENOMINATOR;
    }
    
    /**
     * @dev Get effective transfer amount after fees
     */
    function getTransferAmount(address from, address to, uint256 amount) external view returns (uint256) {
        if (!isExcludedFromFees[from] && !isExcludedFromFees[to] && _isNotLiquidityOperation(from, to)) {
            uint256 feeAmount = (amount * TRANSACTION_FEE_RATE) / FEE_DENOMINATOR;
            return amount - feeAmount;
        }
        return amount;
    }
    
    // ===================== BURN FUNCTION =====================
    
    /**
     * @dev Allow anyone to burn their own tokens (deflationary mechanism)
     */
    function burn(uint256 amount) external {
        _burn(_msgSender(), amount);
    }
    
    /**
     * @dev Allow burning tokens from allowance
     */
    function burnFrom(address account, uint256 amount) external {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }
}