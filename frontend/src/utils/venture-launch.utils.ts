import {
  ACCOUNT_SIZE,
  createInitializeAccountInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import BN from 'bn.js';

export const USDC_MINT = new web3.PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
export const programId = new web3.PublicKey('B1Lmegd5rBAAZ4nBRN9ePeMcThLdEQ5ec3yfDZZJxnBY');

const CRYPTO_TRACKER_DATA_SIZE = 73;

export async function createWithdrawTx(
  connection: web3.Connection,
  programId: web3.PublicKey,
  payer: web3.PublicKey,
  receiveTokenAccount: web3.PublicKey,
  vaultTokenAccount: web3.PublicKey,
  cryptoTrackerAccount: web3.PublicKey,
  amount: number,
) {
  let tx = new web3.Transaction();

  const PDA = await web3.PublicKey.findProgramAddressSync(
    [Buffer.from('cryptotracker')],
    programId,
  )[0];

  tx.add(
    new web3.TransactionInstruction({
      keys: [
        // Caller
        {
          pubkey: payer,
          isSigner: true,
          isWritable: false,
        },
        // Receive token acc
        {
          pubkey: receiveTokenAccount,
          isSigner: false,
          isWritable: true,
        },
        // Vault acc
        {
          pubkey: vaultTokenAccount,
          isSigner: false,
          isWritable: true,
        },
        // CryptoTracker acc for state
        {
          pubkey: cryptoTrackerAccount,
          isSigner: false,
          isWritable: true,
        },
        // Token Program
        {
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
        // PDA Account
        {
          pubkey: PDA,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: programId,
      data: Buffer.from(Uint8Array.of(2, ...new BN(amount * 10 ** 6).toArray('le', 8))),
    }),
  );

  tx.feePayer = payer;
  const latestBlock = await connection.getLatestBlockhash('finalized');
  tx.recentBlockhash = latestBlock.blockhash;
  tx.lastValidBlockHeight = latestBlock.lastValidBlockHeight;
  return tx;
}

export async function createDepositTx(
  connection: web3.Connection,
  programId: web3.PublicKey,
  payer: web3.PublicKey,
  tokenAccount: web3.PublicKey,
  vaultTokenAccount: web3.PublicKey,
  cryptoTrackerAccount: web3.PublicKey,
  amount: number,
) {
  let tx = new web3.Transaction();

  // tx.add(web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
  tx.add(
    new web3.TransactionInstruction({
      keys: [
        // Initializer
        {
          pubkey: payer,
          isSigner: true,
          isWritable: false,
        },
        // Deposit token acc
        {
          pubkey: tokenAccount,
          isSigner: false,
          isWritable: true,
        },
        // Vault acc
        {
          pubkey: vaultTokenAccount,
          isSigner: false,
          isWritable: true,
        },
        // CryptoTracker acc for state
        {
          pubkey: cryptoTrackerAccount,
          isSigner: false,
          isWritable: true,
        },
        // Token Program
        {
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: programId,
      data: Buffer.from(Uint8Array.of(1, ...new BN(amount * 10 ** 6).toArray('le', 8))),
    }),
  );

  tx.feePayer = payer;
  const latestBlock = await connection.getLatestBlockhash('finalized');
  tx.recentBlockhash = latestBlock.blockhash;
  tx.lastValidBlockHeight = latestBlock.lastValidBlockHeight;
  return tx;
}

export async function createVaultTx(
  connection: web3.Connection,
  programId: web3.PublicKey,
  payer: web3.PublicKey,
  mint: web3.PublicKey,
) {
  let tx = new web3.Transaction();

  // Create token account that will be transfered to program
  let vaultTokenAccount = web3.Keypair.generate();
  tx.add(
    // create account
    web3.SystemProgram.createAccount({
      programId: TOKEN_PROGRAM_ID,
      space: ACCOUNT_SIZE,
      lamports: await connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE),
      fromPubkey: payer,
      newAccountPubkey: vaultTokenAccount.publicKey,
    }),
    // init token account
    createInitializeAccountInstruction(vaultTokenAccount.publicKey, mint, payer),
  );

  // Create data account (to store state) that will be transfered to program
  let cryptoTrackerAccount = web3.Keypair.generate();
  tx.add(
    // create account
    web3.SystemProgram.createAccount({
      programId: programId,
      space: CRYPTO_TRACKER_DATA_SIZE,
      lamports: await connection.getMinimumBalanceForRentExemption(CRYPTO_TRACKER_DATA_SIZE),
      fromPubkey: payer,
      newAccountPubkey: cryptoTrackerAccount.publicKey,
    }),
  );

  // tx.add(web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
  tx.add(
    new web3.TransactionInstruction({
      keys: [
        // Initializer
        {
          pubkey: payer,
          isSigner: true,
          isWritable: false,
        },
        // Vault acc
        {
          pubkey: vaultTokenAccount.publicKey,
          isSigner: false,
          isWritable: true,
        },
        // CryptoTracker acc for state
        {
          pubkey: cryptoTrackerAccount.publicKey,
          isSigner: false,
          isWritable: true,
        },
        // Rent
        {
          pubkey: web3.SYSVAR_RENT_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        // Token Program
        {
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
        // System program
        {
          pubkey: web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: programId,
      data: Buffer.from(
        Uint8Array.of(0), // new BN(terms.aliceExpectedAmount).toArray("le", 8))
      ),
    }),
  );

  tx.feePayer = payer;
  const latestBlock = await connection.getLatestBlockhash('finalized');
  tx.recentBlockhash = latestBlock.blockhash;
  tx.lastValidBlockHeight = latestBlock.lastValidBlockHeight;
  tx.partialSign(vaultTokenAccount);
  tx.partialSign(cryptoTrackerAccount);
  return [tx, vaultTokenAccount.publicKey, cryptoTrackerAccount.publicKey] as const;
}
