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
import { RPC_ENDPOINT } from './constants';
import { BondingCurveAccount } from "./utils";
import { Wallet } from '@coral-xyz/anchor';
const PUMP_FUN_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
const PUMP_FUN_FEE_RECIPIENT = new PublicKey("DDMCfwbcaNYTeMk1ca8tr8BQKFaUfFCWFwBJq8JcnyCw");
const EVENT_AUTHORITY = new PublicKey('Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1');
const DEFAULT_COMMITMENT = "finalized";
const connection = new Connection(RPC_ENDPOINT, 'confirmed');
// const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const FEE_PROGRAM = new PublicKey("pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ")


export const getSellTx = async (wallet: Keypair, baseMint: PublicKey, amountInTokens: bigint) => {
    console.log(" ");
    console.log("------------------- g e t S e l l T x --------------------");
    console.log(" ");
    try {
        const bondingCurveAccountt = await getBondingCurveAccount(baseMint);
        const sol_received = getSolOut(amountInTokens, bondingCurveAccountt?.virtualSolReserves!, bondingCurveAccountt?.virtualTokenReserves!)

        const tx = new Transaction();
        const dataLayout = Buffer.alloc(32);
        const slippageBps = 100; // 1%

        const discriminator = Buffer.from('33e685a4017f83ad', 'hex');
        dataLayout.writeBigUInt64LE(BigInt(amountInTokens), 0);        // token_amount
        dataLayout.writeBigUInt64LE(BigInt(sol_received) * BigInt(9) / BigInt(10), 8);  // max_sol_cost
        dataLayout.writeBigUInt64LE(BigInt(slippageBps), 24);    // slippage
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

        let aaa = connection.getAccountInfo(globalPda, DEFAULT_COMMITMENT)

        const mintPubkey = baseMint

        const [bondingCurveAta] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("bonding-curve"),
                mintPubkey.toBuffer()
            ],
            PUMP_FUN_PROGRAM_ID
        );

        const bondingCurveAccount = await getBondingCurveAccount(mintPubkey);

        if (!bondingCurveAccount) {
            throw new Error("Bonding curve account not found");
        }

        const [associatedBondingCurve] = PublicKey.findProgramAddressSync(
            [
                bondingCurveAta.toBuffer(),
                new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(),
                baseMint.toBuffer()
            ],
            new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
        );

        const [creatorVault] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("creator-vault"),
                bondingCurveAccount.creator.toBuffer(),
            ],
            PUMP_FUN_PROGRAM_ID
        );

        const [bondingCurveAddress] = PublicKey.findProgramAddressSync(
            [
                bondingCurveAta.toBuffer(),
                new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer()
            ],
            new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
        );

        const [FEE_CONFIG] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("fee_config"),
                PUMP_FUN_PROGRAM_ID.toBuffer()
            ],
            FEE_PROGRAM
        );
        // console.log("🚀 ~ getSellTx ~ globalPda:", globalPda.toBase58())
        // console.log("🚀 ~ getSellTx ~ PUMP_FUN_FEE_RECIPIENT:", PUMP_FUN_FEE_RECIPIENT.toBase58())
        // console.log("🚀 ~ getSellTx ~ baseMint:", baseMint.toBase58())
        // console.log("🚀 ~ getSellTx ~ bondingCurveAta:", bondingCurveAta.toBase58())
        // console.log("🚀 ~ getSellTx ~ associatedBondingCurve:", associatedBondingCurve.toBase58())
        // console.log("🚀 ~ getSellTx ~ userTokenAta:", userTokenAta.toBase58())
        // console.log("🚀 ~ getSellTx ~ wallet:", wallet.publicKey.toBase58())
        // console.log("🚀 ~ getSellTx ~ SystemProgram:", SystemProgram)
        // console.log("🚀 ~ getSellTx ~ creatorVault:", creatorVault.toBase58())
        // console.log("🚀 ~ getSellTx ~ TOKEN_PROGRAM_ID:", TOKEN_PROGRAM_ID.toBase58())
        // console.log("🚀 ~ getSellTx ~ EVENT_AUTHORITY:", EVENT_AUTHORITY.toBase58())
        // console.log("🚀 ~ getSellTx ~ PUMP_FUN_PROGRAM_ID:", PUMP_FUN_PROGRAM_ID.toBase58())
        // console.log("🚀 ~ getSellTx ~ FEE_CONFIG:", FEE_CONFIG.toBase58())
        // console.log("🚀 ~ getSellTx ~ FEE_PROGRAM:", FEE_PROGRAM.toBase58())

        const sellInstruction = new TransactionInstruction({
            programId: PUMP_FUN_PROGRAM_ID,
            keys: [
                { pubkey: globalPda, isSigner: false, isWritable: false },
                { pubkey: PUMP_FUN_FEE_RECIPIENT, isSigner: false, isWritable: true },
                { pubkey: mintPubkey, isSigner: false, isWritable: false },
                { pubkey: bondingCurveAta, isSigner: false, isWritable: true },
                { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
                { pubkey: userTokenAta, isSigner: false, isWritable: true },
                { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                { pubkey: creatorVault, isSigner: false, isWritable: true },
                { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: EVENT_AUTHORITY, isSigner: false, isWritable: false },
                { pubkey: PUMP_FUN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: FEE_CONFIG, isSigner: false, isWritable: false },
                { pubkey: FEE_PROGRAM, isSigner: false, isWritable: false }
            ],
            data: instructionData
        });

        tx.add(sellInstruction);
        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = wallet.publicKey;
        tx.sign(wallet);

        console.log("===============================");
        // console.log(await connection.simulateTransaction(tx));
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

function getSolOut(tokenIn: bigint, solReserves: bigint, tokenReserves: bigint): bigint {
    const k = solReserves * tokenReserves; // constant product
    const newTokenReserves = tokenReserves + tokenIn;
    const newSolReserves = k / newTokenReserves;
    return solReserves - newSolReserves; // sols you actually get
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
