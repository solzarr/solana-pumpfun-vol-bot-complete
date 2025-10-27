import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { COMMITMENT_LEVEL, Finalized, NOZOMI_API, NOZOMI_FEE } from "./constants";
import axios from "axios";
import base58 from "bs58";
import { solanaConnection } from "./jitoWithAxios";
import { getTxDetails, sleep } from "./util";

export const nozomiSendTransaction = async (transaction: Transaction, payer: Keypair) => {
    let confirmed = false;
    await sleep(200)

    while (!confirmed) {
        const newTx = new Transaction();

        const buyTxs = transaction.instructions;

        newTx.add(...buyTxs);

        // let { blockhash, lastValidBlockHeight } = await solanaConnection.getLatestBlockhash();
        solanaConnection.getLatestBlockhash()
            .then(ele => {
                const { blockhash, lastValidBlockHeight } = ele;

                console.log('Starting Jito transaction execution...');
                const NOZOMI_addrs = [
                    "TEMPaMeCRFAS9EKF53Jd6KpHxgL47uWLcpFArU1Fanq",
                    "noz3jAjPiHuBPqiSPkkugaJDkJscPuRhYnSpbi8UvC4",
                    "noz3str9KXfpKknefHji8L1mPgimezaiUyCHYMDv1GE",
                    "noz6uoYCDijhu1V7cutCpwxNiSovEwLdRHPwmgCGDNo",
                    "noz9EPNcT7WH6Sou3sr3GGjHQYVkN3DNirpbvDkv9YJ",
                    "nozc5yT15LazbLTFVZzoNZCwjh3yUtW86LoUyqsBu4L",
                    "nozFrhfnNGoyqwVuwPAW4aaGqempx4PU6g6D9CJMv7Z",
                    "nozievPk7HyK1Rqy1MPJwVQ7qQg2QoJGyP71oeDwbsu",
                    "noznbgwYnBLDHu8wcQVCEw6kDrXkPdKkydGJGNXGvL7",
                    "nozNVWs5N8mgzuD3qigrCG2UoKxZttxzZ85pvAQVrbP",
                    "nozpEGbwx4BcGp6pvEdAh1JoC2CQGZdU6HbNP1v2p6P",
                    "nozrhjhkCr3zXT3BiT4WCodYCUFeQvcdUkM7MqhKqge",
                    "nozrwQtWhEdrA6W8dkbt9gnUaMs52PdAv5byipnadq3",
                    "nozUacTVWub3cL4mJmGCYjKZTnE9RbdY5AP46iQgbPJ",
                    "nozWCyTPppJjRuw2fpzDhhWbW355fzosWSzrrMYB1Qk",
                    "nozWNju6dY353eMkMqURqwQEoM3SFgEKC6psLCSfUne",
                    "nozxNBgWohjR75vdspfxR5H9ceC7XXH99xpxhVGt3Bb"
                ]
                // Nozomi Instruction
                const recipientPublicKey = new PublicKey(NOZOMI_addrs[Math.floor(NOZOMI_addrs.length * Math.random())]);
                const transferInstruction = SystemProgram.transfer({
                    fromPubkey: payer.publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: NOZOMI_FEE * LAMPORTS_PER_SOL
                });

                newTx.add(transferInstruction);
                newTx.recentBlockhash = blockhash;
                newTx.lastValidBlockHeight = lastValidBlockHeight

                newTx.sign(payer)

                // Get signature in Base58 (for tracking/confirmation)
                const txSignature = base58.encode(newTx.signature!);
                console.log("🚀 ~ nozomiSendTransaction ~ txSignature:", txSignature)

                const tx64Str = Buffer.from(newTx.serialize()).toString('base64');

                try {
                    const endpoints = [
                        `https://ams1.secure.nozomi.temporal.xyz/?c=${NOZOMI_API}`,
                        // `https://ewr1.secure.nozomi.temporal.xyz/?c=${NOZOMI_API}`,
                        // `https://pit1.secure.nozomi.temporal.xyz/?c=${NOZOMI_API}`,
                        // `https://fra1.secure.nozomi.temporal.xyz/?c=${NOZOMI_API}`,
                    ];

                    const requests = endpoints.map((url) =>
                        axios.post(url, {
                            jsonrpc: '2.0',
                            id: 1,
                            method: 'sendTransaction',
                            params: [
                                tx64Str,
                                { "encoding": "base64" }
                            ],
                        })
                    );

                    console.log('Sending transactions to endpoints...');
                    // const results = await Promise.all(requests.map((p) => p.catch((e) => e)));
                    Promise.all(requests.map((p) => p.catch((e) => e)))
                        .then(results => {
                            const successfulResults = results.filter((result) => !(result instanceof Error));

                            if (successfulResults.length > 0) {
                                console.log(`Successful response`);
                                console.log(`Confirming nozomi transaction...`);

                                // let txResult = await getTxDetails(solanaConnection, txSignature, COMMITMENT_LEVEL, Finalized);
                                getTxDetails(solanaConnection, txSignature, COMMITMENT_LEVEL, Finalized).then(txResult => {
                                    console.log("nozomi ==========")
                                    if (txResult && !txResult.meta?.err) {
                                        console.log("nozomi => ", `https://solscan.io/tx/${txSignature}`)
                                        confirmed = true;
                                    }
                                });
                            } else {
                                console.log(`No successful responses received for jito`);
                            }
                        })
                        .catch(error => {
                            console.error("Error in nozomiSendTransaction2:", error);
                        });
                } catch (error) {
                    console.error("Error sending transaction:", error);
                }
            })
            .catch(error => {
                console.error("Error in nozomiSendTransaction1:", error);
            });
        await sleep(200)
    }
}