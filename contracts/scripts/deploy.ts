import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  const [deployer] = await ethers.getSigners();
  const institutionAdmin = process.env.INSTITUTION_ADMIN_ADDRESS ?? deployer.address;

  console.log("Deployer:", deployer.address);
  console.log("Institution admin:", institutionAdmin);

  const DiplomaNFT = await ethers.getContractFactory("DiplomaNFT");
  const diplomaNFT = await DiplomaNFT.deploy(institutionAdmin);
  await diplomaNFT.waitForDeployment();

  const address = await diplomaNFT.getAddress();
  console.log("DiplomaNFT deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
