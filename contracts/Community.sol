// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Community is ERC721A, Ownable, ReentrancyGuard {

    uint256 public constant MINT_PRICE = 0.001 ether; // TODO finalize price
    uint256 public constant MAX_SUPPLY = 10000;
    bool public mintingActive = true; // TODO initialize to false in prod
    string public currentBaseURI;
    
    constructor() ERC721A("Contract", "CONTRACT") {
    }

    /**
     * @dev Mint a token
    */
    function mint() public payable nonReentrant{
        require(totalSupply() + 1 <= MAX_SUPPLY, "Mint would exceed max supply");
        require(msg.value == MINT_PRICE, "Incorrect value");
        emit Transfer(address(0), msg.sender, totalSupply());
        _safeMint(msg.sender, 1);
    }

    /**
     * @dev Override the base URI
    */
    function _baseURI() internal view virtual override returns (string memory) {
        return currentBaseURI;
    }

    /**
     * @dev Set the base URI
    */
    function setBaseURI(string memory baseURI_) public onlyOwner {
        currentBaseURI = baseURI_;
    }

    /**
     * @dev Set the minting active flag
    */
    function setMintingActive() public onlyOwner {
        mintingActive = !mintingActive;
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