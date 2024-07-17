// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

// import "hardhat/console.sol";

contract MyMultiSigWallet {
    struct Transaction {
        bool executed;
        address receiver;
        uint256 value;
        uint256 numConfirmations;
        bytes data;
    }

    uint256 public numConfirmationsRequired;
    Transaction[] public transactions;
    address[] public owners;
    mapping(address => bool) public isOwner;
    mapping(uint256 => mapping(address => bool)) isConfirmed;

    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(address indexed sender, address indexed to, uint256 value, uint256 txIndex, bytes data);
    event ConfirmTransaction(address indexed sender, uint256 txIndex);
    event RevokeConfirmation(address indexed revokedBy, uint256 txIndex);
    event ExecuteTransaction(address indexed executedBy, uint256 txIndex);

    error NotOwner(address sender);
    error NoTransactionForId(uint256 txIndex);
    error TransactionAlreadyExecuted(uint256 txIndex);
    error TransactionAlreadyConfirmed(address sender, uint256 txIndex);
    error OwnersRequired();
    error InvalidNumberConfirmations();
    error InvalidOwner();
    error OwnerAlreadyExists(address owner);
    error InvalidTransactionReceiver();
    error InvalidTransactionValue();
    error TransactionNotConfirmed(address sender, uint256 txIndex);
    error InsufficientBalance(uint256 balance, uint256 value);
    error TransactionExecutionFailed(uint256 txIndex);

    modifier onlyOwner() {
        require(isOwner[msg.sender], NotOwner(msg.sender));
        _;
    }

    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, NoTransactionForId(_txIndex));
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, TransactionAlreadyExecuted(_txIndex));
        _;
    }

    modifier notConfirmed(uint256 _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], TransactionAlreadyConfirmed(msg.sender, _txIndex));
        _;
    }

    constructor(address[] memory _owners, uint256 _numConfirmationsRequired) {
        uint256 ownersLen = _owners.length;

        require(ownersLen > 0, OwnersRequired());
        require(_numConfirmationsRequired > 0 && _numConfirmationsRequired <= ownersLen, InvalidNumberConfirmations());

        for (uint256 i = 0; i < ownersLen; ++i) {
            address owner = _owners[i];

            require(owner != address(0), InvalidOwner());
            require(!isOwner[owner], OwnerAlreadyExists(owner));

            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function proposeTransaction(address _receiver, uint256 _value, bytes memory _data) external onlyOwner {
        require(_receiver != address(0), InvalidTransactionReceiver());
        require(_value > 0, InvalidTransactionValue());

        uint256 txIndex = transactions.length;

        transactions[txIndex].receiver = _receiver;
        transactions[txIndex].value = _value;
        transactions[txIndex].data = _data;

        emit SubmitTransaction(msg.sender, _receiver, _value, txIndex, _data);
    }

    function confirmTransaction(uint256 _txIndex) external onlyOwner txExists(_txIndex) notExecuted(_txIndex) notConfirmed(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;

        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    function revokeConfirmation(uint256 _txIndex) external onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];

        require(isConfirmed[_txIndex][msg.sender], TransactionNotConfirmed(msg.sender, _txIndex));

        delete isConfirmed[_txIndex][msg.sender];
        transaction.numConfirmations -= 1;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    function executeTransaction(uint256 _txIndex) external onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];

        require(transaction.numConfirmations >= numConfirmationsRequired, TransactionNotConfirmed(msg.sender, _txIndex));
        require(address(this).balance >= transaction.value, InsufficientBalance(address(this).balance, transaction.value));

        transaction.executed = true;
        
        (bool success, ) = transaction.receiver.call{value: transaction.value}(transaction.data);
        require(success, TransactionExecutionFailed(_txIndex));
    }

    function getAllOwners() external view returns (address[] memory owners_) {
        owners_ = owners;
    }

    function getTransactionCount() external view returns (uint256 count) {
        count = transactions.length;
    }

    function getTransaction(uint256 _txIndex) external view txExists(_txIndex) returns (Transaction memory transaction) {
        transaction = transactions[_txIndex];
    }
}
