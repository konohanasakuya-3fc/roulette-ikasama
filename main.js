// =======================
// データ
// =======================

let items = [
    { id: 1, label: "A", weight: 3, force: false },
    { id: 2, label: "B", weight: 1, force: false },
    { id: 3, label: "C", weight: 2, force: false }
  ];
  
  // =======================
  // 画面切り替え
  // =======================
  
  const rouletteScreen = document.getElementById("rouletteScreen");
  const menuScreen = document.getElementById("menuScreen");
  
  document.getElementById("toRoulette").onclick = () => {
    rouletteScreen.style.display = "block";
    menuScreen.style.display = "none";
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
      weightInput.oninput = e => item.weight = Number(e.target.value);
      forceInput.onchange = e => item.force = e.target.checked;
  
      tr.querySelector("button").onclick = () => {
        items = items.filter(i => i.id !== item.id);
        renderMenu();
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
  };
  
  // =======================
  // ルーレット処理
  // =======================
  
  const canvas = document.getElementById("rouletteCanvas");
  const ctx = canvas.getContext("2d");
  
  function drawRoulette() {
    const total = items.reduce((s, i) => s + i.weight, 0);
    let startAngle = 0;
  
    items.forEach(item => {
      const angle = (item.weight / total) * Math.PI * 2;
  
      ctx.beginPath();
      ctx.moveTo(150, 150);
      ctx.arc(150, 150, 150, startAngle, startAngle + angle);
      ctx.fillStyle = randomColor(item.id);
      ctx.fill();
  
      startAngle += angle;
    });
  }
  
  drawRoulette();
  