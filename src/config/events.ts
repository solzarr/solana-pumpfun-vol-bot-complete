import { PublicKey } from "@solana/web3.js";
import {
  CompleteEvent,
  CreateEvent,
  SetParamsEvent,
  TradeEvent,
  AdminSetIdlAuthorityEvent,
  AdminSetCreatorEvent,
  AdminUpdateTokenIncentivesEvent,
  ClaimTokenIncentivesEvent,
  CloseUserVolumeAccumulatorEvent,
  CollectCreatorFeeEvent,
  CompletePumpAmmMigrationEvent,
  ExtendAccountEvent,
  InitUserVolumeAccumulatorEvent,
  SetCreatorEvent,
  SetMetaplexCreatorEvent,
  SyncUserVolumeAccumulatorEvent,
  UpdateGlobalAuthorityEvent,

} from "./types";

export function toCreateEvent(event: CreateEvent): CreateEvent {
  return {
    name: event.name,
    symbol: event.symbol,
    uri: event.uri,
    mint: new PublicKey(event.mint),
    bonding_curve: new PublicKey(event.bonding_curve),
    user: new PublicKey(event.user),
    creator: new PublicKey(event.creator),
    timestamp: BigInt(event.timestamp),
    virtual_token_reserves: BigInt(event.virtual_token_reserves),
    virtual_sol_reserves: BigInt(event.virtual_sol_reserves),
    real_token_reserves: BigInt(event.real_token_reserves),
    token_total_supply: BigInt(event.token_total_supply),
  };
}

export function toCompleteEvent(event: CompleteEvent): CompleteEvent {
  return {
    user: new PublicKey(event.user),
    mint: new PublicKey(event.mint),
    bonding_curve: new PublicKey(event.bonding_curve),
    timestamp: BigInt(event.timestamp),
  };
}

export function toTradeEvent(event: TradeEvent): TradeEvent {
  return {
    mint: new PublicKey(event.mint),
    solAmount: BigInt(event.solAmount),
    tokenAmount: BigInt(event.tokenAmount),
    isBuy: event.isBuy,
    user: new PublicKey(event.user),
    timestamp: event.timestamp,
    virtual_sol_reserves: BigInt(event.virtual_sol_reserves),
    virtual_token_reserves: BigInt(event.virtual_token_reserves),
    real_sol_reserves: BigInt(event.real_sol_reserves),
    real_token_reserves: BigInt(event.real_token_reserves),
    fee_recipient: new PublicKey(event.fee_recipient),
    fee_basis_points: BigInt(event.fee_basis_points),
    fee: BigInt(event.fee),
    creator: new PublicKey(event.creator),
    creator_fee_basis_points: BigInt(event.creator_fee_basis_points),
    creator_fee: BigInt(event.creator_fee),
    track_volume: Boolean(event.track_volume),
    total_unclaimed_tokens: BigInt(event.total_unclaimed_tokens),
    total_claimed_tokens: BigInt(event.total_claimed_tokens),
    current_sol_volume: BigInt(event.current_sol_volume),
    last_update_timestamp: BigInt(event.last_update_timestamp)
  };
}

// export function toSetParamsEvent(event: SetParamsEvent): SetParamsEvent {
//   return {
//     initial_virtual_token_reserves: BigInt(event.initial_virtual_token_reserves),
//     initial_virtual_sol_reserves: BigInt(event.initial_virtual_sol_reserves),
//     initial_real_token_reserves: BigInt(event.initial_real_token_reserves),
//     final_real_sol_reserves: BigInt(event.final_real_sol_reserves),
//     token_total_supply: BigInt(event.token_total_supply),
//     fee_basis_points: BigInt(event.fee_basis_points),
//     withdraw_authority: new PublicKey(event.withdraw_authority),
//     enable_migrate: Boolean(event.enable_migrate),
//     pool_migration_fee: BigInt(event.pool_migration_fee),
//     creator_fee_basis_points: BigInt(event.creator_fee_basis_points),
//     fee_recipients: (event.fee_recipients ?? []).map(
//       (pk: string | Uint8Array) => new PublicKey(pk)
//     ),
//     timestamp: BigInt(event.timestamp),
//     set_creator_authority: new PublicKey(event.set_creator_authority),
//     admin_set_creator_authority: new PublicKey(event.admin_set_creator_authority)
//   };
// }

export function toAdminSetIdlAuthorityEvent(event: AdminSetIdlAuthorityEvent): AdminSetIdlAuthorityEvent {
  return {
    idl_authority: new PublicKey(event.idl_authority)
  }
}
export function toAdminSetCreatorEvent(event: AdminSetCreatorEvent): AdminSetCreatorEvent {
  return {
    timestamp: BigInt(event.timestamp),
    admin_set_creator_authority: new PublicKey(event.admin_set_creator_authority),
    mint: new PublicKey(event.mint),
    bonding_curve: new PublicKey(event.bonding_curve),
    old_creator: new PublicKey(event.old_creator),
    new_creator: new PublicKey(event.new_creator)
  }
}
export function toAdminUpdateTokenIncentivesEvent(event: AdminUpdateTokenIncentivesEvent): AdminUpdateTokenIncentivesEvent {
  return {
    start_time: BigInt(event.start_time),
    end_time: BigInt(event.end_time),
    day_bigint: BigInt(event.day_bigint),
    token_supply_per_day: BigInt(event.token_supply_per_day),
    mint: new PublicKey(event.mint),
    seconds_in_a_day: BigInt(event.seconds_in_a_day),
    timestamp: BigInt(event.timestamp)
  }
}
export function toClaimTokenIncentivesEvent(event: ClaimTokenIncentivesEvent): ClaimTokenIncentivesEvent {
  return {
    user: new PublicKey(event.user),
    mint: new PublicKey(event.mint),
    amount: BigInt(event.amount),
    timestamp: BigInt(event.timestamp),
    total_claimed_tokens: BigInt(event.total_claimed_tokens),
    current_sol_volume: BigInt(event.current_sol_volume)
  }
}
export function toCloseUserVolumeAccumulatorEvent(event: CloseUserVolumeAccumulatorEvent): CloseUserVolumeAccumulatorEvent {
  return {
    user: new PublicKey(event.user),
    timestamp: BigInt(event.timestamp),
    total_unclaimed_tokens: BigInt(event.total_unclaimed_tokens),
    total_claimed_tokens: BigInt(event.total_claimed_tokens),
    current_sol_volume: BigInt(event.current_sol_volume),
    last_update_timestamp: BigInt(event.last_update_timestamp)

  }
}
export function toCollectCreatorFeeEvent(event: CollectCreatorFeeEvent): CollectCreatorFeeEvent {
  return {
    timestamp: BigInt(event.timestamp),
    creator: new PublicKey(event.creator),
    creator_fee: BigInt(event.creator_fee)
  }
}
export function toCompletePumpAmmMigrationEvent(event: CompletePumpAmmMigrationEvent): CompletePumpAmmMigrationEvent {
  return {
    user: new PublicKey(event.user),
    mint: new PublicKey(event.mint),
    mint_amount: BigInt(event.mint_amount),
    sol_amount: BigInt(event.sol_amount),
    pool_migration_fee: BigInt(event.pool_migration_fee),
    bonding_curve: new PublicKey(event.bonding_curve),
    timestamp: BigInt(event.timestamp),
    pool: new PublicKey(event.pool),
  }
}
export function toExtendAccountEvent(event: ExtendAccountEvent): ExtendAccountEvent {
  return {
    account: new PublicKey(event.account),
    user: new PublicKey(event.user),
    current_size: BigInt(event.current_size),
    new_size: BigInt(event.new_size),
    timestamp: BigInt(event.timestamp)
  }
}
export function toInitUserVolumeAccumulatorEvent(event: InitUserVolumeAccumulatorEvent): InitUserVolumeAccumulatorEvent {
  return {
    payer: new PublicKey(event.payer),
    user: new PublicKey(event.timestamp),
    timestamp: BigInt(event.timestamp)
  }
}
export function toSetCreatorEvent(event: SetCreatorEvent): SetCreatorEvent {
  return {
    timestamp: BigInt(event.timestamp),
    mint: new PublicKey(event.mint),
    bonding_curve: new PublicKey(event.bonding_curve),
    creator: new PublicKey(event.creator)
  }
}
export function toSetMetaplexCreatorEvent(event: SetMetaplexCreatorEvent): SetMetaplexCreatorEvent {
  return {
    timestamp: BigInt(event.timestamp),
    mint: new PublicKey(event.mint),
    bonding_curve: new PublicKey(event.bonding_curve),
    metadata: new PublicKey(event.metadata),
    creator: new PublicKey(event.creator)
  }
}
export function toSyncUserVolumeAccumulatorEvent(event: SyncUserVolumeAccumulatorEvent): SyncUserVolumeAccumulatorEvent {
  return {
    user: new PublicKey(event.user),
    total_claimed_tokens_before: BigInt(event.total_claimed_tokens_before),
    total_claimed_tokens_after: BigInt(event.total_claimed_tokens_after),
    timestamp: BigInt(event.timestamp),
  }
}
export function toUpdateGlobalAuthorityEvent(event: UpdateGlobalAuthorityEvent): UpdateGlobalAuthorityEvent {
  return {
    global: new PublicKey(event.global),
    authority: new PublicKey(event.authority),
    new_authority: new PublicKey(event.new_authority),
    timestamp: BigInt(event.timestamp)
  }
}