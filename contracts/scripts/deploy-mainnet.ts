import transactions from '@stacks/transactions';
const {
    makeContractDeploy,
    broadcastTransaction,
    AnchorMode,
    ClarityVersion
} = transactions;

import type { SignedContractDeployOptions } from '@stacks/transactions';

import network from '@stacks/network';
const { STACKS_MAINNET } = network;

import walletSdk from '@stacks/wallet-sdk';
const { generateWallet, generateNewAccount } = walletSdk;

import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

async function getPrivateKey() {
    console.log("Getting private key...");
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
        console.error('Please set MNEMONIC in .env file');
        process.exit(1);
    }
    try {
        const wallet = await generateWallet({
            secretKey: mnemonic,
            password: 'password',
        });
        console.log("Wallet generated.");
        const { accounts } = generateNewAccount(wallet);
        console.log("Account derived.");
        return accounts[0].stxPrivateKey;
    } catch (e) {
        console.error("Error in getPrivateKey:", e);
        throw e;
    }
}

async function deployContract(contractName: string, contractPath: string) {
    console.log(`\nDeploying ${contractName}...`);

    try {
        const network = STACKS_MAINNET;
        const codeBody = readFileSync(contractPath, 'utf-8');
        const senderKey = await getPrivateKey();

        const txOptions: SignedContractDeployOptions = {
            contractName,
            codeBody,
            senderKey,
            network,
            anchorMode: AnchorMode.Any,
            fee: 150000, // 0.15 STX - Safe fee for Mainnet
            clarityVersion: ClarityVersion.Clarity3
        };

        const transaction = await makeContractDeploy(txOptions);
        const broadcastResponse = await broadcastTransaction({ transaction, network });

        if ('error' in broadcastResponse) {
            console.error(`Error deploying ${contractName}:`, broadcastResponse);
            throw new Error(`Deployment failed: ${broadcastResponse.reason}`);
        }

        console.log(`✅ ${contractName} deployed!`);
        console.log(`   Tx ID: ${broadcastResponse.txid}`);
        console.log(`   View: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=mainnet`);

        return broadcastResponse.txid;
    } catch (error) {
        console.error(`❌ Failed to deploy ${contractName}:`, error);
        throw error;
    }
}

async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║         TIME CAPSULE - MAINNET DEPLOYMENT                  ║");
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log("║  ⚠️  WARNING: Deploying to MAINNET. Real STX will be spent. ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("");

    try {
        // Deploy Time_Capsule contract
        await deployContract('Time_Capsule', 'contracts/Time_Capsule.clar');

        console.log("\n════════════════════════════════════════════════════════════");
        console.log("🎉 DEPLOYMENT COMPLETE!");
        console.log("════════════════════════════════════════════════════════════");

    } catch (error) {
        console.error('\n❌ Deployment failed.');
        process.exit(1);
    }
}

main();
