// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./SignatureChecker.sol";
import "./SignerManager.sol";

contract Community is ERC721A, Ownable, ReentrancyGuard, SignerManager {
    bool public mintingActive = false;
    string public currentBaseURI;
    mapping(bytes32 => bool) public usedMessages;

    constructor() ERC721A("Community", "CO") {}

    /**
     * @dev Mint a token
     * @param signature Provided by Algovera to approve the mint
     */
    function mint(bytes calldata signature) public payable nonReentrant {
        require(mintingActive, "Minting not active");
        // check the signature
        uint256 bal = balanceOf(msg.sender);
        bytes memory data = abi.encode(this, msg.sender, bal);
        SignatureChecker.requireValidSignature(signers, data, signature, usedMessages);
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
     * @dev Enable or disable minting
     */
    function toggleMintingActive() public onlyOwner {
        mintingActive = !mintingActive;
    }

    /**
     * @dev Withdraw ether to owner's wallet
     */
    function withdrawETH() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Withdraw failed");
    }
}
