import base58 from "bs58"
import { readJson, sleep } from "./src/utils"
import {
    ComputeBudgetProgram,
    Connection, Keypair,
    SystemProgram, Transaction,
    TransactionInstruction, PublicKey,
    sendAndConfirmTransaction
} from "@solana/web3.js"
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { getSellTx } from "./src/getSellTx";
import { execute } from "./src/execute";
import { RPC_ENDPOINT, RPC_WEBSOCKET_ENDPOINT, BASEMINT, PRIVATE_KEY } from "./src/constants";

export const solanaConnection = new Connection(RPC_ENDPOINT, {
    wsEndpoint: RPC_WEBSOCKET_ENDPOINT, commitment: "processed"
})

const connection = new Connection(RPC_ENDPOINT, { commitment: "processed" });

const main = async () => {
    const walletsData = readJson()
    const wallets = walletsData.map(({ privateKey }) => Keypair.fromSecretKey(base58.decode(privateKey)))
    const mainKp = createKeypairFromBase58(PRIVATE_KEY);

    console.log("==== m a i n K P ===== > ", mainKp)
    let ixs: TransactionInstruction[] = [];
    try {
        for (let i = 0; i < wallets.length; i++) {
            const userTokenAta = await getAssociatedTokenAddress(
                new PublicKey(BASEMINT),
                wallets[i].publicKey
            );
            const accountInfo = await connection.getAccountInfo(wallets[i].publicKey)

            const tokenBalance = await connection.getTokenAccountBalance(userTokenAta);
            console.log("token Balance ====>", tokenBalance);

            let tokenAmount = Math.floor(Number(tokenBalance.value.uiAmount) * 10 ** Number(tokenBalance.value.decimals));

            if (tokenAmount != 0) {
                const sellTx = await getSellTx(wallets[i], new PublicKey(BASEMINT), BigInt(tokenAmount))
                if (sellTx == null) {
                    throw new Error("Error getting sell tx")
                }
                const txSellSig = sellTx && await execute(sellTx, 1)
                if (accountInfo) {
                    const solBal = await connection.getBalance(wallets[i].publicKey)
                    ixs.push(
                        SystemProgram.transfer({
                            fromPubkey: wallets[i].publicKey,
                            toPubkey: mainKp.publicKey,
                            lamports: solBal
                        })
                    )
                }
            } else {
                if (accountInfo) {
                    const solBal = await connection.getBalance(wallets[i].publicKey)
                    ixs.push(
                        SystemProgram.transfer({
                            fromPubkey: wallets[i].publicKey,
                            toPubkey: mainKp.publicKey,
                            lamports: solBal
                        })
                    )
                }
            }

            if (ixs.length) {
                const tx = new Transaction().add(
                    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 220_000 }),
                    ComputeBudgetProgram.setComputeUnitLimit({ units: 350_000 }),
                    ...ixs,
                )

                console.log("=========================================")
                console.log(await connection.simulateTransaction(tx))
                tx.feePayer = mainKp.publicKey
                tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
                const sig = await sendAndConfirmTransaction(connection, tx, [mainKp, wallets[i]], { commitment: "confirmed" })
                console.log(`Closed and gathered SOL from wallets ${i} : https://solscan.io/tx/${sig}`)
                // return
            }
        }

        await sleep(1000);

    } catch (error) {
        console.log("gathering error")
        return;
    }

}

function createKeypairFromBase58(privateKeyBase58: string): Keypair {
    const privateKeyUint8Array = base58.decode(privateKeyBase58);
    const temp = Uint8Array.from(privateKeyUint8Array);
    return Keypair.fromSecretKey(temp);
}

main()