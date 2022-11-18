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
     * @param signature The signature of the message
     * @param sigId A unique identifier for the signature, so that the sender can mint again
     */
    function mint(bytes calldata signature, string memory sigId) public payable nonReentrant {
        require(mintingActive, "Minting not active");
        // check the signature
        bytes memory data = abi.encode(this, msg.sender, sigId);
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
    function withdrawEth() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Withdraw failed");
    }
}
