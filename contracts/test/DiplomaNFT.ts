import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.connect();
const { loadFixture } = networkHelpers;

describe("DiplomaNFT", () => {
  async function deployFixture() {
    const [owner, admin, graduate, attacker] = await ethers.getSigners();
    const DiplomaNFT = await ethers.getContractFactory("DiplomaNFT");
    const contract = await DiplomaNFT.deploy(admin.address);
    await contract.waitForDeployment();

    return { contract, owner, admin, graduate, attacker };
  }

  it("sets institution admin on deploy", async () => {
    const { contract, admin } = await loadFixture(deployFixture);
    expect(await contract.institutionAdmin()).to.equal(admin.address);
  });

  it("allows institution admin to mint and stores diploma data", async () => {
    const { contract, admin, graduate } = await loadFixture(deployFixture);

    const diplomaId = "DIP-001";
    const ipfsCid = "bafybeigdyrszipfsplaceholder";
    const fileHash = "0x" + "11".repeat(32);

    await expect(
      contract
        .connect(admin)
        .mintDiploma(
          graduate.address,
          diplomaId,
          ipfsCid,
          fileHash,
          "Alice",
          "Blockchain Engineering",
          "2024-10-01",
          "Universidad Web3"
        )
    )
      .to.emit(contract, "DiplomaMinted")
      .withArgs(diplomaId, graduate.address, ipfsCid, fileHash);

    const stored = await contract.getDiplomaById(diplomaId);
    expect(stored.graduateWallet).to.equal(graduate.address);
    expect(stored.ipfsCid).to.equal(ipfsCid);
    expect(stored.fileHash).to.equal(fileHash);

    const tokenUri = await contract.tokenURI(1);
    expect(tokenUri).to.equal(`ipfs://${ipfsCid}`);
  });

  it("reverts if non-admin tries to mint", async () => {
    const { contract, attacker, graduate } = await loadFixture(deployFixture);
    const diplomaId = "DIP-002";

    await expect(
      contract
        .connect(attacker)
        .mintDiploma(
          graduate.address,
          diplomaId,
          "bafybeihash",
          "0x" + "22".repeat(32),
          "Bob",
          "Security",
          "2024-09-15",
          "Universidad Web3"
        )
    ).to.be.revertedWith("Not institution admin");
  });

  it("prevents minting the same diplomaId twice", async () => {
    const { contract, admin, graduate } = await loadFixture(deployFixture);
    const diplomaId = "DIP-003";

    await contract
      .connect(admin)
      .mintDiploma(
        graduate.address,
        diplomaId,
        "bafybeicid",
        "0x" + "33".repeat(32),
        "Carol",
        "AI",
        "2024-06-30",
        "Universidad Web3"
      );

    await expect(
      contract
        .connect(admin)
        .mintDiploma(
          graduate.address,
          diplomaId,
          "bafybeicid2",
          "0x" + "44".repeat(32),
          "Carol",
          "AI",
          "2024-06-30",
          "Universidad Web3"
        )
    ).to.be.revertedWith("Diploma already minted");
  });
});
