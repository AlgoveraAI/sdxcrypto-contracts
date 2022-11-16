// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Access is ERC721Enumerable, Ownable, ReentrancyGuard {

    mapping (uint256 => string) private tokenURIs;
    mapping (uint256 => uint256) private tokenPrices;

    constructor() ERC721("Access", "A") {}

    /** @dev Mint a token
     */
    function mint(
        uint256 tokenId
    ) public payable nonReentrant{
        // check that the tokenId has a URI and price
        require(bytes(tokenURIs[tokenId]).length > 0, "URI not set");
        require(tokenPrices[tokenId] != 0, "Price not set");
        // check the value
        require(msg.value == tokenPrices[tokenId], "Incorrect value");
        _safeMint(msg.sender, tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        return tokenURIs[tokenId];
    }

    /** @dev Set a URI for a token
     */
    function setTokenURI(uint256 tokenId, string memory tokenURI_) public onlyOwner {
        tokenURIs[tokenId] = tokenURI_;
    }

    /** @dev Set a price for a token
     */
    function setTokenPrice(uint256 tokenId, uint256 price) public onlyOwner {
        tokenPrices[tokenId] = price;
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