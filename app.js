// Funciones pedidas
function add(a, b) { return a + b; }
function substract(a, b) { return a - b; }
function product(a, b) { return a * b; }
function division(a, b) { return b === 0 ? "ERROR" : a / b; }
function clearDisplay(displayEl) { displayEl.value = ""; }

// Estado (lo que “recuerda” la calculadora)
let firstValue = null;            // número
let operator = null;              // "+", "-", "*", "/"
let waitingSecond = false;        // si ya pulsaste operador y toca escribir el segundo número
let expressionText = "";          // para mostrar "12+3" en pantalla

const display = document.getElementById("display");
const keys = document.getElementById("keys");

function compute(a, op, b) {
  switch (op) {
    case "+": return add(a, b);
    case "-": return substract(a, b);
    case "*": return product(a, b);
    case "/": return division(a, b);
    default: return b;
  }
}

function handleDigit(d) {
  // Si venimos de pulsar operador, empezamos el segundo número
  if (waitingSecond) {
    expressionText += d;
    waitingSecond = false;
  } else {
    expressionText += d;
  }
  display.value = expressionText;
}

function handleOperator(op) {
  // Si no hay nada escrito, no hacemos nada
  if (expressionText === "") return;

  // Si ya hay un operador y el usuario pulsa otro, opcional: reemplazar operador
  // (ej: "12+" y pulsa "*": queda "12*")
  if (operator && expressionText.endsWith(operator)) {
    expressionText = expressionText.slice(0, -1) + op;
    operator = op;
    display.value = expressionText;
    return;
  }

  // Si aún no tenemos firstValue, lo tomamos del texto actual
  if (firstValue === null) {
    firstValue = Number(expressionText);
  } else if (operator && !waitingSecond) {
    // Si ya había firstValue y operator y ya metiste segundo número, calculamos “en cadena”
    const parts = splitExpression(expressionText, operator);
    const secondValue = Number(parts.second);
    const result = compute(firstValue, operator, secondValue);

    if (result === "ERROR") {
      display.value = "ERROR";
      resetState();
      return;
    }

    firstValue = result;
    expressionText = String(result);
  }

  operator = op;
  expressionText += op;
  waitingSecond = true;
  display.value = expressionText;
}

function splitExpression(text, op) {
  // Divide "12+3" en { first: "12", second: "3" }
  const idx = text.lastIndexOf(op);
  return {
    first: text.slice(0, idx),
    second: text.slice(idx + 1),
  };
}

function handleEquals() {
  if (!operator) return;

  // Si termina en operador (ej "12+"), no calculamos
  if (expressionText.endsWith(operator)) return;

  const { first, second } = splitExpression(expressionText, operator);
  const a = Number(first);
  const b = Number(second);

  // Validación básica
  if (Number.isNaN(a) || Number.isNaN(b)) {
    display.value = "ERROR";
    resetState();
    return;
  }

  const result = compute(a, operator, b);
  display.value = String(result);

  // “Limpia la pantalla y muestra el resultado” -> dejamos el resultado y reseteamos operación
  firstValue = typeof result === "number" ? result : null;
  operator = null;
  expressionText = typeof result === "number" ? String(result) : "";
  waitingSecond = false;
}

function resetState() {
  firstValue = null;
  operator = null;
  waitingSecond = false;
  expressionText = "";
}

function handleClear() {
  resetState();
  clearDisplay(display);
}

keys.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const type = btn.dataset.type;
  const value = btn.dataset.value;

  if (type === "digit") handleDigit(value);
  if (type === "op") handleOperator(value);
  if (type === "equals") handleEquals();
  if (type === "clear") handleClear();
});
