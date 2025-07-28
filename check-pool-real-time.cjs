#!/usr/bin/env node
/**
 * 🔍 REAL-TIME POOL CHECK
 * Check the actual current state of the pool
 */

const { ethers } = require('ethers');

async function checkPoolRealTime() {
  try {
    console.log('🔍 CHECKING REAL-TIME POOL STATUS...');
    
    // Configuration
    const WPT_CONTRACT = '0x9408f17a8B4666f8cb8231BA213DE04137dc3825';
    const POOL_CONTRACT = '0xe021e5817E8867D7CeA10f63BC47E118f3aB9E4A';
    
    // Setup provider
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    
    // Get current block
    const currentBlock = await provider.getBlockNumber();
    console.log(`📋 Current block: ${currentBlock}`);
    
    // WPT contract
    const wptABI = ['function balanceOf(address owner) view returns (uint256)'];
    const wptContract = new ethers.Contract(WPT_CONTRACT, wptABI, provider);
    
    // Get real-time pool balance
    const poolBalance = await wptContract.balanceOf(POOL_CONTRACT);
    const poolBalanceFormatted = ethers.utils.formatUnits(poolBalance, 18);
    
    console.log('');
    console.log('🏦 REAL-TIME POOL STATUS:');
    console.log(`   Pool WPT Balance: ${poolBalanceFormatted} WPT`);
    console.log(`   Raw Balance: ${poolBalance.toString()}`);
    
    // Check if this matches our injection
    const originalBalance = ethers.utils.parseUnits('284012.17353', 18);
    const injectedAmount = ethers.utils.parseUnits('1000000', 18);
    const expectedBalance = originalBalance.add(injectedAmount);
    const expectedFormatted = ethers.utils.formatUnits(expectedBalance, 18);
    
    console.log('');
    console.log('📊 INJECTION ANALYSIS:');
    console.log(`   Original balance: 284,012.17353 WPT`);
    console.log(`   Injected amount: 1,000,000 WPT`);
    console.log(`   Expected total: ${expectedFormatted} WPT`);
    console.log(`   Actual total: ${poolBalanceFormatted} WPT`);
    
    const difference = poolBalance.sub(expectedBalance);
    const differenceFormatted = ethers.utils.formatUnits(difference.abs(), 18);
    
    if (difference.abs().lt(ethers.utils.parseUnits('1', 18))) {
      console.log('✅ INJECTION CONFIRMED - Token injection successful!');
    } else {
      console.log(`❌ MISMATCH - Difference: ${differenceFormatted} WPT`);
    }
    
    // Check transaction status
    console.log('');
    console.log('🔍 TRANSACTION VERIFICATION:');
    
    const txHash = '0x37a0d98f9245461d5ac0782cc66487b1d8c5cefc55121026914e1ea9391a08cf';
    const tx = await provider.getTransactionReceipt(txHash);
    
    if (tx) {
      console.log(`   Transaction confirmed in block: ${tx.blockNumber}`);
      console.log(`   Gas used: ${tx.gasUsed.toString()}`);
      console.log(`   Status: ${tx.status === 1 ? 'SUCCESS' : 'FAILED'}`);
    } else {
      console.log('   ❌ Transaction not found');
    }
    
  } catch (error) {
    console.error('❌ Real-time check failed:', error.message);
  }
}

// Run real-time check
checkPoolRealTime();