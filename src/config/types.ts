import { PublicKey, VersionedTransactionResponse } from "@solana/web3.js";

export type CreateTokenMetadata = {
  name: string;
  symbol: string;
  description: string;
  file: Blob;
  twitter?: string;
  telegram?: string;
  website?: string;
};

export type TokenMetadata = {
  name: string;
  symbol: string;
  description: string;
  image: string;
  showName: boolean;
  createdOn: string;
  twitter: string;
};

export type CreateEvent = {
  name: string;
  symbol: string;
  uri: string;
  mint: PublicKey;
  bonding_curve: PublicKey;
  user: PublicKey;
  creator: PublicKey;
  timestamp: bigint;
  virtual_token_reserves: bigint;
  virtual_sol_reserves: bigint;
  real_token_reserves: bigint;
  token_total_supply: bigint;
};

export type TradeEvent = {
  mint: PublicKey;
  solAmount: bigint;
  tokenAmount: bigint;
  isBuy: boolean;
  user: PublicKey;
  timestamp: bigint;
  virtual_sol_reserves: bigint;
  virtual_token_reserves: bigint;
  real_sol_reserves: bigint;
  real_token_reserves: bigint;
  fee_recipient: PublicKey;
  fee_basis_points: bigint;
  fee: bigint;
  creator: PublicKey;
  creator_fee_basis_points: bigint;
  creator_fee: bigint;
  track_volume: boolean;
  total_unclaimed_tokens: bigint;
  total_claimed_tokens: bigint;
  current_sol_volume: bigint;
  last_update_timestamp: bigint;
};

export type CompleteEvent = {
  user: PublicKey;
  mint: PublicKey;
  bonding_curve: PublicKey;
  timestamp: bigint;
};

export type SetParamsEvent = {
  initial_virtual_token_reserves: bigint;
  initial_virtual_sol_reserves: bigint;
  initial_real_token_reserves: bigint;
  final_real_sol_reserves: bigint;
  token_total_supply: bigint;
  fee_basis_points: bigint;
  withdraw_authority: PublicKey;
  enable_migrate: boolean;
  pool_migration_fee: bigint;
  creator_fee_basis_points: bigint;
  fee_recipients: PublicKey[];
  timestamp: bigint;
  set_creator_authority: PublicKey;
  admin_set_creator_authority: PublicKey;
};

export type AdminSetIdlAuthorityEvent = {
  idl_authority: PublicKey;
}

export type AdminSetCreatorEvent = {
  timestamp: bigint;
  admin_set_creator_authority: PublicKey;
  mint: PublicKey;
  bonding_curve: PublicKey;
  old_creator: PublicKey;
  new_creator: PublicKey;
}


export type AdminUpdateTokenIncentivesEvent = {
  start_time: bigint;
  end_time: bigint;
  day_bigint: bigint;
  token_supply_per_day: bigint;
  mint: PublicKey;
  seconds_in_a_day: bigint;
  timestamp: bigint;
}

export type ClaimTokenIncentivesEvent = {
  user: PublicKey;
  mint: PublicKey;
  amount: bigint;
  timestamp: bigint;
  total_claimed_tokens: bigint;
  current_sol_volume: bigint;
}

export type CloseUserVolumeAccumulatorEvent = {
  user: PublicKey;
  timestamp: bigint;
  total_unclaimed_tokens: bigint;
  total_claimed_tokens: bigint;
  current_sol_volume: bigint;
  last_update_timestamp: bigint;
}

export type CollectCreatorFeeEvent = {
  timestamp: bigint;
  creator: PublicKey;
  creator_fee: bigint;
}

export type CompletePumpAmmMigrationEvent = {
  user: PublicKey;
  mint: PublicKey;
  mint_amount: bigint;
  sol_amount: bigint;
  pool_migration_fee: bigint;
  bonding_curve: PublicKey;
  timestamp: bigint;
  pool: PublicKey;
}

export type ExtendAccountEvent = {
  account: PublicKey;
  user: PublicKey;
  current_size: bigint;
  new_size: bigint;
  timestamp: bigint;
}

export type InitUserVolumeAccumulatorEvent = {
  payer: PublicKey;
  user: PublicKey;
  timestamp: bigint;
}

export type SetCreatorEvent = {
  timestamp: bigint;
  mint: PublicKey;
  bonding_curve: PublicKey;
  creator: PublicKey;
}

export type SetMetaplexCreatorEvent = {
  timestamp: bigint;
  mint: PublicKey;
  bonding_curve: PublicKey;
  metadata: PublicKey;
  creator: PublicKey;
}

export type SyncUserVolumeAccumulatorEvent = {
  user: PublicKey;
  total_claimed_tokens_before: bigint;
  total_claimed_tokens_after: bigint;
  timestamp: bigint;
}

export type UpdateGlobalAuthorityEvent = {
  global: PublicKey;
  authority: PublicKey;
  new_authority: PublicKey;
  timestamp: bigint;
}

export interface PumpFunEventHandlers {
  createEvent: CreateEvent;
  tradeEvent: TradeEvent;
  completeEvent: CompleteEvent;
  setParamsEvent: SetParamsEvent;
  AdminSetCreatorEvent: AdminSetCreatorEvent;
  AdminSetIdlAuthorityEvent: AdminSetIdlAuthorityEvent;
  AdminUpdateTokenIncentivesEvent: AdminUpdateTokenIncentivesEvent;
  ClaimTokenIncentivesEvent: ClaimTokenIncentivesEvent;
  CloseUserVolumeAccumulatorEvent: CloseUserVolumeAccumulatorEvent;
  CollectCreatorFeeEvent: CollectCreatorFeeEvent;
  CompletePumpAmmMigrationEvent: CompletePumpAmmMigrationEvent;
  ExtendAccountEvent: ExtendAccountEvent;
  InitUserVolumeAccumulatorEvent: InitUserVolumeAccumulatorEvent;
  SetCreatorEvent: SetCreatorEvent;
  SetMetaplexCreatorEvent: SetMetaplexCreatorEvent;
  SyncUserVolumeAccumulatorEvent: SyncUserVolumeAccumulatorEvent;
  UpdateGlobalAuthorityEvent: UpdateGlobalAuthorityEvent;

}

export type PumpFunEventType = keyof PumpFunEventHandlers;

export type PriorityFee = {
  unitLimit: number;
  unitPrice: number;
};

export type TransactionResult = {
  sig?: string;
  error?: unknown;
  confirmed: boolean;
};
