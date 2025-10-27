import {
    PublicKey,
    Keypair,
    Connection,
    VersionedTransaction,
    TransactionInstruction,
    SystemProgram,
    Transaction,
    ComputeBudgetProgram,
    TransactionMessage
} from '@solana/web3.js';
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
// import { } from '@pump-fun/pump-sdk';
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorProvider } from "@coral-xyz/anchor";
import { RPC_ENDPOINT, RPC_WEBSOCKET_ENDPOINT } from './constants';
import { BondingCurveAccount } from "./utils";
import { PumpFunSDK } from './config/pumpfun'

const PUMP_FUN_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
const PUMP_FUN_FEE_RECIPIENT = new PublicKey("68yFSZxzLWJXkxxRGydZ63C6mHx1NLEDWmwN9Lb5yySg");
// const PUMP_FUN_FEE_RECIPIENT = new PublicKey("7hTckgnGnLQR6sdH7YkqFTAA7VwTfYFaZ6EhEsU3saCX");
const EVENT_AUTHORITY = new PublicKey('Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1');
const GLOBAL_VOLUME_ACCUMULATOR = new PublicKey("Hq2wp8uJ9jCPsYgNHex8RtqdvMPfVGoYwjvF1ATiwn2Y");
const DEFAULT_COMMITMENT = "finalized";
const FEE_PROGRAM = new PublicKey("pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ");
const connection = new Connection(RPC_ENDPOINT, {
    commitment: 'processed',
    wsEndpoint: RPC_WEBSOCKET_ENDPOINT,
});
const commitment = "confirmed"

let sdk = new PumpFunSDK(new AnchorProvider(connection, new NodeWallet(new Keypair()), { commitment }));

export const getBuyTx = async (wallet: Keypair, baseMint: PublicKey, amount: number) => {
    console.log("-------------------g e t B u y T x--------------------");
    try {
        const amountInBaseUnits = Math.floor(amount * 1_000_000_000)
        const bondingCurveAccount = await getBondingCurveAccount(baseMint);

        const token_received = getTokensOut(BigInt(amountInBaseUnits), bondingCurveAccount?.virtualSolReserves!, bondingCurveAccount?.virtualTokenReserves!, bondingCurveAccount?.realTokenReserves!);

        //this is buy transaction
        const tx = new Transaction();
        const discriminator = Buffer.from('66063d1201daebea', 'hex');
        const dataLayout = Buffer.alloc(32);
        dataLayout.writeBigUInt64LE(token_received / 1000000n, 0);        // token_amount
        dataLayout.writeBigUInt64LE(BigInt(amountInBaseUnits) * BigInt(11) / BigInt(10), 9);  // max_sol_cost
        dataLayout.writeBigUInt64LE(BigInt(500), 24);    // slippage
        // dataLayout.writeBigUInt64LE(BigInt(200_000), 24); // fee amount
        const instructionData = Buffer.concat([discriminator, dataLayout]);
        tx.add(
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: 200_000
            }),
            ComputeBudgetProgram.setComputeUnitLimit({
                units: 150_000
            })
        );

        const userTokenAta = await getAssociatedTokenAddress(
            baseMint,
            wallet.publicKey
        );

        const accountInfo = await connection.getAccountInfo(userTokenAta);
        if (!accountInfo) {
            tx.add(createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                userTokenAta,
                wallet.publicKey,
                baseMint
            ));
        }
        // Derive PDAs
        const [globalPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('global')],
            PUMP_FUN_PROGRAM_ID
        );

        const [bondingCurveAta] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("bonding-curve"),
                baseMint.toBuffer()
            ],
            PUMP_FUN_PROGRAM_ID
        );

        const [associatedBondingCurve] = PublicKey.findProgramAddressSync(
            [
                bondingCurveAta.toBuffer(),
                new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(),
                baseMint.toBuffer()
            ],
            new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
        );

        if (!bondingCurveAccount) {
            throw new Error("Bonding curve account not found");
        }

        const [creatorVault] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("creator-vault"),
                bondingCurveAccount.creator.toBuffer(),
            ],
            PUMP_FUN_PROGRAM_ID
        );

        const [USER_VOLUME_ACCUMULATOR] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("user_volume_accumulator"),
                wallet.publicKey.toBuffer()
            ],
            PUMP_FUN_PROGRAM_ID
        );

        const [FEE_CONFIG] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("fee_config"),
                PUMP_FUN_PROGRAM_ID.toBuffer()
            ],
            FEE_PROGRAM
        );

        const buyInstruction = new TransactionInstruction({
            programId: PUMP_FUN_PROGRAM_ID,
            keys: [
                { pubkey: globalPda, isSigner: false, isWritable: false },
                { pubkey: PUMP_FUN_FEE_RECIPIENT, isSigner: false, isWritable: true },
                { pubkey: baseMint, isSigner: false, isWritable: false },
                { pubkey: bondingCurveAta, isSigner: false, isWritable: true },
                { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
                { pubkey: userTokenAta, isSigner: false, isWritable: true },
                { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: creatorVault, isSigner: false, isWritable: true },
                { pubkey: EVENT_AUTHORITY, isSigner: false, isWritable: false },
                { pubkey: PUMP_FUN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: GLOBAL_VOLUME_ACCUMULATOR, isSigner: false, isWritable: true },
                { pubkey: USER_VOLUME_ACCUMULATOR, isSigner: false, isWritable: true },
                { pubkey: FEE_CONFIG, isSigner: false, isWritable: false },
                { pubkey: FEE_PROGRAM, isSigner: false, isWritable: false },
            ],
            data: instructionData
        });

        tx.add(buyInstruction);
        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = wallet.publicKey;
        tx.sign(wallet);

        // console.log(await connection.simulateTransaction(tx))
        const messageV0 = new TransactionMessage({
            payerKey: tx.feePayer,
            recentBlockhash: tx.recentBlockhash,
            instructions: tx.instructions,
        }).compileToV0Message();

        const versionedTransaction = new VersionedTransaction(messageV0);

        versionedTransaction.sign([wallet]);
        return versionedTransaction;

    } catch (error) {

        console.log("Failed to get sell transaction", error)
        return null
    }
};

function getTokensOut(solIn: bigint, solReserves: bigint, tokenReserves: bigint, realTokenRserves: bigint): bigint {
    const k = solReserves * tokenReserves; // constant product
    const newSolReserves = solReserves + solIn;
    const newTokenReserves = k / newSolReserves + 1n;
    const token_buy = tokenReserves - newTokenReserves; // tokens you actually get
    return token_buy < Number(realTokenRserves.toString()) ? token_buy : realTokenRserves;
    // return token_buy;
}

const getBondingCurveAccount = async (mint: PublicKey, commitment = DEFAULT_COMMITMENT) => {
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