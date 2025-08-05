"use client";

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, arbitrum } from "@reown/appkit/networks";

const projectId = "599ec44abcc17536b34c4cf9572a4ddc";

const metadata = {
  name: "SLERFEARN",
  description: "The Web3 rewards app powered by Boomchainlab and $SLERF",
  url: "https://slerfearn.boomchainlab.com", // ✅ Must match custom domain
  icons: ["https://slerfearn.boomchainlab.com/icon.svg"], // ✅ Must be HTTPS
};

createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: [base,mainnet, arbitrum],
  projectId,
  features: {
    analytics: true,
  },
});
