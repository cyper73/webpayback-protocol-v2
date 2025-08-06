#!/usr/bin/env node
/**
 * 🔍 TEST AUTENTICO POOL USDT/WPT
 * Verifica se i token sono veramente nella pool
 */

import { ethers } from 'ethers';

async function testAuthenticPool() {
  try {
    console.log('🔍 TEST AUTENTICO POOL USDT/WPT...');
    
    // Setup provider
    const alchemyKey = process.env.ALCHEMY_API_KEY;
    const provider = new ethers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`);
    
    // Pool USDT/WPT V2
    const POOL_ADDRESS = process.env.POLYGON_PRIMARY_POOL_ADDRESS || '0xe021e5817E8867D7CeA10f63BC47E118f3aB9E4A';
    const USDT_CONTRACT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'; // Polygon USDT (standard)
    const WPT_CONTRACT = process.env.POLYGON_TOKEN_ADDRESS || '0x9408f17a8B4666f8cb8231BA213DE04137dc3825';
    
    const erc20ABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function name() view returns (string)'
    ];
    
    const usdtContract = new ethers.Contract(USDT_CONTRACT, erc20ABI, provider);
    const wptContract = new ethers.Contract(WPT_CONTRACT, erc20ABI, provider);
    
    console.log(`📋 Pool testata: ${POOL_ADDRESS}`);
    console.log(`📋 USDT contract: ${USDT_CONTRACT}`);
    console.log(`📋 WPT contract: ${WPT_CONTRACT}`);
    console.log('');
    
    // Get token details
    const [usdtName, usdtSymbol, usdtDecimals] = await Promise.all([
      usdtContract.name(),
      usdtContract.symbol(), 
      usdtContract.decimals()
    ]);
    
    const [wptName, wptSymbol, wptDecimals] = await Promise.all([
      wptContract.name(),
      wptContract.symbol(),
      wptContract.decimals()
    ]);
    
    console.log('🔍 DETTAGLI TOKEN:');
    console.log(`   USDT: ${usdtName} (${usdtSymbol}) - ${usdtDecimals} decimals`);
    console.log(`   WPT: ${wptName} (${wptSymbol}) - ${wptDecimals} decimals`);
    console.log('');
    
    // Get balances in pool
    const [usdtBalance, wptBalance] = await Promise.all([
      usdtContract.balanceOf(POOL_ADDRESS),
      wptContract.balanceOf(POOL_ADDRESS)
    ]);
    
    // Format balances
    const usdtFormatted = ethers.formatUnits(usdtBalance, usdtDecimals);
    const wptFormatted = ethers.formatUnits(wptBalance, wptDecimals);
    
    console.log('💰 CONTENUTO REALE POOL:');
    console.log(`   USDT nella pool: ${usdtFormatted} USDT`);
    console.log(`   WPT nella pool: ${wptFormatted} WPT`);
    console.log('');
    console.log('📊 DETTAGLI RAW:');
    console.log(`   USDT raw: ${usdtBalance.toString()}`);
    console.log(`   WPT raw: ${wptBalance.toString()}`);
    
    console.log('');
    console.log('✅ RISULTATO VERIFICA:');
    
    if (parseFloat(usdtFormatted) > 0) {
      console.log(`✅ USDT presente: ${usdtFormatted} USDT`);
    } else {
      console.log('❌ USDT non presente nella pool');
    }
    
    if (parseFloat(wptFormatted) > 0) {
      console.log(`✅ WPT presente: ${wptFormatted} WPT`);
    } else {
      console.log('❌ WPT non presente nella pool');
    }
    
    // Check pool contract existence
    const poolCode = await provider.getCode(POOL_ADDRESS);
    console.log('');
    console.log('🔍 VERIFICA CONTRATTO:');
    if (poolCode === '0x') {
      console.log('❌ Indirizzo pool non è un contratto');
    } else {
      console.log('✅ Pool è un contratto valido');
      console.log(`   Bytecode: ${poolCode.length} caratteri`);
    }
    
    return { usdtFormatted, wptFormatted, poolExists: poolCode !== '0x' };
    
  } catch (error) {
    console.error('❌ Errore test pool:', error.message);
    return null;
  }
}

// Execute
testAuthenticPool().then(result => {
  if (result) {
    console.log('');
    console.log('🎯 CONCLUSIONE:');
    if (result.poolExists && (parseFloat(result.usdtFormatted) > 0 || parseFloat(result.wptFormatted) > 0)) {
      console.log('✅ Pool funzionante con token reali');
    } else {
      console.log('❌ Pool vuota o problematica');
    }
    process.exit(0);
  } else {
    process.exit(1);
  }
});