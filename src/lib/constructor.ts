import Exotic from "../types/Exotic.js";
import { map } from "../utils/index.js";

export default function constructor(
  scope: Exotic.Emulator,
  options: Exotic.emulator.options = {},
): void {
  const config = {
    traceErrors: false,
    stackTraceLimit: 3,
    ...options,
  };

  Error.stackTraceLimit = config.stackTraceLimit;

  const data: Exotic.emulator.data = {
    options: config,
    links: Object.create(null),
    counter: 0,
    proxySet: new Set(),
  };

  map.emulators.set(scope, data);
}
