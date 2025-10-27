import { Connection, VersionedTransaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { RPC_ENDPOINT, RPC_WEBSOCKET_ENDPOINT } from "./constants";

interface Blockhash {
    blockhash: string;
    lastValidBlockHeight: number;
}

export const execute = async (transaction: VersionedTransaction, isBuy: boolean | 1 = true) => {
    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    // const connection = new Connection("https://api.devnet.solana.com", "confirmed");


    try {
        const signature = await connection.sendTransaction(transaction, {
            skipPreflight: true
        });

        console.log("signature >> ", signature);

        const confirmation = await connection.confirmTransaction(signature);

        // const confirmation = await connection.confirmTransaction({
        //     signature,
        //     blockhash: latestBlockhash.blockhash,
        //     lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        // }, "confirmed");

        if (confirmation.value.err) {
            console.log("Confirmtaion error")
            return ""
        } else {
            if (isBuy === 1) {
                console.log(`Success --- in buy transaction: https://solscan.io/tx/${signature}`)
                return signature;
            } else if (isBuy)
                console.log(`Success ------ in buy transaction: https://solscan.io/tx/${signature}`)
            else
                console.log(`Success ------------- in Sell transaction: https://solscan.io/tx/${signature}`)
        }

        return signature;

    } catch (error) {
        console.log("signature error >> ", error);
    }

}
