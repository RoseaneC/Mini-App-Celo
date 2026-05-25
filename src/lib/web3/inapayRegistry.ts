export const INAPAY_REGISTRY_ABI = [
  {
    type: "function",
    name: "recordPayment",
    stateMutability: "nonpayable",
    inputs: [
      { name: "receiver", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "paymentRef", type: "bytes32" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
] as const;
