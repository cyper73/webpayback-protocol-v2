#!/usr/bin/env node
/**
 * 🔍 VERIFICA DIRETTA POOL USDT/WPT
 * Controlla cosa c'è veramente nella pool
 */

const { ethers } = require('ethers');

async function verifyPoolContents() {
  try {
    console.log('🔍 VERIFICA DIRETTA CONTENUTO POOL...');
    
    // Setup provider
    const alchemyKey = process.env.ALCHEMY_API_KEY;
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`);
    
    // Pool USDT/WPT V2
    const POOL_ADDRESS = '0xe021e5817E8867D7CeA10f63BC47E118f3aB9E4A';
    const USDT_CONTRACT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
    const WPT_CONTRACT = '0x9408f17a8B4666f8cb8231BA213DE04137dc3825';
    
    const erc20ABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)'
    ];
    
    const usdtContract = new ethers.Contract(USDT_CONTRACT, erc20ABI, provider);
    const wptContract = new ethers.Contract(WPT_CONTRACT, erc20ABI, provider);
    
    console.log(`📋 Pool verificata: ${POOL_ADDRESS}`);
    console.log('');
    
    // Get balances
    const [usdtBalance, wptBalance, usdtDecimals, wptDecimals] = await Promise.all([
      usdtContract.balanceOf(POOL_ADDRESS),
      wptContract.balanceOf(POOL_ADDRESS),
      usdtContract.decimals(),
      wptContract.decimals()
    ]);
    
    // Format balances
    const usdtFormatted = ethers.utils.formatUnits(usdtBalance, usdtDecimals);
    const wptFormatted = ethers.utils.formatUnits(wptBalance, wptDecimals);
    
    console.log('💰 CONTENUTO REALE POOL:');
    console.log(`   USDT: ${usdtFormatted} USDT`);
    console.log(`   WPT: ${wptFormatted} WPT`);
    console.log('');
    console.log('📊 DETTAGLI RAW:');
    console.log(`   USDT raw: ${usdtBalance.toString()} (decimals: ${usdtDecimals})`);
    console.log(`   WPT raw: ${wptBalance.toString()} (decimals: ${wptDecimals})`);
    
    // Check if tokens are actually there
    console.log('');
    console.log('✅ VERIFICHE:');
    if (parseFloat(usdtFormatted) > 0) {
      console.log('✅ USDT presente nella pool');
    } else {
      console.log('❌ USDT non presente nella pool');
    }
    
    if (parseFloat(wptFormatted) > 0) {
      console.log('✅ WPT presente nella pool');
    } else {
      console.log('❌ WPT non presente nella pool');
    }
    
    // Check pool contract code
    const poolCode = await provider.getCode(POOL_ADDRESS);
    console.log('');
    console.log('🔍 VERIFICA CONTRATTO POOL:');
    if (poolCode === '0x') {
      console.log('❌ Pool non è un contratto valido');
    } else {
      console.log('✅ Pool è un contratto valido');
      console.log(`   Bytecode length: ${poolCode.length} chars`);
    }
    
    return { usdtFormatted, wptFormatted };
    
  } catch (error) {
    console.error('❌ Errore verifica pool:', error.message);
    return null;
  }
}

// Execute
verifyPoolContents().then(result => {
  if (result) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});