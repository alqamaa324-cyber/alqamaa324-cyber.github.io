// Monetag Direct Ad Links (Rotating Pool)
const MONETAG_DIRECT_LINKS = [
  "https://omg10.com/4/11770859",
  "https://omg10.com/4/11771215",
  "https://omg10.com/4/11771218",
  "https://omg10.com/4/11771221"
];

let userBalance = parseInt(localStorage.getItem("userBalance")) || 0;
let currentReward = 0;
let countdownTimer = null;

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

// Fixed Ad Task Flow: Sticky Header with 10s Timer & Auto-Claim Button
function startAdTask(reward) {
  currentReward = reward;
  const overlay = document.getElementById("ad-overlay-container");
  const frame = document.getElementById("monetag-frame");
  const closeBtn = document.getElementById("ad-close-btn");
  const countdownNum = document.getElementById("countdown-num");
  const timerBadge = document.getElementById("ad-timer-badge");

  // Har click par 4 direct links me se random link pick hoga with cache buster
  const randomIndex = Math.floor(Math.random() * MONETAG_DIRECT_LINKS.length);
  const selectedLink = MONETAG_DIRECT_LINKS[randomIndex] + "?_cb=" + Date.now();

  // Overlay aur Sticky Header show karein
  overlay.style.display = "flex";
  closeBtn.style.display = "none";
  timerBadge.style.display = "flex";
  frame.src = selectedLink;

  let seconds = 10;
  countdownNum.innerText = seconds + "s";

  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    seconds--;
    if (seconds > 0) {
      countdownNum.innerText = seconds + "s";
    } else {
      clearInterval(countdownTimer);
      countdownNum.innerText = "Completed!";
      timerBadge.style.display = "none";
      closeBtn.style.display = "block"; // 10 second pure hote hi bada Green button aayega
    }
  }, 1000);
}

function finishAndClaimReward() {
  clearInterval(countdownTimer);
  const overlay = document.getElementById("ad-overlay-container");
  const frame = document.getElementById("monetag-frame");

  frame.src = "about:blank";
  overlay.style.display = "none";

  if (currentReward > 0) {
    userBalance += currentReward;
    updateBalanceDisplay();
    alert(`🎉 Shandaar! +${currentReward} Coins aapke wallet mein jud gaye.`);
    currentReward = 0;
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
});
