import test from 'node:test';
import assert from 'node:assert/strict';
import { createPLC, scanPLC } from '../emulator/core.js';

const healthy = { stopOK: true, eStopOK: true, overloadOK: true, jamSensor: false };

test('startup is stopped and fault-free with healthy inputs', () => {
  const plc = scanPLC(createPLC(), healthy);
  assert.equal(plc.motorCmd, false);
  assert.equal(plc.faultLatch, false);
});

test('START latches the conveyor and releasing START keeps it running', () => {
  let plc = scanPLC(createPLC(), healthy);
  plc = scanPLC(plc, { ...healthy, startButton: true });
  plc = scanPLC(plc, healthy);
  assert.equal(plc.runLatch, true);
  assert.equal(plc.motorCmd, true);
  assert.equal(plc.runLamp, true);
});

test('STOP removes the run latch without creating a fault', () => {
  let plc = scanPLC(createPLC(), healthy);
  plc = scanPLC(plc, { ...healthy, startButton: true });
  plc = scanPLC(plc, { ...healthy, stopOK: false });
  assert.equal(plc.motorCmd, false);
  assert.equal(plc.runLatch, false);
  assert.equal(plc.faultLatch, false);
});

test('emergency stop immediately stops and latches a fault', () => {
  let plc = scanPLC(createPLC(), healthy);
  plc = scanPLC(plc, { ...healthy, startButton: true });
  plc = scanPLC(plc, { ...healthy, eStopOK: false });
  assert.equal(plc.motorCmd, false);
  assert.equal(plc.faultLatch, true);
});

test('overload immediately stops and latches a fault', () => {
  let plc = scanPLC(createPLC(), healthy);
  plc = scanPLC(plc, { ...healthy, startButton: true });
  plc = scanPLC(plc, { ...healthy, overloadOK: false });
  assert.equal(plc.motorCmd, false);
  assert.equal(plc.faultLatch, true);
});

test('jam sensor must remain active for the full delay to trip', () => {
  let plc = scanPLC(createPLC(), healthy, 1000, 5000);
  plc = scanPLC(plc, { ...healthy, startButton: true }, 1000, 5000);
  for (let i = 0; i < 4; i += 1) plc = scanPLC(plc, { ...healthy, jamSensor: true }, 1000, 5000);
  assert.equal(plc.faultLatch, false);
  plc = scanPLC(plc, { ...healthy, jamSensor: true }, 1000, 5000);
  assert.equal(plc.faultLatch, true);
  assert.equal(plc.motorCmd, false);
});

test('reset only clears a fault after permissives and jam sensor are healthy', () => {
  let plc = scanPLC(createPLC(), { ...healthy, eStopOK: false });
  plc = scanPLC(plc, { ...healthy, eStopOK: false, resetButton: true });
  assert.equal(plc.faultLatch, true);
  plc = scanPLC(plc, { ...healthy, resetButton: true });
  assert.equal(plc.faultLatch, false);
  assert.equal(plc.motorCmd, false);
});

test('START is rejected while the jam sensor is already blocked', () => {
  let plc = scanPLC(createPLC(), healthy);
  plc = scanPLC(plc, { ...healthy, jamSensor: true, startButton: true });
  assert.equal(plc.runLatch, false);
  assert.equal(plc.motorCmd, false);
});

