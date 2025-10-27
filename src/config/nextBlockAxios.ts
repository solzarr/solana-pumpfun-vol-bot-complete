import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { COMMITMENT_LEVEL, Finalized, NEXT_BLOCK_API, NEXT_BLOCK_FEE } from "./constants";
import { solanaConnection } from "./jitoWithAxios";
import { getTxDetails, sleep } from "./util";
import base58 from "bs58";

interface Payload {
    transaction: TransactionMessages;
}

interface TransactionMessages {
    content: string;
}

export const nextBlockSendTransaction = async (transaction: Transaction, payer: Keypair) => {
    let confirmed = false;
    await sleep(250);

    while (!confirmed) {
        const newTx = new Transaction();

        const buyTxs = transaction.instructions;

        newTx.add(...buyTxs);

        // Get latest blockhash
        await solanaConnection.getLatestBlockhash()
            .then(ele => {
                const { blockhash } = ele

                console.log('Starting Next Block transaction execution...');
                const next_block_addrs = [
                    'NextbLoCkVtMGcV47JzewQdvBpLqT9TxQFozQkN98pE',
                    'NexTbLoCkWykbLuB1NkjXgFWkX9oAtcoagQegygXXA2',
                    'NeXTBLoCKs9F1y5PJS9CKrFNNLU1keHW71rfh7KgA1X',
                    'NexTBLockJYZ7QD7p2byrUa6df8ndV2WSd8GkbWqfbb',
                    'neXtBLock1LeC67jYd1QdAa32kbVeubsfPNTJC1V5At',
                    'nEXTBLockYgngeRmRrjDV31mGSekVPqZoMGhQEZtPVG',
                    'NEXTbLoCkB51HpLBLojQfpyVAMorm3zzKg7w9NFdqid',
                    'nextBLoCkPMgmG8ZgJtABeScP35qLa2AMCNKntAP7Xc'
                ]
                // NextBlock Instruction
                const recipientPublicKey = new PublicKey(next_block_addrs[Math.floor(next_block_addrs.length * Math.random())]);
                const transferInstruction = SystemProgram.transfer({
                    fromPubkey: payer.publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: NEXT_BLOCK_FEE * LAMPORTS_PER_SOL
                });

                newTx.add(transferInstruction);
                // Set recent blockhash
                newTx.recentBlockhash = blockhash;

                newTx.sign(payer)

                const txSignature = base58.encode(newTx.signature!)

                const tx64Str = newTx.serialize().toString('base64');
                const payload: Payload = {
                    transaction: {
                        content: tx64Str
                    }
                };

                try {
                    // const response = fetch('https://fra.nextblock.io/api/v2/submit', {
                    //     method: 'POST',
                    //     headers: {
                    //         'Content-Type': 'application/json',
                    //         'authorization': NEXT_BLOCK_API // Insert your authorization token here
                    //     },
                    //     body: JSON.stringify(payload)
                    // });
                    fetch('https://ny.nextblock.io/api/v2/submit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': NEXT_BLOCK_API // Insert your authorization token here
                        },
                        body: JSON.stringify(payload)
                    })
                        .then(response => {
                            console.log("🚀 ~ nextBlockSendTransaction ~ response:", response.ok)
                            if (response.ok) {
                                return getTxDetails(solanaConnection, txSignature, COMMITMENT_LEVEL, Finalized)
                                    .then(txResult => {
                                        console.log("nextblock =================")
                                        if (txResult && !txResult.meta?.err) {
                                            console.log("nextblock => ", `https://solscan.io/tx/${txSignature}`);
                                            confirmed = true;
                                        }
                                    })
                                    .catch(error => {
                                        console.log("get transaction error nextblockSendTransaction2:", error);
                                    });
                            } else {
                                console.error("Failed to send transaction:", response.status);
                            }
                        })
                        .catch(error => {
                            console.error("Error in nextblockSendTransaction2:", error);
                        });
                } catch (error) {
                    console.error("Error sending transaction:", error);
                }
            })
            .catch(error => {
                console.error("Error in nextblockSendTransaction1:", error);
            });

        await sleep(200);
    }
}