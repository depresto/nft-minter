import "dotenv/config";
import { ethers } from "ethers";
import abi from "../data/abi.json";
import { BallerBananaNFT } from "../typechain";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ETHEREUM_URL
  );
  if (process.env.PRIVATE_KEYS && process.env.CONTRACT_ADDRESS) {
    const privateKeys = process.env.PRIVATE_KEYS.replace(/\s/g, "").split(",");
    await Promise.all(
      privateKeys.map(async (privateKey) => {
        if (process.env.CONTRACT_ADDRESS) {
          const wallet = new ethers.Wallet(privateKey, provider);
          const nftContract = new ethers.Contract(
            process.env.CONTRACT_ADDRESS,
            abi,
            wallet
          ) as BallerBananaNFT;

          console.log("NFT地址:", nftContract.address);
          const nftLocked = await nftContract.locked();
          console.log("NFT上鎖狀態:", nftLocked);

          if (nftLocked) {
            console.log("NFT已上鎖，無法mint");
            return;
          }

          console.log("minting NFT");
          const tx = await nftContract.mint(1);
          console.log("NFT mint 完成", tx.hash);
        }
      })
    );
  } else {
    console.log('請輸入錢包斯要以及合約地址')
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
