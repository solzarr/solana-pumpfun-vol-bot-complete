import {
    Connection, TransactionInstruction,
    Keypair, TransactionMessage, VersionedTransaction,
    ComputeBudgetProgram,
    SystemProgram,
    LAMPORTS_PER_SOL,
    PublicKey,
} from '@solana/web3.js';

import bs58 from 'bs58';
import { saveDataToFile, Data, deleteJson, readJson, sleep } from './utils';
import { execute } from './execute';
import { DISTRIBUTE_AMOUNT } from './constants';
const transactions: VersionedTransaction[] = [];

const allKp: Keypair[] = [];
export const distributeSol = async (connection: Connection, mainKp: Keypair, distritbutionNum: number) => {
    try {
        const mainSolBal = await connection.getBalance(mainKp.publicKey)
        console.log("🚀 ~ distributeSol ~ mainSolBal:", mainSolBal)
        const data: Data[] = []
        const wallets = []
        const latestBlockhash = await connection.getLatestBlockhash()
        const sendSolTx: TransactionInstruction[] = []

        let dis_wallets: Data[];
        dis_wallets = readJson();
        sendSolTx.push(
            ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 250_000 }),
        );

        if (mainSolBal <= 4 * 10 ** 6) {
            console.log("Main wallet balance is not enough")
            return []
        }

        let solAmount = DISTRIBUTE_AMOUNT * LAMPORTS_PER_SOL;

        if (dis_wallets.length == 0) {
            for (let i = 0; i < distritbutionNum; i++) {
                const wallet = Keypair.generate()
                allKp.push(wallet)
                wallets.push({ kp: wallet, buyAmount: solAmount })
                sendSolTx.push(
                    SystemProgram.transfer({
                        fromPubkey: mainKp.publicKey,
                        toPubkey: wallet.publicKey,
                        lamports: solAmount,
                    })
                )
            }
        } else if (dis_wallets.length < distritbutionNum && dis_wallets.length > 0) {
            for (let i = 0; i < distritbutionNum - dis_wallets.length; i++) {
                const wallet = Keypair.generate()
                allKp.push(wallet)
                wallets.push({ kp: wallet, buyAmount: solAmount })
                sendSolTx.push(
                    SystemProgram.transfer({
                        fromPubkey: mainKp.publicKey,
                        toPubkey: wallet.publicKey,
                        lamports: solAmount
                    })
                )
            }
        } else if (dis_wallets.length == distritbutionNum) {
            for (let i = 0; i < distritbutionNum; i++) {
                sendSolTx.push(
                    SystemProgram.transfer({
                        fromPubkey: mainKp.publicKey,
                        toPubkey: new PublicKey(dis_wallets[i].pubkey),
                        lamports: solAmount
                    })
                )
            }
        }

        console.log("sendSolTx >> ", sendSolTx);
        wallets.map((wallet) => {
            data.push({
                privateKey: bs58.encode(wallet.kp.secretKey),
                pubkey: wallet.kp.publicKey.toBase58(),
            })
        })

        try {
            saveDataToFile(data)
        } catch (error) {

        }


        console.log("======================================")
        const msg = new TransactionMessage({
            payerKey: mainKp.publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: sendSolTx
        }).compileToV0Message()

        const tx = new VersionedTransaction(msg)

        console.log(await connection.simulateTransaction(tx))
        tx.sign([mainKp])

        console.log("===============simulate==============")
        console.log(await connection.simulateTransaction(tx))
        transactions.push(tx);
        let distributeSignature = await execute(tx, 1);
        console.log("🚀 ~ distributeSol ~ distributeSignature:", distributeSignature)
        if (distributeSignature) {
            console.log("Distribute Signature: ", distributeSignature);
            return true;
        } else {
            console.log("error");
            deleteJson();
        }
    } catch (error) {
        console.log(`Failed to transfer SOL`)
        return null
    }
}