import { retrieveEnvVariable } from "./utils";
import {
    Connection,
    Keypair, PublicKey
} from '@solana/web3.js'
export const PRIVATE_KEY = retrieveEnvVariable('PRIVATE_KEY')
export const RPC_ENDPOINT = retrieveEnvVariable('RPC_ENDPOINT')
export const RPC_WEBSOCKET_ENDPOINT = retrieveEnvVariable('RPC_WEBSOCKET_ENDPOINT')
export const connection = new Connection(RPC_ENDPOINT, "confirmed");
export const SLIPPAGE = Number(retrieveEnvVariable('SLIPPAGE'))
export const DISTRIBUTENUM = Number(retrieveEnvVariable('DISTRIBUTENUM'))
export const MIN_DELAY = Number(retrieveEnvVariable('MIN_DELAY'))
export const MAX_DELAY = Number(retrieveEnvVariable('MAX_DELAY'))
export const BASEMINT = retrieveEnvVariable('BASEMINT');
export const global_mint = new PublicKey("5bzpALdbCXy5zmwMBhJ1EAGJnS7tEzV1cpqxmHKbpump");

export const DISTRIBUTE_AMOUNT = Number(retrieveEnvVariable('DISTRIBUTE_AMOUNT'))

export const BUY_AMOUNT_MAX = Number(retrieveEnvVariable('BUY_AMOUNT_MAX'))
export const BUY_AMOUNT_MIN = Number(retrieveEnvVariable('BUY_AMOUNT_MIN'))