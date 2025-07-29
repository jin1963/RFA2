let web3, account, contract, usdt;

async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    try {
      if (!window.web3) {
        web3 = new Web3(window.ethereum);
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();

      if (!accounts || accounts.length === 0) {
        alert("⚠️ ไม่พบบัญชีผู้ใช้งาน");
        return;
      }

      account = accounts[0];

      const chainId = await web3.eth.getChainId();
      if (chainId !== 56) {
        alert("⚠️ กรุณาเปลี่ยน Network เป็น BNB Smart Chain (Chain ID 56)");
        return;
      }

      // Load contracts
      contract = new web3.eth.Contract(contractABI, contractAddress);
      usdt = new web3.eth.Contract(usdtABI, usdtAddress);

      // Update UI
      document.getElementById("walletAddress").innerText = "✅ " + account;
      document.getElementById("refSection").style.display = "block";
      document.getElementById("refLink").value =
        window.location.origin + window.location.pathname + "?ref=" + account;

      // Event handler
      window.ethereum.on("accountsChanged", () => window.location.reload());
      window.ethereum.on("chainChanged", () => window.location.reload());

      loadUserInfo();
    } catch (err) {
      console.error("เชื่อมต่อกระเป๋าล้มเหลว:", err);
      alert("❌ ไม่สามารถเชื่อมต่อกระเป๋า: " + err.message);
    }
  } else {
    alert("⚠️ ไม่พบกระเป๋า กรุณาติดตั้ง MetaMask หรือ Bitget Wallet");
  }
}
