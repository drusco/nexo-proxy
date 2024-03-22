import ProxyNexo from "../lib/ProxyNexo.js";
import NexoTS from "../lib/types/Nexo.js";
import { getProxy } from "./index.js";
import map from "../lib/maps.js";
import NexoEvent from "../lib/events/NexoEvent.js";

const nexo = new ProxyNexo();

describe("getProxy", () => {
  it("Creates a new proxy with custom data", () => {
    const proxy = getProxy(nexo);

    testProxyData(proxy);
  });

  it("Creates a new proxy with custom data and a target", () => {
    const arrayTarget = [];
    const proxy = getProxy(nexo, arrayTarget);

    testProxyData(proxy, arrayTarget);
  });

  it("Links internal data using weak maps", () => {
    const target = [];
    const proxy = getProxy(nexo);
    const proxyWithTarget = getProxy(nexo, target);
    const proxyData = map.proxies.get(proxy);
    const proxyWithTargetData = map.proxies.get(proxyWithTarget);

    expect(map.proxies.has(proxy)).toBe(true);
    expect(map.proxies.has(proxyWithTarget)).toBe(true);
    expect(map.tracables.has(proxyData.mock.deref())).toBe(true);
    expect(map.tracables.has(proxyWithTargetData.mock.deref())).toBe(true);
    expect(map.tracables.has(target)).toBe(true);
  });

  it("Exposes the proxy to the nexo instance", () => {
    const proxy = getProxy(nexo);
    const { id } = map.proxies.get(proxy);

    expect(nexo.entries.has(id)).toBe(true);
    expect(nexo.entries.get(id).deref()).toStrictEqual(proxy);
  });

  it("Emits an event for new proxies", () => {
    const createCallback = jest.fn();

    nexo.on("nx.proxy.create", createCallback);
    const proxy = getProxy(nexo);
    const { id } = map.proxies.get(proxy);
    const event = createCallback.mock.lastCall[0];

    expect(createCallback.mock.lastCall.length).toBe(1);
    expect(createCallback).toHaveBeenCalledTimes(1);
    expect(event).toBeInstanceOf(NexoEvent);
    expect(event.data).toEqual({ id, target: undefined });
    expect(event.target).toBe(nexo);
  });

  it("Returns an existing proxy", () => {
    const target = [];
    const proxy = getProxy(nexo);
    const proxyWithTarget = getProxy(nexo, target);

    expect(getProxy(nexo, proxy)).toStrictEqual(proxy);
    expect(getProxy(nexo, proxyWithTarget)).toStrictEqual(proxyWithTarget);
    expect(getProxy(nexo, target)).toStrictEqual(proxyWithTarget);
  });
});

function testProxyData(
  proxy: NexoTS.Proxy,
  proxyTarget: NexoTS.traceable | void,
) {
  const { id, scope, mock, sandbox, isExtensible, target } =
    map.proxies.get(proxy);

  const $target = target ? target.deref() : target;

  expect(typeof id).toBe("string");
  expect(typeof mock.deref()).toBe("function");
  expect(scope.deref()).toStrictEqual(nexo);
  expect(sandbox).toBeInstanceOf(Map);
  expect(isExtensible).toBe(true);
  expect($target).toStrictEqual(proxyTarget);
}
