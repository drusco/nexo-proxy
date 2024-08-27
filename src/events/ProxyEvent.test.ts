import type nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "./ProxyEvent.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

describe("ProxyEvent", () => {
  it("Prefixes 'nx.proxy.' to the proxy handler event names", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const handlerName: nx.proxy.handler = "construct";

    const event = new ProxyEvent(handlerName, {
      target: proxy,
    });

    expect(event.name).toBe("nx.proxy." + handlerName);
    expect(event.target).toBe(proxy);
    expect(event.data).toBeUndefined();
  });

  it("Emits the proxy event to the nexo and proxy listeners", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = new ProxyWrapper(proxy);
    const handlerName: nx.proxy.handler = "apply";
    const callback = jest.fn();

    wrapper.events.on("nx.proxy." + handlerName, callback);
    wrapper.nexo.on("nx.proxy." + handlerName, callback);

    new ProxyEvent(handlerName, {
      target: proxy,
    });

    const [[proxyEvent], [proxyEvt]]: ProxyEvent[][] = callback.mock.calls;

    expect(callback).toHaveBeenCalledTimes(2);
    expect(proxyEvent).toBe(proxyEvt);
    expect(proxyEvent.name).toBe("nx.proxy." + handlerName);
    expect(proxyEvent.target).toBe(proxy);
  });
});
