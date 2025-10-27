import { BN } from "bn.js"
import { retrieveEnvVariable } from "./util"

export const RPC_ENDPOINT = retrieveEnvVariable('RPC_ENDPOINT')
export const RPC_WEBSOCKET_ENDPOINT = retrieveEnvVariable('RPC_WEBSOCKET_ENDPOINT')

export const NEXT_BLOCK_API = retrieveEnvVariable('NEXT_BLOCK_API')
export const NEXT_BLOCK_FEE = Number(retrieveEnvVariable('NEXT_BLOCK_FEE'))
export const ZERO_SLOT_API = retrieveEnvVariable('ZERO_SLOT_API')
export const ZERO_SLOT_FEE = Number(retrieveEnvVariable('ZERO_SLOT_FEE'))
export const NOZOMI_API = retrieveEnvVariable('NOZOMI_API')
export const NOZOMI_FEE = Number(retrieveEnvVariable('NOZOMI_FEE'))
export const JITO_FEE = Number(retrieveEnvVariable('JITO_FEE'))

export const DEV_BUY_AMOUNT = Number(retrieveEnvVariable('DEV_BUY_AMOUNT'))
export const BUY_AMOUNT1 = Number(retrieveEnvVariable('BUY_AMOUNT1'))
export const BUY_AMOUNT2 = Number(retrieveEnvVariable('BUY_AMOUNT2'))
export const BUY_AMOUNT3 = Number(retrieveEnvVariable('BUY_AMOUNT3'))
export const BUY_AMOUNT4 = Number(retrieveEnvVariable('BUY_AMOUNT4'))
export const SLIPPAGE_BASIS_POINTS = Number(retrieveEnvVariable('SLIPPAGE_BASIS_POINTS'))

export const COMMITMENT_LEVEL = "confirmed"
export const Finalized = "confirmed"