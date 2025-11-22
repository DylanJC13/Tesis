import { Abi } from "viem";

export const diplomaNftAbi: Abi = [
  {
    type: "constructor",
    inputs: [{ name: "initialAdmin", type: "address", internalType: "address" }],
    stateMutability: "nonpayable"
  },
  {
    type: "event",
    name: "DiplomaMinted",
    inputs: [
      { name: "diplomaId", type: "string", indexed: false },
      { name: "to", type: "address", indexed: true, internalType: "address" },
      { name: "ipfsCid", type: "string", indexed: false },
      { name: "fileHash", type: "bytes32", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
      { indexed: true, internalType: "address", name: "newOwner", type: "address" }
    ],
    anonymous: false
  },
  {
    type: "function",
    stateMutability: "view",
    name: "institutionAdmin",
    inputs: [],
    outputs: [{ name: "", internalType: "address", type: "address" }]
  },
  {
    type: "function",
    stateMutability: "view",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", internalType: "address", type: "address" }]
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "setInstitutionAdmin",
    inputs: [{ name: "newAdmin", internalType: "address", type: "address" }],
    outputs: []
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    outputs: []
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "renounceOwnership",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    stateMutability: "view",
    name: "tokenURI",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    outputs: [{ name: "", internalType: "string", type: "string" }]
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getDiplomaById",
    inputs: [{ name: "diplomaId", internalType: "string", type: "string" }],
    outputs: [
      {
        components: [
          { name: "diplomaId", internalType: "string", type: "string" },
          { name: "graduateWallet", internalType: "address", type: "address" },
          { name: "fileHash", internalType: "bytes32", type: "bytes32" },
          { name: "ipfsCid", internalType: "string", type: "string" },
          { name: "nombreEstudiante", internalType: "string", type: "string" },
          { name: "programa", internalType: "string", type: "string" },
          { name: "fechaGrado", internalType: "string", type: "string" },
          { name: "nombreInstitucion", internalType: "string", type: "string" }
        ],
        internalType: "struct DiplomaNFT.Diploma",
        name: "",
        type: "tuple"
      }
    ]
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "mintDiploma",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "diplomaId", internalType: "string", type: "string" },
      { name: "ipfsCid", internalType: "string", type: "string" },
      { name: "fileHash", internalType: "bytes32", type: "bytes32" },
      { name: "nombreEstudiante", internalType: "string", type: "string" },
      { name: "programa", internalType: "string", type: "string" },
      { name: "fechaGrado", internalType: "string", type: "string" },
      { name: "nombreInstitucion", internalType: "string", type: "string" }
    ],
    outputs: []
  }
];

export type DiplomaStruct = {
  diplomaId: string;
  graduateWallet: `0x${string}`;
  fileHash: `0x${string}`;
  ipfsCid: string;
  nombreEstudiante: string;
  programa: string;
  fechaGrado: string;
  nombreInstitucion: string;
};

export const diplomaContractAddress =
  (process.env.NEXT_PUBLIC_DIPLOMA_NFT_ADDRESS as `0x${string}` | undefined) || undefined;

export const explorerTxUrl = (hash: string) => `https://amoy.polygonscan.com/tx/${hash}`;
export const ipfsGatewayUrl = (cid: string) => `https://ipfs.io/ipfs/${cid}`;

export const deployFromBlock =
  process.env.NEXT_PUBLIC_DEPLOY_BLOCK && process.env.NEXT_PUBLIC_DEPLOY_BLOCK !== "0"
    ? BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK)
    : 0n;
