// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./SignatureChecker.sol";
import "./SignerManager.sol";

contract Creator is ERC1155, Ownable, ReentrancyGuard, SignerManager{
    mapping(uint256 => string) public tokenURIs;
    mapping(uint256 => uint256) public tokenPrices;
    mapping(uint256 => bool) public mintingActive;
    mapping(bytes32 => bool) public usedMessages;
    mapping(uint256 => uint256) public maxSupply;
    mapping(uint256 => uint256) public totalSupply;

    string public name;
    string public symbol;

     constructor(
        string memory _name,
        string memory _symbol
    ) ERC1155("") {
        name = _name;
        symbol = _symbol;
    }

    /** @dev Mint a token
     */
    function mint(uint256 tokenId, bytes calldata signature)
        public
        payable
        nonReentrant
    {
        // needs metadata, a price, and active minting
        require(bytes(tokenURIs[tokenId]).length > 0, "URI not set");
        require(mintingActive[tokenId], "Minting not active");

        // check the balance (wallets can only use one nft - prevent double minting)
        require(balanceOf(msg.sender, tokenId) == 0, "Already minted");

        // check max supply (if set)
        if (maxSupply[tokenId] > 0) {
            require(totalSupply[tokenId] < maxSupply[tokenId], "Max supply reached");
        }

        if (signature.length > 0) {
            // check the signature (includes a custom price)
            bytes memory data = abi.encode(this, msg.sender, tokenId, msg.value);            
            SignatureChecker.requireValidSignature(
                signers,
                data,
                signature,
                usedMessages
            );
        }
        else {
            // minting without a signature uses the standard price
            // which is 0 if not set
            require(msg.value == tokenPrices[tokenId], "Incorrect value");
        }
        // mint
        totalSupply[tokenId] += 1;
        _mint(msg.sender, tokenId, 1, "");
    }

    /** @dev Return the URI for a token
     */
    function uri(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        return tokenURIs[tokenId];
    }

    /** @dev Set a price for a token
     */
    function setTokenPrice(uint256 tokenId, uint256 price) public onlyOwner {
        tokenPrices[tokenId] = price;
    }

    /** @dev Set the metadata for a token
     * @param tokenId The token ID
     * @param _uri The metadata uri (e.g. ipfs://...)
     */
    function setTokenURI(uint256 tokenId, string memory _uri) public onlyOwner {
        tokenURIs[tokenId] = _uri;
    }

    /** @dev Set the minting active flag
     */
    function toggleMintingActive(uint256 tokenId) public onlyOwner {
        mintingActive[tokenId] = !mintingActive[tokenId];
    }

    /** @dev Set token's max supply */
    function setMaxSupply(uint256 tokenId, uint256 supply) public onlyOwner {
        maxSupply[tokenId] = supply;
    }

    /**
     * @dev Helper to check if a signature has been used
     * @param to The address to mint to
     * @param tokenId The max number of tokens to mint
     */
    function sigUsed(
        address to,
        uint256 tokenId
    ) public view returns (bool) {
        bytes memory data = abi.encode(this, to, tokenId);
        bytes32 message = SignatureChecker.generateMessage(data);
        return usedMessages[message];
    }

    /** 
     * @dev Disable transfers
    */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        revert("Transfers disabled");
    }

    /** 
     * @dev Disable batch transfers
    */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override {
        revert("Transfers disabled");
    }

    /**
     * @dev Withdraw ether to owner's wallet
     */
    function withdrawEth() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Withdraw failed");
    }
}
