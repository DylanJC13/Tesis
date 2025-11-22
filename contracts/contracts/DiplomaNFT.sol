// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract DiplomaNFT is ERC721, Ownable {
    struct Diploma {
        string diplomaId;
        address graduateWallet;
        bytes32 fileHash;
        string ipfsCid;
        string nombreEstudiante;
        string programa;
        string fechaGrado;
        string nombreInstitucion;
    }

    mapping(string => Diploma) private diplomas;
    mapping(string => uint256) private diplomaTokenIds;
    mapping(uint256 => string) private tokenIdToDiplomaId;
    uint256 private _tokenCounter;
    address public institutionAdmin;

    event DiplomaMinted(
        string diplomaId,
        address indexed to,
        string ipfsCid,
        bytes32 fileHash
    );

    modifier onlyInstitutionAdmin() {
        require(msg.sender == institutionAdmin, "Not institution admin");
        _;
    }

    constructor(address initialAdmin) ERC721("DiplomaNFT", "DNFT") Ownable(msg.sender) {
        require(initialAdmin != address(0), "Admin required");
        institutionAdmin = initialAdmin;
    }

    function setInstitutionAdmin(address newAdmin) external onlyOwner {
        require(newAdmin != address(0), "Invalid admin");
        institutionAdmin = newAdmin;
    }

    function mintDiploma(
        address to,
        string memory diplomaId,
        string memory ipfsCid,
        bytes32 fileHash,
        string memory nombreEstudiante,
        string memory programa,
        string memory fechaGrado,
        string memory nombreInstitucion
    ) external onlyInstitutionAdmin {
        require(to != address(0), "Recipient required");
        require(bytes(diplomaId).length > 0, "diplomaId required");
        require(bytes(ipfsCid).length > 0, "ipfsCid required");
        require(diplomaTokenIds[diplomaId] == 0, "Diploma already minted");

        uint256 tokenId = ++_tokenCounter;
        _safeMint(to, tokenId);

        diplomas[diplomaId] = Diploma({
            diplomaId: diplomaId,
            graduateWallet: to,
            fileHash: fileHash,
            ipfsCid: ipfsCid,
            nombreEstudiante: nombreEstudiante,
            programa: programa,
            fechaGrado: fechaGrado,
            nombreInstitucion: nombreInstitucion
        });

        diplomaTokenIds[diplomaId] = tokenId;
        tokenIdToDiplomaId[tokenId] = diplomaId;

        emit DiplomaMinted(diplomaId, to, ipfsCid, fileHash);
    }

    function getDiplomaById(string memory diplomaId) external view returns (Diploma memory) {
        return diplomas[diplomaId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory diplomaId = tokenIdToDiplomaId[tokenId];
        Diploma memory diploma = diplomas[diplomaId];
        require(diploma.graduateWallet != address(0), "Metadata not found");

        return string(abi.encodePacked("ipfs://", diploma.ipfsCid));
    }
}
