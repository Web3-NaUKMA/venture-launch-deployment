import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import { Project } from '../types/project.types';
import axios, { HttpStatusCode } from 'axios';

const toBytesArray = (string: string) => new TextEncoder().encode(string);

const createDataForProgram = (metadataUrl: string, nftName: string) => {
  return Buffer.from(
    Uint8Array.of(
      0,
      ...[].slice.call(toBytesArray(metadataUrl)),
      ...[].slice.call(toBytesArray(',')),
      ...[].slice.call(toBytesArray(nftName)),
    ),
  );
};

export const createNftTransaction = async (
  connection: web3.Connection,
  programId: web3.PublicKey,
  payer: web3.PublicKey,
  metadataUrl: string,
  nftName: string,
) => {
  const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    import.meta.env.VITE_TOKEN_METADATA_PROGRAM_ID,
  );
  // Mint account
  const mintKeypair: web3.Keypair = web3.Keypair.generate();
  console.log(`New token mint addr: ${mintKeypair.publicKey}`);

  // Associated token address
  const tokenAddress = await getAssociatedTokenAddress(mintKeypair.publicKey, payer);

  // Derive the metadata and master edition addresses
  const metadataAddress = (
    await web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
  console.log(`Metadata initialized, metadataAddress: ${metadataAddress}`);

  // Master Edition
  const masterEditionAddress = (
    await web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
        Buffer.from('edition'),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
  console.log(`Master edition metadata initialized, masterEditionAddress: ${masterEditionAddress}`);

  // Transact with the "mint" function in our on-chain program
  const transaction = new web3.Transaction();
  transaction.add(web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
  transaction.add(
    new web3.TransactionInstruction({
      keys: [
        // Mint Authority
        {
          pubkey: payer,
          isSigner: true,
          isWritable: false,
        },
        // Mint
        {
          pubkey: mintKeypair.publicKey,
          isSigner: true,
          isWritable: true,
        },
        // Metadata
        {
          pubkey: metadataAddress,
          isSigner: false,
          isWritable: true,
        },
        // Master Edition
        {
          pubkey: masterEditionAddress,
          isSigner: false,
          isWritable: true,
        },
        // Token Account
        {
          pubkey: tokenAddress,
          isSigner: false,
          isWritable: true,
        },
        // Rent
        {
          pubkey: web3.SYSVAR_RENT_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        // System program
        {
          pubkey: web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
        // Token Program
        {
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
        // Associated token program
        {
          pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
        // Token metadata program
        {
          pubkey: TOKEN_METADATA_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: programId,
      data: createDataForProgram(metadataUrl, nftName),
    }),
  );
  transaction.feePayer = payer;
  const latestBlock = await connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = latestBlock.blockhash;
  transaction.lastValidBlockHeight = latestBlock.lastValidBlockHeight;
  transaction.partialSign(mintKeypair);
  return transaction;
};

export const getIPFSUrlForProject = async (project: Project) => {
  const response = await axios.post(`projects/ipfs-url`, project);
  if (response.status === HttpStatusCode.Created) {
    return response.data.ipfsURL;
  }
};
