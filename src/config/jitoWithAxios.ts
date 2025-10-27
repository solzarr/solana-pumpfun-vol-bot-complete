import { Commitment, Connection, Finality, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import base58 from "bs58";
import axios, { AxiosError } from "axios";
import { COMMITMENT_LEVEL, Finalized, JITO_FEE, RPC_ENDPOINT, RPC_WEBSOCKET_ENDPOINT } from "./constants";
import { buildTx, DEFAULT_COMMITMENT, DEFAULT_FINALITY, getTxDetails, sleep } from "./util";
import { PriorityFee } from "./types";

export const solanaConnection = new Connection(RPC_ENDPOINT, {
  wsEndpoint: RPC_WEBSOCKET_ENDPOINT,
})


export const jitoWithAxios = async (transaction: VersionedTransaction, payer: Keypair) => {

  console.log('Starting Jito transaction execution...');
  const tipAccounts = [
    'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
    'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
    '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
    '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
    'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
    'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
    'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
    'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
  ];
  const jitoFeeWallet = new PublicKey(tipAccounts[Math.floor(tipAccounts.length * Math.random())])

  console.log(`Selected Jito fee wallet: ${jitoFeeWallet.toBase58()}`);

  try {
    console.log(`Calculated fee: ${JITO_FEE / LAMPORTS_PER_SOL} sol`);
    let latestBlockhash = await solanaConnection.getLatestBlockhash();
    const jitTipTxFeeMessage = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: [
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: jitoFeeWallet,
          lamports: JITO_FEE,
        }),
      ],
    }).compileToV0Message();

    const jitoFeeTx = new VersionedTransaction(jitTipTxFeeMessage);
    jitoFeeTx.sign([payer]);

    // console.log(await solanaConnection.simulateTransaction(transaction, undefined))
    // const simulation = await solanaConnection.simulateTransaction(transaction, undefined)
    // if (simulation.value.err) {
    //   console.error("Transaction simulation error:", simulation.value.err)
    //   throw new Error("Transaction simulation failed")
    // }

    const jitoTxsignature = base58.encode(jitoFeeTx.signatures[0]);
    const txSignature = base58.encode(transaction.signatures[0]);

    // Serialize the transactions once here
    const serializedjitoFeeTx = base58.encode(jitoFeeTx.serialize());
    const serializedTransactions = [serializedjitoFeeTx];
    const serializedTransaction = base58.encode(transaction.serialize());
    serializedTransactions.push(serializedTransaction);

    const endpoints = [
      // 'https://mainnet.block-engine.jito.wtf/api/v1/bundles',
      // 'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/bundles',
      // 'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/bundles',
      'https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles',
      // 'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/bundles',
    ];

    const requests = endpoints.map((url) =>
      axios.post(url, {
        jsonrpc: '2.0',
        id: 1,
        method: 'sendBundle',
        params: [serializedTransactions],
      })
    );
    console.log('Sending transactions to endpoints...');

    const results = await Promise.all(requests.map((p) => p.catch((e) => e)));
    console.log("🚀 ~ jitoWithAxios ~ results:", results)

    const successfulResults = results.filter((result) => !(result instanceof Error));

    if (successfulResults.length > 0) {
      console.log(`Successful response`);
      console.log(`Confirming jito transaction...`);

      let txResult = await getTxDetails(solanaConnection, jitoTxsignature, COMMITMENT_LEVEL, Finalized);
      console.log("🚀 ~ jitoCreatTansaction ~ txResult:", txResult)
      if (txResult && !txResult.meta?.err) {
        console.log("create token => ", `https://solscan.io/tx/${jitoTxsignature}`);
      }
    } else {
      console.log(`No successful responses received for jito`);
      return
    }
  } catch (error) {

    if (error instanceof AxiosError) {
      console.log('Failed to execute jito transaction');
    }
    console.log('Error during transaction execution', error);
    return { confirmed: false, sig: undefined, error };
  }
}

export const jitoCreatTansaction = async (transaction: Transaction, payer: PublicKey, signers: Keypair[]) => {
  let txSignature = "";

  const newTx = new Transaction();

  const buyTxs = transaction.instructions;

  newTx.add(...buyTxs);

  console.log('Starting Jito Create transaction execution...');
  const tipAccounts = [
    'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
    'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
    '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
    '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
    'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
    'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
    'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
    'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
  ];
  const jitoFeeWallet = new PublicKey(tipAccounts[Math.floor(tipAccounts.length * Math.random())])

  console.log(`Selected Jito fee wallet: ${jitoFeeWallet.toBase58()}`);

  // Add tip payment to the transaction
  newTx.add(
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: jitoFeeWallet,
      lamports: JITO_FEE,
    })
  );

  try {
    console.log(`Calculated fee: ${JITO_FEE / LAMPORTS_PER_SOL} sol`);
    // Get latest blockhash
    const { blockhash } = await solanaConnection.getLatestBlockhash();
    // Set recent blockhash
    newTx.recentBlockhash = blockhash;
    newTx.feePayer = payer;

    // Sign newTx (embeds the first signature)
    newTx.sign(...signers);

    // Verify all required signatures are present
    const message = newTx.compileMessage();
    const missingSignatures = message.accountKeys
      .filter((pubkey, index) => {
        return message.isAccountSigner(index) && !newTx.signatures[index];
      })
      .map(pubkey => pubkey.toBase58());

    if (missingSignatures.length > 0) {
      throw new Error(`Missing signatures for: ${missingSignatures.join(', ')}`);
    }

    // Get signature in Base58 (for tracking/confirmation)
    txSignature = base58.encode(newTx.signature!);

    // console.log(await solanaConnection.simulateTransaction(newTx, undefined))
    // const simulation = await solanaConnection.simulateTransaction(newTx, undefined)
    // if (simulation.value.err) {
    //   console.error("Transaction simulation error:", simulation.value.err)
    //   throw new Error("Transaction simulation failed")
    // }

    // Serialize the transactions once here
    const serializedjitoTx = base58.encode(newTx.serialize());
    const serializedTransactions = [serializedjitoTx];

    const endpoints = [
      // 'https://mainnet.block-engine.jito.wtf/api/v1/transactions',
      // 'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/transactions',
      // 'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/transactions',
      'https://ny.mainnet.block-engine.jito.wtf/api/v1/transactions',
      // 'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/transactions',
    ];

    const requests = endpoints.map((url) =>
      axios.post(url, {
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: serializedTransactions,
      })
    );
    console.log('Sending transactions to endpoints...');
    const results = await Promise.all(requests.map((p) => p.catch((e) => e)));
    const successfulResults = results.filter((result) => !(result instanceof Error));

    if (successfulResults.length > 0) {
      console.log(`Successful response`);

      let txResult = await getTxDetails(solanaConnection, txSignature, COMMITMENT_LEVEL, Finalized);
      console.log("🚀 ~ jitoCreatTansaction ~ txResult:", txResult)
      if (txResult && !txResult?.meta?.err) {
        console.log("create token => ", `https://solscan.io/tx/${txSignature}`);
      }
    } else {
      console.log(`No successful responses received for jito`);
      return
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Failed to execute jito transaction');
      return
    }
    console.log('Error during transaction execution', error);
    return
  }
}

export const jitoSendTransaction = async (transaction: Transaction, payer: Keypair) => {
  let confirmed = false;
  await sleep(300)

  while (!confirmed) {
    const newTx = new Transaction();

    const buyTxs = transaction.instructions;

    console.log('Starting Jito transaction execution...');
    const tipAccounts = [
      'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
      'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
      '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
      '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
      'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
      'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
      'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
      'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
    ];
    const jitoFeeWallet = new PublicKey(tipAccounts[Math.floor(tipAccounts.length * Math.random())])

    console.log(`Selected Jito fee wallet: ${jitoFeeWallet.toBase58()}`);

    // Add tip payment to the transaction
    newTx.add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: jitoFeeWallet,
        lamports: JITO_FEE,
      })
    );

    newTx.add(...buyTxs);

    console.log(`Calculated fee: ${JITO_FEE / LAMPORTS_PER_SOL} sol`);
    // Get latest blockhash
    // const { blockhash } = await solanaConnection.getLatestBlockhash();
    solanaConnection.getLatestBlockhash()
      .then(ele => {
        const { blockhash } = ele;

        // Set recent blockhash
        newTx.recentBlockhash = blockhash;
        newTx.feePayer = payer.publicKey;

        // Combine all required signers
        const allSigners = [payer];

        // Sign newTx (embeds the first signature)
        newTx.sign(...allSigners);

        // Verify all required signatures are present
        const message = newTx.compileMessage();
        const missingSignatures = message.accountKeys
          .filter((pubkey, index) => {
            return message.isAccountSigner(index) && !newTx.signatures[index];
          })
          .map(pubkey => pubkey.toBase58());

        if (missingSignatures.length > 0) {
          throw new Error(`Missing signatures for: ${missingSignatures.join(', ')}`);
        }

        // Get signature in Base58 (for tracking/confirmation)
        const txSignature = base58.encode(newTx.signature!);

        // Serialize the transactions once here
        const serializedjitoFeeTx = base58.encode(newTx.serialize());
        console.log("🚀 ~ jitoSendTransaction ~ serializedjitoFeeTx:", serializedjitoFeeTx)
        const serializedTransactions = [serializedjitoFeeTx];

        try {
          const endpoints = [
            // 'https://mainnet.block-engine.jito.wtf/api/v1/transactions',
            // 'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/transactions',
            // 'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/transactions',
            'https://ny.mainnet.block-engine.jito.wtf/api/v1/transactions',
            // 'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/transactions',
          ];

          const requests = endpoints.map((url) =>
            axios.post(url, {
              jsonrpc: '2.0',
              id: 1,
              method: 'sendTransaction',
              params: serializedTransactions,
            })
          );
          console.log('Sending transactions to endpoints...');
          Promise.all(requests.map((p) => p.catch((e) => e)))
            .then(results => {
              const successfulResults = results.filter((result) => !(result instanceof Error));

              if (successfulResults.length > 0) {
                console.log(`Successful response`);
                console.log(`Confirming jito send transaction...`);

                getTxDetails(solanaConnection, txSignature, COMMITMENT_LEVEL, Finalized).then(txResult => {
                  console.log("jitosend ==============")
                  if (txResult && txResult.meta?.err) {
                    console.log("jito => ", `https://solscan.io/tx/${txSignature}`)
                    confirmed = true;
                  }
                });
              } else {
                console.log(`No successful responses received for jito`);
              }
            })
            .catch(error => {
              console.error("Error in jitoSendTransaction2:", error);
            });
        } catch (error) {
          if (error instanceof AxiosError) {
            console.log('Failed to execute jito transaction');
          }
          console.log('Error during transaction execution', error);
        }
      })
      .catch(error => {
        console.error("Error in jitoSendTransaction1:", error);
      });
    await sleep(1000)
  }
}




