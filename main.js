// =======================
// データ
// =======================

let items = [
    { id: 1, label: "A", weight: 3, force: false },
    { id: 2, label: "B", weight: 1, force: false },
    { id: 3, label: "C", weight: 2, force: false }
  ];

  const COLORS = [
    "#ff7675",
    "#74b9ff",
    "#55efc4",
    "#ffeaa7",
    "#a29bfe",
    "#fd79a8"
  ];
  
  // =======================
  // DOM
  // =======================
  
  const rouletteScreen = document.getElementById("rouletteScreen");
  const menuScreen = document.getElementById("menuScreen");
  
  const wrapper = document.getElementById("rouletteContainer");
  const canvas = document.getElementById("rouletteCanvas");
  const ctx = canvas.getContext("2d");
  
  const spinButton = document.getElementById("spinButton");
  const resultText = document.getElementById("resultText");
  
  // =======================
  // 画面切り替え
  // =======================
  
  document.getElementById("toRoulette").onclick = () => {
    rouletteScreen.style.display = "block";
    menuScreen.style.display = "none";
    drawRoulette();
  };
  
  document.getElementById("toMenu").onclick = () => {
    rouletteScreen.style.display = "none";
    menuScreen.style.display = "block";
    renderMenu();
  };
  
  // =======================
  // メニュー描画
  // =======================
  
  function renderMenu() {
    const tbody = document.querySelector("#itemTable tbody");
    tbody.innerHTML = "";
  
    items.forEach(item => {
      const tr = document.createElement("tr");
  
      tr.innerHTML = `
        <td><input value="${item.label}"></td>
        <td><input type="number" min="1" value="${item.weight}"></td>
        <td><input type="checkbox" ${item.force ? "checked" : ""}></td>
        <td><button>✕</button></td>
      `;
  
      const [labelInput, weightInput, forceInput] =
        tr.querySelectorAll("input");
  
      labelInput.oninput = e => item.label = e.target.value;
      weightInput.oninput = e => {
        item.weight = Math.max(1, Number(e.target.value));
        drawRoulette();
      };
      forceInput.onchange = e => item.force = e.target.checked;
  
      tr.querySelector("button").onclick = () => {
        items = items.filter(i => i.id !== item.id);
        renderMenu();
        drawRoulette();
      };
  
      tbody.appendChild(tr);
    });
  }
  
  document.getElementById("addItem").onclick = () => {
    items.push({
      id: Date.now(),
      label: "新項目",
      weight: 1,
      force: false
    });
    renderMenu();
    drawRoulette();
  };
  
  // =======================
  // ルーレット描画
  // =======================
  
  //ルーレットをランダム色にする時は使う
  function randomColor(seed) {
    const hue = (seed * 47) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  }
  
  function drawRoulette() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    const total = items.reduce((s, i) => s + i.weight, 0);
    let startAngle = -Math.PI / 2; // 12時方向開始
  
    items.forEach(item => {
      const angle = (item.weight / total) * Math.PI * 2;
  
      ctx.beginPath();
      ctx.moveTo(150, 150);
      ctx.arc(150, 150, 150, startAngle, startAngle + angle);
      ctx.closePath();
      
      //ctx.fillStyle = randomColor(item.id);
      ctx.fillStyle = COLORS[item.id % COLORS.length];
      ctx.fill();
  
      startAngle += angle;
    });
  }
  
  // =======================
  // 回転・当選判定
  // =======================
  
  let currentRotation = 0;
  let isSpinning = false;

  spinButton.onclick = () => {
    if (isSpinning || items.length === 0) return;
    isSpinning = true;
  
    const extraRotations = 360 * 5;
    const ranges = getItemAngleRanges(items);
  
    let targetAngle;
  
    const forcedItems = items.filter(i => i.force);
  
    if (forcedItems.length > 0) {
      const forcedItem =
        forcedItems[Math.floor(Math.random() * forcedItems.length)];
  
      const range = ranges.find(r => r.item === forcedItem);
  
      targetAngle =
        range.start + Math.random() * (range.end - range.start);
    } else {
      targetAngle = Math.random() * 360;
    }
  
    // ★ここが修正ポイント
    const currentAngle = currentRotation % 360;
    const delta =
      (360 - currentAngle + targetAngle) % 360;
  
    const targetRotation =
      currentRotation +
      extraRotations +
      delta;
  
    wrapper.style.transition =
      "transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)";
    wrapper.style.transform =
      `rotate(${targetRotation}deg)`;
  
    currentRotation = targetRotation;
  
    setTimeout(() => {
      const stopAngle = getStopAngle(currentRotation+180);
      const winner = getWinnerByAngle(stopAngle);
  
      resultText.textContent =
        winner ? `結果: ${winner.label}` : "結果なし";
  
      isSpinning = false;
    }, 4000);
  };
  
  
  
  // =======================
  // 角度 → 当選項目
  // =======================
  
  function getStopAngle(rotation) {
    return (360 - (rotation % 360)) % 360;
  }
  
  function getWinnerByAngle(angle) {
    const total = items.reduce((s, i) => s + i.weight, 0);
    let current = 0;
  
    for (const item of items) {
      const range = (item.weight / total) * 360;
      if (angle >= current && angle < current + range) {
        return item;
      }
      current += range;
    }
    return null;
  }

  //回転角度いじる
  function getItemAngleRanges(items) {
    const total = items.reduce((s, i) => s + i.weight, 0);
    let current = 0;
    const ranges = [];
  
    for (const item of items) {
      const range = (item.weight / total) * 360;
      ranges.push({
        item,
        start: current,
        end: current + range
      });
      current += range;
    }
  
    return ranges;
  }

  function getForceCandidates() {
    return items.filter(i => i.force);
  }
  
  
  // 初期描画
  drawRoulette();
  