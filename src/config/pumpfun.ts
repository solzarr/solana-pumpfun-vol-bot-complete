import {
  Commitment,
  Connection,
  Finality,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import { Instruction, Program, Provider } from "@coral-xyz/anchor";
import { setGlobalDispatcher, Agent } from 'undici'
import { GlobalAccount } from "./globalAccount";
import {
  CompleteEvent,
  CreateEvent,
  CreateTokenMetadata,
  PriorityFee,
  PumpFunEventHandlers,
  PumpFunEventType,
  SetParamsEvent,
  TradeEvent,
  TransactionResult,
} from "./types";
import {
  toAdminSetCreatorEvent,
  toCompleteEvent,
  toCreateEvent,
  // toSetParamsEvent,
  toTradeEvent,
  toAdminSetIdlAuthorityEvent,
  toAdminUpdateTokenIncentivesEvent,
  toClaimTokenIncentivesEvent,
  toCloseUserVolumeAccumulatorEvent,
  toCollectCreatorFeeEvent,
  toCompletePumpAmmMigrationEvent,
  toExtendAccountEvent,
  toInitUserVolumeAccumulatorEvent,
  toSetCreatorEvent,
  toSetMetaplexCreatorEvent,
  toSyncUserVolumeAccumulatorEvent,
  toUpdateGlobalAuthorityEvent,
} from "./events";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { BondingCurveAccount } from "./bondingCurveAccount";
import { BN } from "bn.js";
import {
  DEFAULT_COMMITMENT,
  DEFAULT_FINALITY,
  buildTx,
  buildVersionedTx,
  calculateWithSlippageBuy,
  sendTx,
  sleep,
} from "./util";
import { PumpFun, IDL } from "../IDL";
import { jitoCreatTansaction, jitoSendTransaction, jitoWithAxios } from "./jitoWithAxios";
import { global_mint } from "./config";
import { nextBlockSendTransaction } from "./nextBlockAxios";
import { zeroSlotSendTransaction } from "./zeroSlotAxios";
import { nozomiSendTransaction } from "./nozomiAxios";

const PROGRAM_ID = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";
const MPL_TOKEN_METADATA_PROGRAM_ID =
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

export const GLOBAL_ACCOUNT_SEED = "global";
export const MINT_AUTHORITY_SEED = "mint-authority";
export const BONDING_CURVE_SEED = "bonding-curve";
export const METADATA_SEED = "metadata";

export const DEFAULT_DECIMALS = 6;

const PUMP_FUN_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
const PUMP_FUN_FEE_RECIPIENT = new PublicKey('68yFSZxzLWJXkxxRGydZ63C6mHx1NLEDWmwN9Lb5yySg');
const EVENT_AUTHORITY = new PublicKey('Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1');
const GLOBAL_VOLUME_ACCUMULATOR = new PublicKey("Hq2wp8uJ9jCPsYgNHex8RtqdvMPfVGoYwjvF1ATiwn2Y");
// const DEFAULT_COMMITMENT = "finalized";
const FEE_PROGRAM = new PublicKey("pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ");
const associatedBondingCurve = new PublicKey("48s2d1XXVcXSUQzbnUPw6bXoC2pDZ4x4hn71qRUGdQZr");
export class PumpFunSDK {
  public program: Program<PumpFun>;
  public connection: Connection;
  constructor(provider?: Provider) {
    this.program = new Program<PumpFun>(IDL as PumpFun, provider);
    this.connection = this.program.provider.connection;
  }

  // async createAndBuy(
  //   creator: Keypair,
  //   mint: Keypair,
  //   buyers: Keypair[],
  //   createTokenMetadata: CreateTokenMetadata,
  //   devBuyAmountSol: bigint,
  //   buyAmountSols: bigint[],
  //   slippageBasisPoints: bigint = 300n,
  //   priorityFees?: PriorityFee,
  //   commitment: Commitment = DEFAULT_COMMITMENT,
  //   finality: Finality = DEFAULT_FINALITY
  // ) {
  //   let tokenMetadata = await this.createTokenMetadata(createTokenMetadata);

  //   let createIns = await this.getCreateInstructions(
  //     creator.publicKey,
  //     createTokenMetadata.name,
  //     createTokenMetadata.symbol,
  //     tokenMetadata.metadataUri,
  //     mint
  //   );

  //   let newTx = new Transaction().add(createIns);
  //   // let newTx = new Transaction();

  //   let devBuyIns: TransactionInstruction[] = [];
  //   const buyTxs: Transaction[] = [];

  //   if (buyAmountSols[0] > 0 && buyAmountSols[1] > 0 && buyAmountSols[2] > 0 && buyAmountSols[3] > 0) {
  //     devBuyIns = await this.getBuyInstructionsBySolAmount(
  //       creator.publicKey,
  //       mint.publicKey,
  //       devBuyAmountSol,
  //       slippageBasisPoints,
  //       commitment
  //     );

  //     for (let i = 0; i < buyers.length; i++) {
  //       const buyTx = new Transaction();
  //       const buyIns = await this.getBuyInstructionsBySolAmount(
  //         buyers[i].publicKey,
  //         mint.publicKey,
  //         buyAmountSols[i],
  //         slippageBasisPoints,
  //         commitment
  //       );
  //       buyTx.add(...buyIns)
  //       buyTxs.push(buyTx)
  //     }
  //   }

  //   newTx.add(...devBuyIns);

  //   const versionedCreateTx = await buildVersionedTx(this.connection, creator.publicKey, newTx, commitment)
  //   versionedCreateTx.sign([creator, mint]);

  //   await Promise.all([
  //     // sendTx(this.connection, newTx, creator.publicKey, [creator, mint]),
  //     jitoWithAxios(versionedCreateTx, creator),
  //     // jitoCreatTansaction(newTx, creator.publicKey, [creator, mint]),
  //     jitoSendTransaction(buyTxs[0], buyers[0]),
  //     zeroSlotSendTransaction(buyTxs[1], buyers[1]),
  //     nextBlockSendTransaction(buyTxs[2], buyers[2]),
  //     nozomiSendTransaction(buyTxs[3], buyers[3])
  //   ]);
  // }

  //create token instructions
  // async getCreateInstructions(
  //   creator: PublicKey,
  //   name: string,
  //   symbol: string,
  //   uri: string,
  //   mint: Keypair
  // ) {
  //   const mplTokenMetadata = new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID);

  //   const [metadataPDA] = PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from(METADATA_SEED),
  //       mplTokenMetadata.toBuffer(),
  //       mint.publicKey.toBuffer(),
  //     ],
  //     mplTokenMetadata
  //   );

  //   const associated_bonding_curve = await getAssociatedTokenAddress(
  //     mint.publicKey,
  //     this.getBondingCurvePDA(mint.publicKey),
  //     true
  //   );

  //   console.log("------associated_bonding_curve >> ", associated_bonding_curve)
  //   return this.program.methods
  //     .create(name, symbol, uri, creator)
  //     .accounts({
  //       mint: mint.publicKey,
  //       associated_bonding_curve,
  //       metadata: metadataPDA,
  //       user: creator,
  //     })
  //     .signers([mint])
  //     .instruction();
  // }

  async getBuyInstructionsBySolAmount(
    buyer: PublicKey,
    mint: PublicKey,
    buyAmountSol: bigint,
    slippageBasisPoints: bigint = 500n,
    commitment: Commitment = DEFAULT_COMMITMENT
  ) {
    let bondingCurveAccount = await this.getBondingCurveAccount(
      global_mint,
      commitment
    );
    if (!bondingCurveAccount) {
      throw new Error(`Bonding curve account not found: ${mint.toBase58()}`);
    }

    let buyAmount = bondingCurveAccount.getBuyPrice(buyAmountSol);
    let buyAmountWithSlippage = calculateWithSlippageBuy(
      buyAmountSol,
      slippageBasisPoints
    );
    let globalAccount = await this.getGlobalAccount(commitment);

    return await this.getBuyInstructions(
      buyer,
      mint,
      PUMP_FUN_FEE_RECIPIENT,
      buyAmount,
      buyAmountWithSlippage,
    );
  }

  //buy
  async getBuyInstructions(
    buyer: PublicKey,
    mint: PublicKey,
    fee_Recipient: PublicKey,
    amount: bigint,
    solAmount: bigint,
    commitment: Commitment = DEFAULT_COMMITMENT,
  ) {
    // const associated_bonding_curve = await getAssociatedTokenAddress(
    //   mint,
    //   this.getBondingCurvePDA(mint),
    //   true
    // );

    const associatedUser = await getAssociatedTokenAddress(mint, buyer, false);

    let buyInstructions: TransactionInstruction[] = [];

    try {
      await getAccount(this.connection, associatedUser, commitment);
    } catch (e) {
      buyInstructions.push(createAssociatedTokenAccountInstruction(
        buyer,
        associatedUser,
        buyer,
        mint
      ))
    }

    const [globalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('global')],
      PUMP_FUN_PROGRAM_ID
    );

    const [bondingCurveAta] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("bonding-curve"),
        mint.toBuffer()
      ],
      PUMP_FUN_PROGRAM_ID
    );

    const [associatedBondingCurve] = PublicKey.findProgramAddressSync(
      [
        bondingCurveAta.toBuffer(),
        new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(),
        mint.toBuffer()
      ],
      new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
    );

    // const bondingCurveAccount = this.getBondingCurveAccount(mint);
    // console.log("bonding_curve >> ", bondingCurveAta.creator)
    // const [creatorVault] = PublicKey.findProgramAddressSync(
    //   [
    //     Buffer.from("creator-vault"),
    //     bondingCurveAccount
    //   ],
    //   PUMP_FUN_PROGRAM_ID
    // );

    const [USER_VOLUME_ACCUMULATOR] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("user_volume_accumulator"),
        buyer.toBuffer()
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

    const buyInstruction = await this.program.methods
      .buy(new BN(amount.toString()), new BN(solAmount.toString()), { 0: true })
      .accountsStrict({
        global: globalPda,
        fee_recipient: fee_Recipient,
        mint: mint,
        bonding_curve: bondingCurveAta,
        associated_bonding_curve: associatedBondingCurve,
        associated_user: associatedUser,
        user: buyer,
        system_program: SystemProgram.programId,
        token_program: TOKEN_PROGRAM_ID,
        creator_vault: new PublicKey("Ahygj5emfCo1UJ9DBokaQTvNDppWbwQBUdwWh6LQTtH1"),
        event_authority: EVENT_AUTHORITY,
        program: PUMP_FUN_PROGRAM_ID,
        global_volume_accumulator: GLOBAL_VOLUME_ACCUMULATOR,
        user_volume_accumulator: USER_VOLUME_ACCUMULATOR,
        fee_config: FEE_CONFIG,
        fee_program: FEE_PROGRAM,
      })
      .instruction()

    buyInstructions.push(buyInstruction);

    return buyInstructions;
  }

  async getBondingCurveAccount(
    mint: PublicKey,
    commitment: Commitment = DEFAULT_COMMITMENT
  ) {
    const tokenAccount = await this.connection.getAccountInfo(
      this.getBondingCurvePDA(mint),
      commitment
    );
    if (!tokenAccount) {
      return null;
    }
    return BondingCurveAccount.fromBuffer(tokenAccount!.data);
  }

  async getGlobalAccount(commitment: Commitment = DEFAULT_COMMITMENT) {
    const [globalAccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_ACCOUNT_SEED)],
      new PublicKey(PROGRAM_ID)
    );

    const tokenAccount = await this.connection.getAccountInfo(
      globalAccountPDA,
      commitment
    );

    return GlobalAccount.fromBuffer(tokenAccount!.data);
  }

  getBondingCurvePDA(mint: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(BONDING_CURVE_SEED), mint.toBuffer()],
      this.program.programId
    )[0];
  }


  async createTokenMetadata(create: CreateTokenMetadata) {
    let formData = new FormData();
    formData.append("file", create.file),
      formData.append("name", create.name),
      formData.append("symbol", create.symbol),
      formData.append("description", create.description),
      formData.append("twitter", create.twitter || ""),
      formData.append("telegram", create.telegram || ""),
      formData.append("website", create.website || ""),
      formData.append("showName", "true");

    setGlobalDispatcher(new Agent({ connect: { timeout: 60_000 } }))
    try {
      const response = await fetch('https://pump.fun/api/ipfs', {
        method: 'POST',
        headers: {
          'Origin': 'https://www.pump.fun',
          'Referer': 'https://www.pump.fun/create',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  //EVENTS
  // addEventListener<T extends PumpFunEventType>(
  //   eventType: T,
  //   callback: (
  //     event: PumpFunEventHandlers[T],
  //     slot: number,
  //     signature: string
  //   ) => void
  // ) {
  //   return this.program.addEventListener(
  //     // eventType,
  //     (event: any, slot: number, signature: string) => {
  //       let processedEvent;
  //       switch (eventType) {
  //         case "createEvent":
  //           processedEvent = toCreateEvent(event as CreateEvent);
  //           callback(
  //             processedEvent as PumpFunEventHandlers[T],
  //             slot,
  //             signature
  //           );
  //           break;
  //         case "tradeEvent":
  //           processedEvent = toTradeEvent(event as TradeEvent);
  //           callback(
  //             processedEvent as PumpFunEventHandlers[T],
  //             slot,
  //             signature
  //           );
  //           break;
  //         case "completeEvent":
  //           processedEvent = toCompleteEvent(event as CompleteEvent);
  //           callback(
  //             processedEvent as PumpFunEventHandlers[T],
  //             slot,
  //             signature
  //           );
  //           console.log("completeEvent", event, slot, signature);
  //           break;
  //         // case "setParamsEvent":
  //         //   processedEvent = toSetParamsEvent(event as SetParamsEvent);
  //         //   callback(
  //         //     processedEvent as PumpFunEventHandlers[T],
  //         //     slot,
  //         //     signature
  //         //   );
  //         //   break;
  //         // case "AdminSetCreatorEvent":
  //         //   processedEvent = toAdminSetCreatorEvent(event as AdminSetCreatorEvent);
  //         //   callback(
  //         //     processedEvent as PumpFunEventHandlers[T],
  //         //     slot,
  //         //     signature
  //         //   );
  //         default:
  //           console.error("Unhandled event type:", eventType);
  //       }
  //     }
  //   );
  // }

  removeEventListener(eventId: number) {
    this.program.removeEventListener(eventId);
  }
}
