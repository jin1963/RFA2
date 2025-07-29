let web3, account, contract, usdt;

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];

    const chainId = await web3.eth.getChainId();
    if (chainId !== 56) {
      alert("⚠️ กรุณาเปลี่ยน Network เป็น BNB Smart Chain (Chain ID 56)");
      return;
    }

    contract = new web3.eth.Contract(contractABI, contractAddress);
    usdt = new web3.eth.Contract(usdtABI, usdtAddress);

    document.getElementById("walletAddress").innerText = "✅ " + account;
    document.getElementById("refSection").style.display = "block";
    document.getElementById("refLink").value = window.location.origin + window.location.pathname + "?ref=" + account;

    loadUserInfo();
  } else {
    alert("⚠️ กรุณาติดตั้ง MetaMask หรือ Bitget Wallet");
  }
}

async function checkNetwork() {
  const currentChainId = await web3.eth.getChainId();
  if (currentChainId !== 56) {
    alert("⚠️ กรุณาเปลี่ยน Network เป็น BNB Smart Chain (Chain ID 56)");
    return false;
  }
  return true;
}

async function copyRefLink() {
  const refInput = document.getElementById("refLink");
  refInput.select();
  document.execCommand("copy");
  alert("📋 คัดลอกลิงก์แล้ว!");
}

async function registerReferrer() {
  const ref = document.getElementById("refInput").value;
  if (!ref || ref.toLowerCase() === account.toLowerCase()) {
    document.getElementById("status").innerText = "❌ ไม่สามารถแนะนำตนเองได้";
    return;
  }
  if (!(await checkNetwork())) return;

  try {
    await contract.methods.setReferrer(ref).send({ from: account });
    document.getElementById("status").innerText = "✅ สมัคร Referrer สำเร็จ";
  } catch (e) {
    document.getElementById("status").innerText = "❌ สมัครไม่สำเร็จ: " + e.message;
  }
}

async function buyAndStake() {
  const amount = document.getElementById("usdtAmount").value;
  const minKJC = document.getElementById("amountOutMin").value;
  if (!amount || !minKJC) {
    alert("⚠️ กรุณาระบุจำนวนให้ครบ");
    return;
  }
  if (!(await checkNetwork())) return;

  const usdtAmount = web3.utils.toWei(amount, "mwei");
  const amountOutMin = web3.utils.toWei(minKJC, "ether");

  try {
    await usdt.methods.approve(contractAddress, usdtAmount).send({ from: account });
    await contract.methods.buyAndStake(usdtAmount, amountOutMin).send({ from: account });
    document.getElementById("status").innerText = "✅ ซื้อและ Stake สำเร็จ";
    loadUserInfo();
  } catch (e) {
    document.getElementById("status").innerText = "❌ ผิดพลาด: " + e.message;
  }
}

async function claimReferral() {
  if (!(await checkNetwork())) return;

  try {
    await contract.methods.claimReferralReward().send({ from: account });
    document.getElementById("status").innerText = "✅ เคลมรางวัลแนะนำสำเร็จ";
    loadUserInfo();
  } catch (e) {
    document.getElementById("status").innerText = "❌ เคลมรางวัลแนะนำล้มเหลว";
  }
}

async function claimStaking() {
  if (!(await checkNetwork())) return;

  try {
    await contract.methods.claimStakingReward().send({ from: account });
    document.getElementById("status").innerText = "✅ เคลมรางวัล Stake สำเร็จ";
    loadUserInfo();
  } catch (e) {
    document.getElementById("status").innerText = "❌ เคลมรางวัล Stake ล้มเหลว";
  }
}

async function loadUserInfo() {
  try {
    const stake = await contract.methods.stakedAmount(account).call();
    const reward = await contract.methods.referralReward(account).call();
    document.getElementById("yourStake").innerText = "ยอด Stake: " + web3.utils.fromWei(stake, "ether") + " KJC";
    document.getElementById("yourReward").innerText = "รางวัลแนะนำ: " + web3.utils.fromWei(reward, "ether") + " KJC";
  } catch (e) {
    console.error("โหลดข้อมูลไม่ได้:", e);
  }
}
