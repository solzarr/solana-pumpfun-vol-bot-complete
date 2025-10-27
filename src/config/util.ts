import {
  Commitment,
  ComputeBudgetProgram,
  Connection,
  Finality,
  Keypair,
  PublicKey,
  SendTransactionError,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
  VersionedTransactionResponse,
} from "@solana/web3.js";
import { PriorityFee, TransactionResult } from "./types";
import dotenv from 'dotenv';

export const DEFAULT_COMMITMENT: Commitment = "confirmed";
export const DEFAULT_FINALITY: Finality = "finalized";

dotenv.config();

export const retrieveEnvVariable = (variableName: string) => {
  const variable = process.env[variableName] || '';
  if (!variable) {
    console.log(`${variableName} is not set`);
    process.exit(1);
  }
  return variable;
};

export const calculateWithSlippageBuy = (
  amount: bigint,
  basisPoints: bigint
) => {
  return amount + (amount * basisPoints) / 10000n;
};

export const calculateWithSlippageSell = (
  amount: bigint,
  basisPoints: bigint
) => {
  return amount - (amount * basisPoints) / 10000n;
};

// export async function sendTx(
//   connection: Connection,
//   tx: Transaction,
//   payer: PublicKey,
//   signers: Keypair[],
// ): Promise<TransactionResult> {
export async function sendTx(
  connection: Connection,
  tx: Transaction,
  payer: PublicKey,
  signers: Keypair[],
) {
  let newTx = new Transaction();

  const createIns = tx.instructions;

  newTx.add(...createIns);
  const blockhash = await connection.getLatestBlockhash();
  newTx.feePayer = payer;
  newTx.recentBlockhash = blockhash.blockhash;

  console.log("starting create token....")
  try {
    const sig = await connection.sendTransaction(newTx, signers, {
      skipPreflight: true,
      preflightCommitment: 'confirmed'
    });
    console.log("creat token => ", `https://solscan.io/tx/${sig}`);

    // return {
    //   confirmed: true,
    //   sig: sig,
    // };
  } catch (e) {
    if (e instanceof SendTransactionError) {
      let ste = e as SendTransactionError;
    } else {
      console.error(e);
    }
    // return {
    //   confirmed: false,
    //   sig: undefined
    // };
  }
}

export async function buildTx(
  connection: Connection,
  tx: Transaction,
  payer: PublicKey,
  signers: Keypair[],
  priorityFees?: PriorityFee,
  commitment: Commitment = DEFAULT_COMMITMENT,
  finality: Finality = DEFAULT_FINALITY
): Promise<VersionedTransaction> {
  // if (priorityFees) {
  //   const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
  //     units: priorityFees.unitLimit,
  //   });

  //   const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
  //     microLamports: priorityFees.unitPrice,
  //   });
  //   newTx.add(modifyComputeUnits);
  //   newTx.add(addPriorityFee);
  // }
  let versionedTx = await buildVersionedTx(connection, payer, tx, commitment);
  versionedTx.sign(signers);
  return versionedTx;
}

export const buildVersionedTx = async (
  connection: Connection,
  payer: PublicKey,
  tx: Transaction,
  commitment: Commitment = DEFAULT_COMMITMENT
): Promise<VersionedTransaction> => {
  const { blockhash } = await connection.getLatestBlockhash();

  let messageV0 = new TransactionMessage({
    instructions: tx.instructions,
    recentBlockhash: blockhash,
    payerKey: payer,
  }).compileToV0Message();

  return new VersionedTransaction(messageV0);
};

export const getTxDetails = async (
  connection: Connection,
  sig: string,
  commitment: Commitment = DEFAULT_COMMITMENT,
  finality: Finality = DEFAULT_COMMITMENT
): Promise<VersionedTransactionResponse | null> => {
  const latestBlockHash = await connection.getLatestBlockhash();
  const start_time = Date.now();
  await connection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: sig,
    },
    commitment
  );
  console.log("during confirmTransaction time => ", Date.now() - start_time)

  return connection.getTransaction(sig, {
    maxSupportedTransactionVersion: 0,
    commitment: finality,
  });
};

export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; // The maximum is inclusive, the minimum is inclusive
}

export const sleep = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}
