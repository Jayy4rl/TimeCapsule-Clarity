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
});
