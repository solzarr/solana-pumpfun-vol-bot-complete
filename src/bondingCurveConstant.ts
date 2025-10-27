export const LAMPORTS_PER_SOL = 10 ** 9;
export const LAMPORTS_PER_TOKEN = 10 ** 6;

// 30 SOL
export const VIRTUAL_SOL_RESERVES = BigInt(30) * BigInt(LAMPORTS_PER_SOL);

// 10 ** 9 tokens
export const VIRTUAL_TOKEN_RESERVES = BigInt(10 ** 9) * BigInt(LAMPORTS_PER_TOKEN);

export const calculateSolAmountByTokenAmount = (tokenAmount: bigint, index: number = 0): bigint => {
    if (tokenAmount <= 0n) {
        return 0n;
    }

    // Using x*y=k formula
    // k = virtualSolReserves * virtualTokenReserves
    const k = VIRTUAL_SOL_RESERVES * VIRTUAL_TOKEN_RESERVES;

    // Calculate SOL for current position
    const currentPositionAmount = tokenAmount * BigInt(index + 1);
    const newTokenReservesCurrent = VIRTUAL_TOKEN_RESERVES - currentPositionAmount;
    if (newTokenReservesCurrent <= 0n) {
        throw new Error("Token amount too large");
    }
    const newSolReservesCurrent = k / newTokenReservesCurrent;
    const currentSolAmount = newSolReservesCurrent - VIRTUAL_SOL_RESERVES;

    // Calculate SOL for previous position
    const previousPositionAmount = tokenAmount * BigInt(index);
    const newTokenReservesPrevious = VIRTUAL_TOKEN_RESERVES - previousPositionAmount;
    if (newTokenReservesPrevious <= 0n) {
        throw new Error("Token amount too large");
    }
    const newSolReservesPrevious = k / newTokenReservesPrevious;
    const previousSolAmount = newSolReservesPrevious - VIRTUAL_SOL_RESERVES;

    // Return the difference (incremental amount)
    return currentSolAmount - previousSolAmount;
}

export const calculateTokenAmountBySolAmount = (solAmount: bigint): bigint => {
    if (solAmount <= 0n) {
        return 0n;
    }

    // Using x*y=k formula
    // k = virtualSolReserves * virtualTokenReserves
    const k = VIRTUAL_SOL_RESERVES * VIRTUAL_TOKEN_RESERVES;

    // Calculate new SOL reserves after purchase
    const newSolReserves = VIRTUAL_SOL_RESERVES + solAmount;

    // Using k = x*y formula, calculate new token reserves
    // k = (x + Δx) * (y - Δy)
    // Solve for Δy (token amount)
    const newTokenReserves = k / newSolReserves;
    const tokenAmount = VIRTUAL_TOKEN_RESERVES - newTokenReserves;

    // Ensure we don't exceed real token reserves
    return tokenAmount < VIRTUAL_TOKEN_RESERVES ? tokenAmount : VIRTUAL_TOKEN_RESERVES;
}
