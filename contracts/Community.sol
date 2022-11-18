// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Community is ERC721A, Ownable, ReentrancyGuard {
    bool public mintingActive = false;
    string public currentBaseURI;
    address private signer;

    constructor() ERC721A("Community", "CO") {}

    /**
     * @dev Mint a token
     */
    function mint(bytes calldata signature) public payable nonReentrant {
        require(mintingActive, "Minting not active");
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
