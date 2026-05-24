// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title InapayRegistry
/// @notice Minimal registry for payment receipts. It never receives or holds funds.
contract InapayRegistry {
    struct Payment {
        uint256 id;
        address sender;
        address receiver;
        address token;
        uint256 amount;
        bytes32 paymentRef;
        uint256 timestamp;
    }

    uint256 public paymentCount;

    mapping(uint256 id => Payment payment) public payments;

    event PaymentRecorded(
        uint256 indexed id,
        address indexed sender,
        address indexed receiver,
        address token,
        uint256 amount,
        bytes32 paymentRef,
        uint256 timestamp
    );

    function recordPayment(
        address receiver,
        address token,
        uint256 amount,
        bytes32 paymentRef
    ) external returns (uint256 id) {
        require(receiver != address(0), "Invalid receiver");
        require(amount > 0, "Invalid amount");

        id = ++paymentCount;

        payments[id] = Payment({
            id: id,
            sender: msg.sender,
            receiver: receiver,
            token: token,
            amount: amount,
            paymentRef: paymentRef,
            timestamp: block.timestamp
        });

        emit PaymentRecorded(
            id,
            msg.sender,
            receiver,
            token,
            amount,
            paymentRef,
            block.timestamp
        );
    }
}
