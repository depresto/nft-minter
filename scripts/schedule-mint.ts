import "dotenv/config";
import schedule from "node-schedule";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ethers } from "ethers";
import abi from "../data/abi.json";
import { BallerBananaNFT } from "../typechain";

dayjs.extend(utc);
dayjs.extend(timezone);

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
    console.log("請輸入錢包斯要以及合約地址");
  }
}

if (process.env.SCHEDULED_TIME) {
  const date = dayjs(process.env.SCHEDULED_TIME);
  console.log("執行時間:", date.tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss"));

  const job = schedule.scheduleJob(date.toDate(), function () {
    main().catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
  });
} else {
  console.log("請輸入排成時間");
}
