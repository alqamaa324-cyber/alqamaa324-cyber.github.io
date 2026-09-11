// Monetag Direct Ad Links (Rotating Pool)
const MONETAG_DIRECT_LINKS = [
  "https://omg10.com/4/11770859",
  "https://omg10.com/4/11771215",
  "https://omg10.com/4/11771218",
  "https://omg10.com/4/11771221"
];

let userBalance = parseInt(localStorage.getItem("userBalance")) || 0;
let currentReward = 0;
let taskStartTime = 0;
let taskCheckInterval = null;
const REQUIRED_SECONDS = 10;

// Lucky Wheel Variables
const WHEEL_PRIZES = [1, 5, 2, 10, 0, 3];
const WHEEL_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
let isSpinning = false;
let currentRotation = 0;

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
  alert("🎉 Badhai ho! +10 Coins credit ho gaye.");
}

// Android App Safe Ad Task Starter
function startAdTask(reward) {
  currentReward = reward;
  taskStartTime = Date.now();

  const overlay = document.getElementById("ad-overlay-container");
  const claimBtn = document.getElementById("ad-close-btn");
  const timerBadge = document.getElementById("ad-timer-badge");
  const countdownNum = document.getElementById("countdown-num");

  const randomIndex = Math.floor(Math.random() * MONETAG_DIRECT_LINKS.length);
  const selectedLink = MONETAG_DIRECT_LINKS[randomIndex] + "?_cb=" + Date.now();

  if (overlay) overlay.style.display = "flex";
  if (claimBtn) claimBtn.style.display = "none";
  if (timerBadge) timerBadge.style.display = "inline-block";
  if (countdownNum) countdownNum.innerText = REQUIRED_SECONDS + "s";

  try {
    const adWindow = window.open(selectedLink, "_blank");
    if (!adWindow || adWindow.closed || typeof adWindow.closed === "undefined") {
      window.location.href = selectedLink;
    }
  } catch (e) {
    window.location.href = selectedLink;
  }

  clearInterval(taskCheckInterval);
  taskCheckInterval = setInterval(checkAdTimeProgress, 500);
}

function checkAdTimeProgress() {
  if (!taskStartTime) return;

  const secondsPassed = Math.floor((Date.now() - taskStartTime) / 1000);
  const secondsRemaining = REQUIRED_SECONDS - secondsPassed;

  const countdownNum = document.getElementById("countdown-num");
  const timerBadge = document.getElementById("ad-timer-badge");
  const claimBtn = document.getElementById("ad-close-btn");

  if (secondsRemaining > 0) {
    if (countdownNum) countdownNum.innerText = secondsRemaining + "s";
  } else {
    clearInterval(taskCheckInterval);
    if (timerBadge) timerBadge.style.display = "none";
    if (claimBtn) claimBtn.style.display = "block";
  }
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && taskStartTime) {
    checkAdTimeProgress();
  }
});

window.addEventListener("focus", () => {
  if (taskStartTime) {
    checkAdTimeProgress();
  }
});

function finishAndClaimReward() {
  clearInterval(taskCheckInterval);
  taskStartTime = 0;
  
  const overlay = document.getElementById("ad-overlay-container");
  if (overlay) overlay.style.display = "none";

  if (currentReward > 0) {
    userBalance += currentReward;
    updateBalanceDisplay();
    alert(`🎉 Badhai ho! +${currentReward} Coins wallet mein credit ho gaye.`);
    currentReward = 0;
  }
}

// Spin Wheel Logic
function getDailySpins() {
  const savedDate = localStorage.getItem("spinDate");
  const today = new Date().toDateString();
  if (savedDate !== today) {
    localStorage.setItem("spinDate", today);
    localStorage.setItem("spinsCount", "0");
    return 0;
  }
  return parseInt(localStorage.getItem("spinsCount")) || 0;
}

function updateSpinUI() {
  const spinsDone = getDailySpins();
  const spinsLeft = Math.max(0, 3 - spinsDone);
  const badge = document.getElementById("spins-left-badge");
  const btn = document.getElementById("btn-spin");

  if (badge) badge.innerText = `Spins Left: ${spinsLeft}/3`;
  if (!btn) return;

  if (spinsLeft === 0) {
    btn.innerText = "Kal Wapas Aayein (Limit Reached)";
    btn.disabled = true;
    btn.style.opacity = "0.5";
  } else if (spinsDone === 0) {
    btn.innerText = "Spin Now (Free)";
    btn.disabled = false;
    btn.style.opacity = "1";
  } else {
    btn.innerText = `Watch Ad & Spin (${spinsLeft} Left)`;
    btn.disabled = false;
    btn.style.opacity = "1";
  }
}

function drawWheel() {
  const canvas = document.getElementById("wheelCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const numSegments = WHEEL_PRIZES.length;
  const arcSize = (2 * Math.PI) / numSegments;
  const radius = canvas.width / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < numSegments; i++) {
    const angle = i * arcSize;
    ctx.beginPath();
    ctx.fillStyle = WHEEL_COLORS[i];
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, angle, angle + arcSize);
    ctx.lineTo(radius, radius);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(angle + arcSize / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(WHEEL_PRIZES[i] === 0 ? "0" : `+${WHEEL_PRIZES[i]} C`, radius - 20, 6);
    ctx.restore();
  }

  // Center Circle
  ctx.beginPath();
  ctx.arc(radius, radius, 25, 0, 2 * Math.PI);
  ctx.fillStyle = "#0f172a";
  ctx.fill();
  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function handleSpinAction() {
  if (isSpinning) return;
  const spinsDone = getDailySpins();

  if (spinsDone >= 3) {
    alert("Aaj ke 3 spins khatam ho gaye hain! Kal dobara aana.");
    return;
  }

  if (spinsDone > 0) {
    startAdTask(0);
    const originalClaim = finishAndClaimReward;
    window.finishAndClaimReward = function() {
      originalClaim();
      window.finishAndClaimReward = originalClaim;
      executeSpin();
    };
  } else {
    executeSpin();
  }
}

function executeSpin() {
  isSpinning = true;
  const canvas = document.getElementById("wheelCanvas");
  const winningIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
  const segmentAngle = 360 / WHEEL_PRIZES.length;
  
  const targetAngle = 360 - (winningIndex * segmentAngle + segmentAngle / 2) + 270;
  const totalSpins = 360 * 5; 
  currentRotation += totalSpins + (targetAngle - (currentRotation % 360));

  canvas.style.transition = "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)";
  canvas.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    isSpinning = false;
    const wonCoins = WHEEL_PRIZES[winningIndex];
    
    let spinsDone = getDailySpins() + 1;
    localStorage.setItem("spinsCount", spinsDone.toString());
    updateSpinUI();

    if (wonCoins > 0) {
      userBalance += wonCoins;
      updateBalanceDisplay();
      alert(`🎉 Mubarak ho! Wheel se aapne jeete ${wonCoins} Coins!`);
    } else {
      alert("Better luck next time! Koi coin nahi mila.");
    }
  }, 4200);
}

function copyReferCode() {
  const codeEl = document.getElementById("refer-code");
  const code = codeEl ? codeEl.innerText : "POCKET89";
  navigator.clipboard.writeText(code);
  alert("Referral code copy ho gaya: " + code);
}

function shareReferral() {
  const codeEl = document.getElementById("refer-code");
  const code = codeEl ? codeEl.innerText : "POCKET89";
  const text = encodeURIComponent(`Pocket Rewards app par tasks aur ads se paise kamao! Mera referral code: ${code} \nLink: ${window.location.href}`);
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
  const upiInput = document.getElementById("upi-id");
  const upi = upiInput ? upiInput.value.trim() : "";
  
  if (!upi || !upi.includes("@")) {
    alert("Kripya sahi UPI ID enter karein (e.g. mobile@upi)");
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
  drawWheel();
  updateSpinUI();
});

// PWA Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => {
        console.log("SW Registered:", reg.scope);
      })
      .catch((err) => {
        console.log("SW Fail:", err);
      });
  });
}
