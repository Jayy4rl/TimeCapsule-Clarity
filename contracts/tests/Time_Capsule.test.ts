import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

/*
  The test below is an example. To learn more, read the testing documentation here:
  https://docs.hiro.so/stacks/clarinet-js-sdk
*/

describe("Time Capsule Contract Tests", () => {
  it("ensures simnet is well initialized", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("should create a vault successfully", () => {
    const amount = 1000000; // 1 STX in microSTX
    const unlockBlock = simnet.burnBlockHeight + 100;
    
    const { result } = simnet.callPublicFn(
      "Time_Capsule",
      "create-vault",
      [Cl.uint(amount), Cl.uint(unlockBlock), Cl.principal(wallet2)],
      wallet1
    );
    
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should fail to create vault with zero amount", () => {
    const unlockBlock = simnet.burnBlockHeight + 100;
    
    const { result } = simnet.callPublicFn(
      "Time_Capsule",
      "create-vault",
      [Cl.uint(0), Cl.uint(unlockBlock), Cl.principal(wallet2)],
      wallet1
    );
    
    expect(result).toBeErr(Cl.uint(104)); // ERR-INVALID-AMOUNT
  });

  it("should fail to create vault with unlock block in the past", () => {
    const amount = 1000000;
    const unlockBlock = 1; // Past block
    
    const { result } = simnet.callPublicFn(
      "Time_Capsule",
      "create-vault",
      [Cl.uint(amount), Cl.uint(unlockBlock), Cl.principal(wallet2)],
      wallet1
    );
    
    expect(result).toBeErr(Cl.uint(105)); // ERR-INVALID-UNLOCK-TIME
  });

  it("should return capsule details with get-capsule", () => {
    const amount = 1000000;
    const unlockBlock = simnet.burnBlockHeight + 100;
    
    // Create a vault first
    simnet.callPublicFn(
      "Time_Capsule",
      "create-vault",
      [Cl.uint(amount), Cl.uint(unlockBlock), Cl.principal(wallet2)],
      wallet1
    );
    
    // Get capsule details
    const { result } = simnet.callReadOnlyFn(
      "Time_Capsule",
      "get-capsule",
      [Cl.uint(1)],
      wallet1
    );
    
    expect(result).toBeSome(
      Cl.tuple({
        owner: Cl.principal(wallet1),
        amount: Cl.uint(amount),
        "unlock-block": Cl.uint(unlockBlock),
        beneficiary: Cl.principal(wallet2),
        "is-claimed": Cl.bool(false)
      })
    );
  });

  it("should return none for non-existent capsule", () => {
    const { result } = simnet.callReadOnlyFn(
      "Time_Capsule",
      "get-capsule",
      [Cl.uint(999)],
      wallet1
    );
    
    expect(result).toBeNone();
  });

  it("should fail to claim vault if not the beneficiary", () => {
    const amount = 1000000;
    const unlockBlock = simnet.burnBlockHeight + 1;
    
    // Create a vault
    simnet.callPublicFn(
      "Time_Capsule",
      "create-vault",
      [Cl.uint(amount), Cl.uint(unlockBlock), Cl.principal(wallet2)],
      wallet1
    );
    
    // Mine blocks to pass unlock time
    simnet.mineEmptyBurnBlocks(10);
    
    // Try to claim as wrong user (wallet1 instead of wallet2)
    const { result } = simnet.callPublicFn(
      "Time_Capsule",
      "claim-vault",
      [Cl.uint(1)],
      wallet1
    );
    
    expect(result).toBeErr(Cl.uint(103)); // ERR-NOT-BENEFICIARY
  });

  it("should fail to claim vault if too early", () => {
    const amount = 1000000;
    const unlockBlock = simnet.burnBlockHeight + 1000;
    
    // Create a vault with far future unlock
    simnet.callPublicFn(
      "Time_Capsule",
      "create-vault",
      [Cl.uint(amount), Cl.uint(unlockBlock), Cl.principal(wallet2)],
      wallet1
    );
    
    // Try to claim immediately (too early)
    const { result } = simnet.callPublicFn(
      "Time_Capsule",
      "claim-vault",
      [Cl.uint(1)],
      wallet2
    );
    
    expect(result).toBeErr(Cl.uint(102)); // ERR-TOO-EARLY
  });

  it("should successfully claim vault after unlock time", () => {
    const amount = 1000000;
    const unlockBlock = simnet.burnBlockHeight + 5;
    
    // Create a vault
    simnet.callPublicFn(
      "Time_Capsule",
      "create-vault",
      [Cl.uint(amount), Cl.uint(unlockBlock), Cl.principal(wallet2)],
      wallet1
    );
    
    // Mine blocks to pass unlock time
    simnet.mineEmptyBurnBlocks(10);
    
    // Claim as beneficiary
    const { result } = simnet.callPublicFn(
      "Time_Capsule",
      "claim-vault",
      [Cl.uint(1)],
      wallet2
    );
    
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should fail to claim vault if already claimed", () => {
    const amount = 1000000;
    const unlockBlock = simnet.burnBlockHeight + 5;
    
    // Create a vault
    simnet.callPublicFn(
      "Time_Capsule",
      "create-vault",
      [Cl.uint(amount), Cl.uint(unlockBlock), Cl.principal(wallet2)],
      wallet1
    );
    
    // Mine blocks
    simnet.mineEmptyBurnBlocks(10);
    
    // First claim - should succeed
    simnet.callPublicFn(
      "Time_Capsule",
      "claim-vault",
      [Cl.uint(1)],
      wallet2
    );
    
    // Second claim - should fail
    const { result } = simnet.callPublicFn(
      "Time_Capsule",
      "claim-vault",
      [Cl.uint(1)],
      wallet2
    );
    
    expect(result).toBeErr(Cl.uint(101)); // ERR-ALREADY-CLAIMED
  });

  it("should fail to claim non-existent capsule", () => {
    const { result } = simnet.callPublicFn(
      "Time_Capsule",
      "claim-vault",
      [Cl.uint(999)],
      wallet1
    );
    
    expect(result).toBeErr(Cl.uint(100)); // ERR-CAPSULE-NOT-FOUND
  });
});
