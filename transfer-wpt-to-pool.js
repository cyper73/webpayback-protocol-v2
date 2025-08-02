#!/usr/bin/env node
/**
 * 🔄 TRASFERIMENTO MANUALE WPT AL POOL
 * Trasferisce WPT dal wallet injection al pool USDT/WPT
 */

const { ethers } = require('ethers');

async function transferWPTToPool() {
  try {
    console.log('🔄 TRASFERIMENTO MANUALE WPT AL POOL POLYGON');
    console.log('══════════════════════════════════════════');
    
    // Configuration
    const WPT_CONTRACT = '0x9408f17a8B4666f8cb8231BA213DE04137dc3825';
    const TARGET_POOL = '0xe021e5817E8867D7CeA10f63BC47E118f3aB9E4A'; // USDT/WPT Pool
    const FROM_WALLET = ethers.utils.getAddress('0x742d35Cc6634C0532925a3b8D7a6d88b86e5f9a8'); // Sistema wallet
    
    console.log(`📋 Configurazione:`);
    console.log(`   WPT Contract: ${WPT_CONTRACT}`);
    console.log(`   Target Pool: ${TARGET_POOL}`);
    console.log(`   From Wallet: ${FROM_WALLET}`);
    console.log('');
    
    // Setup provider
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log(`🔐 Wallet connesso: ${wallet.address}`);
    console.log('');
    
    // WPT contract ABI
    const wptABI = [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function balanceOf(address owner) view returns (uint256)',
      'function transferFrom(address from, address to, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ];
    
    const wptContract = new ethers.Contract(WPT_CONTRACT, wptABI, wallet);
    
    // Check current balance del wallet sistema
    console.log('🔍 Controllo balance del wallet sistema...');
    const systemBalance = await wptContract.balanceOf(FROM_WALLET);
    const systemBalanceFormatted = ethers.utils.formatUnits(systemBalance, 18);
    console.log(`💰 WPT nel wallet sistema: ${systemBalanceFormatted} WPT`);
    
    // Check current balance del pool
    const poolBalance = await wptContract.balanceOf(TARGET_POOL);
    const poolBalanceFormatted = ethers.utils.formatUnits(poolBalance, 18);
    console.log(`🏦 WPT già nel pool: ${poolBalanceFormatted} WPT`);
    
    // Check current balance del founder wallet
    const founderBalance = await wptContract.balanceOf(wallet.address);
    const founderBalanceFormatted = ethers.utils.formatUnits(founderBalance, 18);
    console.log(`👤 WPT nel founder wallet: ${founderBalanceFormatted} WPT`);
    console.log('');
    
    if (systemBalance.gt(0)) {
      console.log('⚠️  ATTENZIONE: Trovati WPT nel wallet sistema!');
      console.log(`📦 Quantità da trasferire: ${systemBalanceFormatted} WPT`);
      
      // Check allowance
      const allowance = await wptContract.allowance(FROM_WALLET, wallet.address);
      console.log(`🔐 Allowance attuale: ${ethers.utils.formatUnits(allowance, 18)} WPT`);
      
      if (allowance.gte(systemBalance)) {
        console.log('✅ Allowance sufficiente per il trasferimento');
        console.log('🔄 Esecuzione transferFrom...');
        
        // Get current gas price
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice.mul(120).div(100); // 20% extra
        
        console.log(`⛽ Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei`);
        
        const transferTx = await wptContract.transferFrom(FROM_WALLET, TARGET_POOL, systemBalance, {
          gasLimit: 200000,
          gasPrice: gasPrice
        });
        
        console.log(`📝 Transaction Hash: ${transferTx.hash}`);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await transferTx.wait();
        
        console.log('');
        console.log('🎯 TRASFERIMENTO COMPLETATO!');
        console.log(`   Block Number: ${receipt.blockNumber}`);
        console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
        console.log(`   Amount Transferred: ${systemBalanceFormatted} WPT`);
        console.log(`   From: ${FROM_WALLET}`);
        console.log(`   To: ${TARGET_POOL}`);
        
        // Verify final balances
        console.log('');
        console.log('🔍 Verifica bilanci finali...');
        const finalSystemBalance = await wptContract.balanceOf(FROM_WALLET);
        const finalPoolBalance = await wptContract.balanceOf(TARGET_POOL);
        
        console.log(`💰 Wallet sistema (finale): ${ethers.utils.formatUnits(finalSystemBalance, 18)} WPT`);
        console.log(`🏦 Pool balance (finale): ${ethers.utils.formatUnits(finalPoolBalance, 18)} WPT`);
        
      } else {
        console.log('❌ Allowance insufficiente');
        console.log(`   Richiesta: ${systemBalanceFormatted} WPT`);
        console.log(`   Disponibile: ${ethers.utils.formatUnits(allowance, 18)} WPT`);
      }
      
    } else if (founderBalance.gt(0)) {
      console.log('🎯 Trasferimento diretto dal founder wallet al pool');
      
      // Determina quanto trasferire (1-2 milioni come pianificato)
      const transferAmount = ethers.utils.parseUnits('1000000', 18); // 1 milione WPT
      const transferAmountFormatted = ethers.utils.formatUnits(transferAmount, 18);
      
      console.log(`📦 Trasferimento: ${transferAmountFormatted} WPT`);
      
      // Get current gas price
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice.mul(120).div(100); // 20% extra
      
      const transferTx = await wptContract.transfer(TARGET_POOL, transferAmount, {
        gasLimit: 150000,
        gasPrice: gasPrice
      });
      
      console.log(`📝 Transaction Hash: ${transferTx.hash}`);
      console.log('⏳ Waiting for confirmation...');
      
      const receipt = await transferTx.wait();
      
      console.log('');
      console.log('🎯 TRASFERIMENTO COMPLETATO!');
      console.log(`   Amount: ${transferAmountFormatted} WPT`);
      console.log(`   To Pool: ${TARGET_POOL}`);
      console.log(`   Block: ${receipt.blockNumber}`);
      
    } else {
      console.log('ℹ️  Nessun WPT da trasferire trovato nei wallet controllati');
    }
    
  } catch (error) {
    console.error('❌ Trasferimento fallito:', error.message);
    if (error.reason) console.error('💥 Reason:', error.reason);
    process.exit(1);
  }
}

// Esegui trasferimento
transferWPTToPool();