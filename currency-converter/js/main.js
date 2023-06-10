const openExKey = "6ec50d3ee2b045be8b799cef80c0f0ff";

let data = {};

async function getData() {
    data = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${openExKey}`
    );
    if (data.status === 200) {
      data = await data.json()
    }
    else {
      data = false;
    }
}

async function fillCbxs() {
  await getData();
  console.log(data);
  if (!data) {
    document.body.innerHTML = `<h1>Something Went Wrong!</h1>
    <script src="js/main.js" type="module"></script>`;
    return false;
  }
  
  const fromCbx = document.querySelector(".convert-from-div select");
  const toCbx = document.querySelector(".convert-to-div select");
  Object.keys(data.rates).forEach((key) => {
    if (key !== "ILS") {
      const flagEmojy = String.fromCodePoint(
        ...[...key.slice(0, 2).toUpperCase()].map(
          (x) => 0x1f1a5 + x.charCodeAt()
        )
      );
      const newOption1 = document.createElement("option");
      newOption1.innerText = flagEmojy + " " + key;
      const newOption2 = document.createElement("option");
      newOption2.innerText = flagEmojy + " " + key;
      fromCbx.appendChild(newOption1);
      toCbx.appendChild(newOption2);
    }
  });
  return true;
}

function calc(input, cbx, otherInput, otherCbx) {
  let currValue = data.rates[cbx.value.slice(-3)];
  let otherValue = data.rates[otherCbx.value.slice(-3)];
  let enteredAmmount = input.value;
  otherInput.value = (enteredAmmount / otherValue) * currValue;
}

async function startListening() {
  const start = await fillCbxs();
  if (!start) return;
  const fromInput = document.getElementById("from-ammount");
  const toInput = document.getElementById("to-ammount");
  const fromCbx = document.getElementById("from-cbx");
  const toCbx = document.getElementById("to-cbx");
  const switchBtn = document.getElementById("switch-btn");

  fromCbx.value = '🇹🇳 TND';
  toCbx.value = '🇺🇸 USD';

  fromInput.addEventListener("input", () => {
    calc(fromInput, fromCbx, toInput, toCbx);
  });
  toInput.addEventListener("input", () => {
    calc(toInput, toCbx, fromInput, fromCbx);
  });
  fromCbx.onchange = () => {
    calc(toInput, toCbx, fromInput, fromCbx);
  }
  toCbx.onchange = () => {
    calc(fromInput, fromCbx, toInput, toCbx);    
  }
  switchBtn.onclick = () => {
    [fromCbx.value, toCbx.value, fromInput.value, toInput.value] = [
      toCbx.value,
      fromCbx.value,
      toInput.value,
      fromInput.value,
    ];
  };
}
startListening();
