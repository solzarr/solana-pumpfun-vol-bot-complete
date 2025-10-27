import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { COMMITMENT_LEVEL, Finalized, ZERO_SLOT_API, ZERO_SLOT_FEE } from "./constants";
import { solanaConnection } from "./jitoWithAxios";
import { buildVersionedTx, getTxDetails, sleep } from "./util";

export const zeroSlotSendTransaction = async (transaction: Transaction, payer: Keypair) => {
    const connectionForSend = new Connection(`https://ny.0slot.trade?api-key=${ZERO_SLOT_API}`, 'confirmed');
    let confirmed = false;
    await sleep(250);

    while (!confirmed) {
        const newTx = new Transaction();
        const buyIns = transaction.instructions;
        newTx.add(...buyIns);

        // Get latest blockhash
        solanaConnection.getLatestBlockhash()
            .then(({ blockhash }) => {
                console.log('Starting Zero Slot transaction execution...');
                const zero_slot_addrs = [
                    'DiTmWENJsHQdawVUUKnUXkconcpW4Jv52TnMWhkncF6t',
                    'HRyRhQ86t3H4aAtgvHVpUJmw64BDrb61gRiKcdKUXs5c',
                    '7y4whZmw388w1ggjToDLSBLv47drw5SUXcLk6jtmwixd',
                    'J9BMEWFbCBEjtQ1fG5Lo9kouX1HfrKQxeUxetwXrifBw',
                    '8U1JPQh3mVQ4F5jwRdFTBzvNRQaYFQppHQYoH38DJGSQ',
                    'Eb2KpSC8uMt9GmzyAEm5Eb1AAAgTjRaXWFjKyFXHZxF3',
                    'FCjUJZ1qozm1e8romw216qyfQMaaWKxWsuySnumVCCNe',
                    'ENxTEjSQ1YabmUpXAdCgevnHQ9MHdLv8tzFiuiYJqa13',
                    '6rYLG55Q9RpsPGvqdPNJs4z5WTxJVatMB8zV3WJhs5EK',
                    'Cix2bHfqPcKcM233mzxbLk14kSggUUiz2A87fJtGivXr',
                ];

                // Zero Slot Instruction
                const recipientPublicKey = new PublicKey(zero_slot_addrs[Math.floor(zero_slot_addrs.length * Math.random())]);
                const transferInstruction = SystemProgram.transfer({
                    fromPubkey: payer.publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: ZERO_SLOT_FEE * LAMPORTS_PER_SOL
                });

                newTx.add(transferInstruction);
                newTx.recentBlockhash = blockhash;
                newTx.sign(payer);

                buildVersionedTx(solanaConnection, payer.publicKey, newTx, "confirmed")
                    .then(versionedBuyTx => {
                        versionedBuyTx.sign([payer]);
                        connectionForSend.sendRawTransaction(versionedBuyTx.serialize())
                            .then(txSignature => {
                                if (txSignature) {
                                    return getTxDetails(solanaConnection, txSignature, COMMITMENT_LEVEL, Finalized)
                                        .then(txResult => {
                                            console.log("zeroslot =================")
                                            if (txResult && !txResult.meta?.err) {
                                                console.log("zeroslot => ", `https://solscan.io/tx/${txSignature}`);
                                                confirmed = true;
                                            }
                                        })
                                        .catch(error => {
                                            console.log("get transaction error zeroSlotSendTransaction2:", error);
                                        });
                                }
                            })
                            .catch(error => {
                                console.error("Error in zeroSlotSendTransaction2:", error);
                            });
                    })
                    .catch(error => {
                        console.error("Error in zeroSlotSendTransaction1:", error);
                    });
            })
            .catch(error => {
                console.error("Error in zeroSlotSendTransaction1:", error);
            });
        await sleep(200);
    };
};