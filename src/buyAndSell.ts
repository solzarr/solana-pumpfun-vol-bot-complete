import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction, } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';
// import { address, createSolanaRpc } from "@solana/kit";
import { execute } from './execute';
import { getBuyTx } from './getBuyTx';
import { getSellTx } from './getSellTx';
import { RPC_ENDPOINT, BUY_AMOUNT_MAX, BUY_AMOUNT_MIN, BASEMINT, RPC_WEBSOCKET_ENDPOINT } from './constants'
import { readJson, Data } from "./utils";
import bs58 from 'bs58';
import * as fs from 'fs';
import Decimal from "decimal.js";
import { BondingCurveAccount } from "./utils";

const DEFAULT_COMMITMENT = "finalized";
const PUMP_FUN_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
const connection = new Connection(RPC_ENDPOINT, 'confirmed');

export const buyAndSell = async (kp: Keypair[]) => {
    let promise: (() => any)[] = []
    const basemint = new PublicKey(BASEMINT);

    // laod wallet
    let wallets: Data[];
    wallets = readJson();
    while (1) {
        const index = Math.floor(Math.random() * wallets.length);
        console.log("index >> ", index);
        try {
            const wait = randInt(2, 5);
            console.log("rnadomNum >> ", Math.random());
            const isBuy = Math.random() < 0.5;
            console.log("isBusy >> ", isBuy);

            const amountSOL = randSOLAmount();
            console.log("amounnt >> ", amountSOL);

            if (isBuy) {
                console.log("----------- is buying ------------> ", isBuy);

                // this is buy instructions
                let buyTx = await getBuyTx(kp[index], basemint, amountSOL)
                let buySignature = buyTx && await execute(buyTx, 1)
                console.log(`wallet ${index}`, " : ", " buy ", ` sol_amount : ${amountSOL} `)

            }
            else {
                console.log("----------- is selling ------------> ", !isBuy);

                const token_amount = await randTokenAmount(basemint, new PublicKey(wallets[index].pubkey));
                console.log("token_amount >>>> ", token_amount);
                if (token_amount <= 1_000_000) {
                    console.log("token_amount >>>> ", token_amount);
                    return;
                }

                console.log("amount >> ", token_amount);
                // this is sell instruction
                let sellTx = await getSellTx(kp[index], basemint, token_amount)
                // console.log("sellTx >> ", sellTx)
                let sellSignature = sellTx && await execute(sellTx, 1)
                console.log("sellSignature >> ", sellSignature);
                console.log(`wallet ${index}`, "  ", " sell ", ` token_amount : ${token_amount} `)
            }

            const bondingCurveAccount = await getBondingCurveAccount(basemint);

            // console.log("🚀 ~ buyAndSell ~ bondingCurveAccount:", bondingCurveAccount)

            if (bondingCurveAccount) {
                let virtualToken = bondingCurveAccount?.virtualTokenReserves;
                let virtualSol = bondingCurveAccount?.virtualSolReserves;
                const filePath = "result.txt";
                if (virtualSol && virtualToken) {

                    console.log("gbcs value >> ", new Decimal((virtualSol / BigInt(10 ** 9)).toString()).div(new Decimal((virtualToken / BigInt(10 ** 6)).toString())));

                    const price = new Decimal(virtualSol.toString()).div(new Decimal(virtualToken.toString()));
                    fs.appendFile(filePath, String("\n" + price.toString() + ","), (err) => {
                        if (err) {
                            console.error('Error writing file:', err);
                            return;
                        }
                        console.log('File written successfully (asynchronously with callback).');
                    });
                }
            }
            console.log(`-------------------  next action will be performed later ${wait}s. ... --------------------`);
            await sleep(100);

        } catch (err) {
            console.error("Transaction failed:", err);
        }
    }
    const wait = randInt(2, 5);
    console.log(`------------------- Sleeping ${wait}s before next action... --------------------`);
    await sleep(10000);

    await Promise.all(promise.map(fn => fn()))
        .then(results => {
            console.log("All results:", results);
        })
        .catch(error => {
            console.error("At least one promise failed:", error);
        });
    await sleep(10000);
}

const getBondingCurveAccount = async (
    mint: PublicKey,
    commitment = DEFAULT_COMMITMENT
) => {
    const BONDING_CURVE_SEED = "bonding-curve";

    const [getBondingCurvePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(BONDING_CURVE_SEED), mint.toBuffer()],
        PUMP_FUN_PROGRAM_ID
    );

    const tokenAccount = await connection.getAccountInfo(
        getBondingCurvePDA,
        // @ts-ignore
        commitment
    );

    const curveInfo = await connection.getAccountInfo(getBondingCurvePDA);
    if (!tokenAccount) {
        return null;
    }
    return BondingCurveAccount.fromBuffer(tokenAccount!.data);
}

// Simple sleep function
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const randInt = (min: number, max: number) => {
    // console.log("Math.floor(Math.random() * (max - min + 1)) + min; >> ", Math.floor(Math.random() * (max - min + 1)) + min)
    return (Math.floor(Math.random() * (max - min + 1)) + min)
}

const randSOLAmount = () => randInt(BUY_AMOUNT_MIN, BUY_AMOUNT_MAX) / 10 //0.05SOL ~ 0.1SOL

const randTokenAmount = async (BASEMINT: PublicKey, wallet: PublicKey) => {
    // console.log("basemint >> ", BASEMINT);
    // console.log("wallet >> ", wallet);
    const tokenAta = await getAssociatedTokenAddress(BASEMINT, wallet);
    const amount = await connection.getTokenAccountBalance(tokenAta);

    console.log("🚀 ~ randTokenAmount ~ amount >> ", amount.value.amount);

    // console.log(" >>>>>> ", BigInt(randInt(Math.floor(Number(amount.value.amount) * 0.1), Math.floor(Number(amount.value.amount) * 0.6))))
    return BigInt(randInt(Math.floor(Number(amount.value.amount) * 0.2), Math.floor(Number(amount.value.amount) * 0.7)));
}
