#!/usr/bin/env node

// Monitor real-time per rilevare accesso da smartphone
const BASE_URL = 'http://localhost:5000/api';

let initialRewardCount = 0;
let monitoringActive = true;

async function getCurrentRewardCount() {
  try {
    const response = await fetch(`${BASE_URL}/rewards`);
    const rewards = await response.json();
    return rewards.length;
  } catch (error) {
    console.log('Error fetching rewards:', error.message);
    return 0;
  }
}

async function checkForNewRewards() {
  const currentCount = await getCurrentRewardCount();
  
  if (currentCount > initialRewardCount) {
    console.log('\n🎉 NUOVO REWARD RILEVATO!');
    console.log(`Rewards: ${initialRewardCount} → ${currentCount}`);
    
    try {
      const response = await fetch(`${BASE_URL}/rewards`);
      const rewards = await response.json();
      const latestReward = rewards[rewards.length - 1];
      
      console.log('📊 Dettagli ultimo reward:');
      console.log(`   Creator ID: ${latestReward.creatorId}`);
      console.log(`   Amount: ${latestReward.amount} WPT`);
      console.log(`   Status: ${latestReward.status}`);
      console.log(`   Transaction: ${latestReward.transactionHash}`);
      console.log(`   Timestamp: ${new Date(latestReward.createdAt).toLocaleString()}`);
      
      // Verifica se è per il Creator 27 (canale YouTube)
      if (latestReward.creatorId === 27) {
        console.log('\n✅ ACCESSO SMARTPHONE RILEVATO CON SUCCESSO!');
        console.log('Il sistema channel monitoring ha funzionato perfettamente!');
      }
      
    } catch (error) {
      console.log('Error fetching reward details:', error.message);
    }
    
    initialRewardCount = currentCount;
  }
}

async function startMonitoring() {
  console.log('📱 MONITORING ATTIVO PER ACCESSO DA SMARTPHONE');
  console.log('='.repeat(50));
  
  initialRewardCount = await getCurrentRewardCount();
  console.log(`Starting reward count: ${initialRewardCount}`);
  console.log('\n🔍 In attesa di accesso Gemini da smartphone...');
  console.log('   Canale: @WEBPAYBACK-PROTOCOL');
  console.log('   URL: https://www.youtube.com/watch?v=4AYDSzfgPNY');
  console.log('   Creator ID monitorato: 27');
  console.log('\nCtrl+C per interrompere monitoring\n');
  
  const interval = setInterval(async () => {
    if (!monitoringActive) {
      clearInterval(interval);
      return;
    }
    
    process.stdout.write('.');
    await checkForNewRewards();
  }, 2000); // Check ogni 2 secondi
  
  // Gestisci Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Monitoring interrotto');
    monitoringActive = false;
    clearInterval(interval);
    process.exit(0);
  });
}

startMonitoring().catch(console.error);