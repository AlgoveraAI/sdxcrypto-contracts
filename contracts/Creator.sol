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
        require(tokenPrices[tokenId] != 0, "Price not set");
        require(mintingActive[tokenId], "Minting not active");
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
            require(msg.value == tokenPrices[tokenId], "Incorrect value");
        }
        // mint
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
    function setMintingActive(uint256 tokenId, bool active) public onlyOwner {
        mintingActive[tokenId] = active;
    }

    // /**
    //  * @dev Helper to check if a signature has been used
    //  * @param to The address to mint to
    //  * @param tokenId The max number of tokens to mint
    //  */
    // function sigUsed(
    //     address to,
    //     uint256 tokenId
    // ) public view returns (bool) {
    //     bytes memory data = abi.encode(this, to, tokenId);
    //     bytes32 message = SignatureChecker.generateMessage(data);
    //     return usedMessages[message];
    // }

    /**
     * @dev Withdraw ether to owner's wallet
     */
    function withdrawEth() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Withdraw failed");
    }
}
