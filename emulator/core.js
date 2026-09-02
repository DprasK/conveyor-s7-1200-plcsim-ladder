export const DEFAULT_INPUTS = Object.freeze({
  startButton: false,
  stopOK: true,
  eStopOK: true,
  overloadOK: true,
  jamSensor: false,
  resetButton: false,
});

export function createPLC() {
  return {
    firstScan: true,
    runLatch: false,
    faultLatch: false,
    jamElapsedMs: 0,
    motorCmd: false,
    runLamp: false,
    faultLamp: false,
  };
}

export function scanPLC(previous, suppliedInputs = {}, dtMs = 100, jamTimeMs = 5000) {
  const state = { ...previous };
  const input = { ...DEFAULT_INPUTS, ...suppliedInputs };
  const healthy = input.stopOK && input.eStopOK && input.overloadOK;

  // Urutan ini mengikuti network LAD dari atas ke bawah.
  if (state.firstScan) {
    state.runLatch = false;
    state.faultLatch = false;
  }

  if (!input.eStopOK || !input.overloadOK) state.faultLatch = true;

  const jamTimerIn = state.motorCmd && input.jamSensor;
  state.jamElapsedMs = jamTimerIn ? Math.min(state.jamElapsedMs + dtMs, jamTimeMs) : 0;
  if (state.jamElapsedMs >= jamTimeMs) state.faultLatch = true;

  if (input.resetButton && healthy && !input.jamSensor) state.faultLatch = false;
  if (input.startButton && healthy && !input.jamSensor && !state.faultLatch) state.runLatch = true;
  if (!input.stopOK || !input.eStopOK || !input.overloadOK || state.faultLatch) {
    state.runLatch = false;
  }

  state.motorCmd = state.runLatch && healthy && !state.faultLatch;
  state.runLamp = state.motorCmd;
  state.faultLamp = state.faultLatch;
  state.firstScan = false;
  return state;
}
