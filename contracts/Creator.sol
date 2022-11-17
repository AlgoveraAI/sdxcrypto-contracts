// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Creator is ERC721Enumerable, Ownable, ReentrancyGuard {

    mapping (uint256 => string) private tokenURIs;
    mapping (uint256 => uint256) private tokenPrices;
    mapping(uint256 => bool) private mintingActive;

    constructor() ERC721("Creator", "CR") {}

    /** @dev Mint a token
     */
    function mint(
        uint256 tokenId
    ) public payable nonReentrant{
        // needs metadata, a price, and active minting
        require(bytes(tokenURIs[tokenId]).length > 0, "URI not set");
        require(tokenPrices[tokenId] != 0, "Price not set");
        require(mintingActive[tokenId], "Minting not active");
        // check the value
        require(msg.value == tokenPrices[tokenId], "Incorrect value");
        _safeMint(msg.sender, tokenId);
    }

    /** @dev Overrides the base URI to return stored token metadata
     */
    function tokenURI(uint256 tokenId)
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
     * @param uri The metadata uri (e.g. ipfs://...)
     */
    function setTokenMetadata(uint256 tokenId, string memory uri) public onlyOwner {
        tokenURIs[tokenId] = uri;
    }

    /** @dev Set the minting active flag
     */
    function setMintingActive(uint256 tokenId, bool active) public onlyOwner {
        mintingActive[tokenId] = active;
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