// --- Firebase Config & Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyReplaceIfUsingLiveAuth",
  authDomain: "pocketrewardsapp-46e26.firebaseapp.com",
  databaseURL: "https://pocketrewardsapp-46e26-default-rtdb.firebaseio.com",
  projectId: "pocketrewardsapp-46e26",
  storageBucket: "pocketrewardsapp-46e26.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Monetag Direct Ad Links (Rotating Pool)
const MONETAG_DIRECT_LINKS = [
  "https://omg10.com/4/11770859",
  "https://omg10.com/4/11771215",
  "https://omg10.com/4/11771218",
  "https://omg10.com/4/11771221"
];

let userBalance = parseInt(localStorage.getItem("userBalance")) || 0;
let adRewardAmount = 0;
let adInterval = null;

function updateBalanceDisplay() {
  const headerBal = document.getElementById("header-balance");
  const walletBal = document.getElementById("wallet-balance");
  if (headerBal) headerBal.innerText = userBalance;
  if (walletBal) walletBal.innerText = userBalance;
  localStorage.setItem("userBalance", userBalance);
}

function switchTab(tabId, element) {
  document.querySelectorAll(".tab-view").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
  
  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.add("active");
  if (element) element.classList.add("active");
}

function claimDailyBonus() {
  const lastClaim = localStorage.getItem("lastClaimDate");
  const today = new Date().toDateString();

  if (lastClaim === today) {
    alert("Aap aaj ka Daily Reward claim kar chuke hain!");
    return;
  }

  userBalance += 10;
  localStorage.setItem("lastClaimDate", today);
  updateBalanceDisplay();
  alert("Badhai ho! +10 Coins credit ho gaye.");
}

function openAdModal(reward, taskType) {
  adRewardAmount = reward;
  const modal = document.getElementById("ad-modal");
  const iframe = document.getElementById("ad-iframe");
  const closeBtn = document.getElementById("ad-close-btn");
  const timerText = document.getElementById("ad-timer-text");

  // Har bar 4 direct links mein se random link select karega
  const randomIndex = Math.floor(Math.random() * MONETAG_DIRECT_LINKS.length);
  const selectedLink = MONETAG_DIRECT_LINKS[randomIndex];

  // Unique parameter jodne se ad network har baar naya ad fetch karta hai
  const freshAdUrl = selectedLink + "?_cb=" + new Date().getTime();

  // Naye tab me ad open karega taaki video/interactive offer block na ho
  window.open(freshAdUrl, "_blank");

  // App ke andar timer modal show karega
  modal.style.display = "flex";
  iframe.src = "about:blank";
  closeBtn.classList.add("hidden");

  let timeLeft = 10;
  timerText.innerHTML = `<i class="fa-solid fa-clock"></i> Reward in: <b>${timeLeft}s</b>`;

  clearInterval(adInterval);
  adInterval = setInterval(() => {
    timeLeft--;
    timerText.innerHTML = `<i class="fa-solid fa-clock"></i> Reward in: <b>${timeLeft}s</b>`;

    if (timeLeft <= 0) {
      clearInterval(adInterval);
      timerText.innerHTML = `<i class="fa-solid fa-circle-check"></i> Reward Ready!`;
      closeBtn.classList.remove("hidden");
    }
  }, 1000);
}

function closeAdModal(claimed) {
  clearInterval(adInterval);
  const modal = document.getElementById("ad-modal");
  const iframe = document.getElementById("ad-iframe");

  iframe.src = "about:blank";
  modal.style.display = "none";

  if (claimed && adRewardAmount > 0) {
    userBalance += adRewardAmount;
    updateBalanceDisplay();
    alert(`Reward Claimed! +${adRewardAmount} Coins jode gaye.`);
    adRewardAmount = 0;
  }
}

function copyReferCode() {
  const code = document.getElementById("refer-code").innerText;
  navigator.clipboard.writeText(code);
  alert("Referral code copy ho gaya: " + code);
}

function shareReferral() {
  const code = document.getElementById("refer-code").innerText;
  const text = encodeURIComponent(`Pocket Rewards app par games aur tasks se paise kamao! Mera code use karo: ${code} \nLink: ${window.location.href}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
}

let selectedCoins = 1000;
let selectedRupees = 5;

function selectAmount(coins, rupees, btn) {
  selectedCoins = coins;
  selectedRupees = rupees;
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

function requestPayout() {
  const upi = document.getElementById("upi-id").value.trim();
  if (!upi || !upi.includes("@")) {
    alert("Kripya sahi UPI ID enter karein.");
    return;
  }

  if (userBalance < selectedCoins) {
    alert(`Insufficient balance! ₹${selectedRupees} ke liye kam se kam ${selectedCoins} coins hone chahiye.`);
    return;
  }

  userBalance -= selectedCoins;
  updateBalanceDisplay();
  alert(`Withdrawal request lag gayi hai ₹${selectedRupees} ke liye! (UPI: ${upi})`);
}

document.addEventListener("DOMContentLoaded", () => {
  updateBalanceDisplay();
  const authStatus = document.getElementById("auth-status");
  if (authStatus) authStatus.innerText = "Online";
});
