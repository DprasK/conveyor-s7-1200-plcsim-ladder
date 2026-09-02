import { createPLC, scanPLC } from './core.js';

const $ = (id) => document.getElementById(id);
const inputs = { stopOK: true, eStopOK: true, overloadOK: true, jamSensor: false };
let plc = createPLC();
let products = [];
let count = 0;
let nextId = 1;
let last = performance.now();

function pulse(name) {
  inputs[name] = true;
  plc = scanPLC(plc, inputs, 100);
  inputs[name] = false;
}

function addProduct() {
  products.push({ id: nextId++, x: 0 });
}

$('start').addEventListener('click', () => pulse('startButton'));
$('stop').addEventListener('click', () => {
  inputs.stopOK = false;
  plc = scanPLC(plc, inputs, 100);
  inputs.stopOK = true;
});
$('reset').addEventListener('click', () => pulse('resetButton'));
$('addProduct').addEventListener('click', addProduct);
$('clearJam').addEventListener('click', () => {
  products = products.filter((product) => product.x < 82 || product.x > 91);
  inputs.jamSensor = false;
});
$('eStopOK').addEventListener('change', (event) => { inputs.eStopOK = event.target.checked; });
$('overloadOK').addEventListener('change', (event) => { inputs.overloadOK = event.target.checked; });

function renderProducts() {
  const root = $('products');
  const known = new Map([...root.children].map((node) => [Number(node.dataset.id), node]));
  for (const product of products) {
    let node = known.get(product.id);
    if (!node) {
      node = document.createElement('div');
      node.className = 'product';
      node.dataset.id = product.id;
      root.append(node);
    }
    node.style.left = `${product.x}%`;
    known.delete(product.id);
  }
  for (const node of known.values()) node.remove();
}

function paint() {
  $('belt').classList.toggle('running', plc.motorCmd);
  $('motorRotor').parentElement.classList.toggle('on', plc.motorCmd);
  $('runLamp').classList.toggle('on', plc.runLamp);
  $('faultLamp').classList.toggle('on', plc.faultLamp);
  $('motorLamp').classList.toggle('on', plc.motorCmd);
  $('sensorBeam').classList.toggle('active', inputs.jamSensor);
  $('runLatch').textContent = String(plc.runLatch).toUpperCase();
  $('faultLatch').textContent = String(plc.faultLatch).toUpperCase();
  $('jamTimer').textContent = `${(plc.jamElapsedMs / 1000).toFixed(1)} / 5.0 s`;
  $('productCount').textContent = count;
  renderProducts();
}

function frame(now) {
  const dt = Math.min(now - last, 250);
  last = now;
  if (plc.motorCmd) {
    for (const product of products) {
      if ($('forceJam').checked && product.x >= 84) product.x = 84;
      else product.x += dt * 0.018;
    }
  }
  const jammedProduct = products.some((product) => product.x >= 82 && product.x <= 91);
  inputs.jamSensor = jammedProduct;
  const exited = products.filter((product) => product.x > 102).length;
  if (exited) {
    count += exited;
    products = products.filter((product) => product.x <= 102);
  }
  plc = scanPLC(plc, inputs, dt);
  paint();
  requestAnimationFrame(frame);
}

addProduct();
paint();
requestAnimationFrame(frame);
