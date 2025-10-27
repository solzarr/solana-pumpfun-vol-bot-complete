import { PublicKey } from "@solana/web3.js";
import { struct, bool, u64, publicKey, Layout } from "@coral-xyz/borsh";

export class GlobalAccount {
  public discriminator: bigint;
  public initialized: boolean = false;
  public authority: PublicKey;
  public fee_recipient: PublicKey;
  public associated_bonding_curve: PublicKey;
  public initialVirtualTokenReserves: bigint;
  public initialVirtualSolReserves: bigint;
  public initialRealTokenReserves: bigint;
  public tokenTotalSupply: bigint;
  public feeBasisPoints: bigint;
  public globalVolumeAccumulator: PublicKey;
  public userVolumeAccumulator: PublicKey;
  public feeConfig: PublicKey;

  // public fee_program: 
  constructor(
    discriminator: bigint,
    initialized: boolean,
    authority: PublicKey,
    fee_recipient: PublicKey,
    initialVirtualTokenReserves: bigint,
    initialVirtualSolReserves: bigint,
    initialRealTokenReserves: bigint,
    tokenTotalSupply: bigint,
    feeBasisPoints: bigint,
    globalVolumeAccumulator: PublicKey,
    userVolumeAccumulator: PublicKey,
    feeConfig: PublicKey,
    associated_bonding_curve: PublicKey
  ) {
    this.discriminator = discriminator;
    this.initialized = initialized;
    this.authority = authority;
    this.fee_recipient = fee_recipient;
    this.associated_bonding_curve = associated_bonding_curve;
    this.initialVirtualTokenReserves = initialVirtualTokenReserves;
    this.initialVirtualSolReserves = initialVirtualSolReserves;
    this.initialRealTokenReserves = initialRealTokenReserves;
    this.tokenTotalSupply = tokenTotalSupply;
    this.feeBasisPoints = feeBasisPoints;
    this.globalVolumeAccumulator = globalVolumeAccumulator;
    this.userVolumeAccumulator = userVolumeAccumulator;
    this.feeConfig = feeConfig;
  }

  getInitialBuyPrice(amount: bigint): bigint {
    if (amount <= 0n) {
      return 0n;
    }

    let n = this.initialVirtualSolReserves * this.initialVirtualTokenReserves;
    let i = this.initialVirtualSolReserves + amount;
    let r = n / i + 1n;
    let s = this.initialVirtualTokenReserves - r;
    return s < this.initialRealTokenReserves
      ? s
      : this.initialRealTokenReserves;
  }

  public static fromBuffer(buffer: Buffer): GlobalAccount {
    const structure: Layout<GlobalAccount> = struct([
      u64("discriminator"),
      bool("initialized"),
      publicKey("authority"),
      publicKey("fee_recipient"),
      publicKey("associated_bonding_curve"),
      u64("initialVirtualTokenReserves"),
      u64("initialVirtualSolReserves"),
      u64("initialRealTokenReserves"),
      u64("tokenTotalSupply"),
      u64("feeBasisPoints"),
      publicKey("globalVoumeAccumulator"),
      publicKey("userVoumeAccumulator"),
      publicKey("feeConfig"),
      publicKey("associated_bonding_curve"),
    ]);

    let value = structure.decode(buffer);
    return new GlobalAccount(
      BigInt(value.discriminator),
      value.initialized,
      value.authority,
      value.fee_recipient,
      BigInt(value.initialVirtualTokenReserves),
      BigInt(value.initialVirtualSolReserves),
      BigInt(value.initialRealTokenReserves),
      BigInt(value.tokenTotalSupply),
      BigInt(value.feeBasisPoints),
      value.globalVolumeAccumulator,
      value.userVolumeAccumulator,
      value.feeConfig,
      value.associated_bonding_curve,
    );
  }
}
