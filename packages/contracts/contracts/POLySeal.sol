// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MockUSDC
 * @dev A 6-decimal mock USDC token for testing on Polygon Amoy testnet
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private constant DECIMALS = 6;

    constructor() ERC20("Mock USDC", "mUSDC") Ownable(msg.sender) {}

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}

/**
 * @title SessionPay
 * @dev Escrow contract for AI inference payments with attestation support
 * Implements secure "Pay → Run → Attest" workflow with refund protection
 */
contract SessionPay is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    struct Session {
        address payer;
        address provider;
        address token;
        uint256 amount;
        uint64 createdAt;
        bool settled;
        bytes32 inputHash;
        string model;
        string outputRef;
    }

    mapping(bytes32 => Session) private _sessions;
    uint64 public refundDelay = 15 minutes;

    event SessionOpened(
        bytes32 indexed requestId,
        address indexed payer,
        address indexed provider,
        address token,
        uint256 amount,
        string model,
        bytes32 inputHash,
        uint64 createdAt
    );

    event SessionSettled(
        bytes32 indexed requestId,
        address indexed payer,
        address indexed provider,
        address token,
        uint256 amount,
        string outputRef
    );

    event SessionRefunded(
        bytes32 indexed requestId,
        address indexed payer,
        address token,
        uint256 amount
    );

    event RefundDelayUpdated(uint64 oldDelay, uint64 newDelay);

    error InvalidProvider();
    error InvalidToken();
    error InvalidAmount();
    error SessionExists();
    error SessionNotFound();
    error SessionAlreadySettled();
    error OnlyProvider();
    error OnlyPayer();
    error RefundTooSoon();
    error RefundDelayTooLong();

    constructor(address owner_) Ownable(owner_) {}

    /**
     * @dev Opens a new AI inference session with escrow payment
     * @param provider Address of the AI service provider
     * @param token Address of the payment token (e.g., USDC)
     * @param amount Payment amount in token decimals
     * @param requestId Unique identifier for this inference request
     * @param model AI model to be used (e.g., "gpt-4o-mini")
     * @param inputHash Hash of the input data for verification
     */
    function openSession(
        address provider,
        address token,
        uint256 amount,
        bytes32 requestId,
        string calldata model,
        bytes32 inputHash
    ) external whenNotPaused nonReentrant {
        if (provider == address(0)) revert InvalidProvider();
        if (token == address(0)) revert InvalidToken();
        if (amount == 0) revert InvalidAmount();
        if (_sessions[requestId].payer != address(0)) revert SessionExists();

        // Transfer payment to escrow
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Store session details
        _sessions[requestId] = Session({
            payer: msg.sender,
            provider: provider,
            token: token,
            amount: amount,
            createdAt: uint64(block.timestamp),
            settled: false,
            inputHash: inputHash,
            model: model,
            outputRef: ""
        });

        emit SessionOpened(
            requestId,
            msg.sender,
            provider,
            token,
            amount,
            model,
            inputHash,
            uint64(block.timestamp)
        );
    }

    /**
     * @dev Confirms successful AI inference and releases payment to provider
     * @param requestId The session identifier
     * @param outputRef Reference to the inference output (IPFS hash, URL, etc.)
     */
    function confirmSuccess(
        bytes32 requestId,
        string calldata outputRef
    ) external whenNotPaused nonReentrant {
        Session storage s = _sessions[requestId];
        if (s.payer == address(0)) revert SessionNotFound();
        if (s.settled) revert SessionAlreadySettled();
        if (msg.sender != s.provider) revert OnlyProvider();

        // Mark as settled and store output reference
        s.settled = true;
        s.outputRef = outputRef;

        // Release payment to provider
        IERC20(s.token).safeTransfer(s.provider, s.amount);

        emit SessionSettled(requestId, s.payer, s.provider, s.token, s.amount, outputRef);
    }

    /**
     * @dev Allows payer to claim refund after delay period
     * @param requestId The session identifier
     */
    function refund(bytes32 requestId) external whenNotPaused nonReentrant {
        Session storage s = _sessions[requestId];
        if (s.payer == address(0)) revert SessionNotFound();
        if (s.settled) revert SessionAlreadySettled();
        if (msg.sender != s.payer) revert OnlyPayer();
        if (block.timestamp < s.createdAt + refundDelay) revert RefundTooSoon();

        // Mark as settled and refund to payer
        s.settled = true;
        IERC20(s.token).safeTransfer(s.payer, s.amount);

        emit SessionRefunded(requestId, s.payer, s.token, s.amount);
    }

    /**
     * @dev Updates the refund delay period (owner only)
     * @param newDelay New delay in seconds (max 7 days)
     */
    function setRefundDelay(uint64 newDelay) external onlyOwner {
        if (newDelay > 7 days) revert RefundDelayTooLong();
        uint64 oldDelay = refundDelay;
        refundDelay = newDelay;
        emit RefundDelayUpdated(oldDelay, newDelay);
    }

    /**
     * @dev Pauses the contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Gets session details
     * @param requestId The session identifier
     * @return Session details
     */
    function getSession(bytes32 requestId) external view returns (Session memory) {
        return _sessions[requestId];
    }

    /**
     * @dev Checks if a session exists
     * @param requestId The session identifier
     * @return True if session exists
     */
    function sessionExists(bytes32 requestId) external view returns (bool) {
        return _sessions[requestId].payer != address(0);
    }

    /**
     * @dev Checks if a session is settled
     * @param requestId The session identifier
     * @return True if session is settled
     */
    function isSettled(bytes32 requestId) external view returns (bool) {
        return _sessions[requestId].settled;
    }

    /**
     * @dev Checks if refund is available for a session
     * @param requestId The session identifier
     * @return True if refund is available
     */
    function canRefund(bytes32 requestId) external view returns (bool) {
        Session memory s = _sessions[requestId];
        return s.payer != address(0) && 
               !s.settled && 
               block.timestamp >= s.createdAt + refundDelay;
    }
}