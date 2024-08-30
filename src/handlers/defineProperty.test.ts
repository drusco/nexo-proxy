import Nexo from "../Nexo.js";
import defineProperty from "./defineProperty.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";

describe("defineProperty", () => {
  it("Emits a defineProperty event", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const definePropertyCallbackNexo = jest.fn();
    const definePropertyCallbackProxy = jest.fn();

    nexo.on("proxy.defineProperty", definePropertyCallbackNexo);
    wrapper.on("proxy.defineProperty", definePropertyCallbackProxy);

    const result = defineProperty(wrapper.fn, "foo", { value: "bar" });

    const [definePropertyEventForNexo] =
      definePropertyCallbackNexo.mock.lastCall;
    const [definePropertyEventForProxy] =
      definePropertyCallbackProxy.mock.lastCall;

    expect(result).toBe(true);
    expect(definePropertyCallbackNexo).toHaveBeenCalledTimes(1);
    expect(definePropertyEventForNexo.target).toBe(proxy);
    expect(definePropertyEventForNexo.cancelable).toBe(true);

    expect(definePropertyEventForNexo.data).toStrictEqual({
      property: "foo",
      descriptor: {
        value: "bar",
      },
    });

    expect(definePropertyCallbackProxy).toHaveBeenCalledTimes(1);
    expect(definePropertyEventForProxy).toBe(definePropertyEventForNexo);
  });

  it("Returns false when the event is default prevented", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    wrapper.on(
      "proxy.defineProperty",
      (
        event: ProxyEvent<{ property: string; descriptor: PropertyDescriptor }>,
      ) => {
        event.preventDefault();
      },
    );

    const result = defineProperty(wrapper.fn, "foo", { value: 5 });

    expect(result).toBe(false);
    expect(proxy.foo).not.toBe(5);
  });

  it("Cannot define properties on frozen proxies", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    Object.freeze(proxy);

    const result = defineProperty(wrapper.fn, "foo", { value: 10 });

    expect(result).toBe(false);
    expect(Object.isFrozen(proxy)).toBe(true);
  });

  it("Cannot define properties on sealed proxies", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    Object.seal(proxy);

    const result = defineProperty(wrapper.fn, "foo", { value: 20 });

    expect(result).toBe(false);
    expect(Object.isSealed(proxy)).toBe(true);
  });

  it("Cannot define properties on non-extensible proxies", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    Object.preventExtensions(proxy);

    const result = defineProperty(wrapper.fn, "foo", { value: 30 });

    expect(result).toBe(false);
    expect(Object.isExtensible(proxy)).toBe(false);
  });

  it("Defines a new property on the proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const result = defineProperty(wrapper.fn, "foo", { value: true });

    expect(result).toBe(true);
    expect(proxy.foo).toBe(true);
  });

  it("Cannot redefine property: non writable, non configurable", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const errorCallbackNexo = jest.fn();
    const errorCallbackProxy = jest.fn();

    nexo.on("proxy.error", errorCallbackNexo);
    wrapper.on("proxy.error", errorCallbackProxy);

    defineProperty(wrapper.fn, "foo", { value: true });

    expect(
      defineProperty.bind(null, wrapper.fn, "foo", { value: false }),
    ).toThrow(ProxyError);

    const [proxyError] = errorCallbackNexo.mock.lastCall;
    const [proxyError2] = errorCallbackProxy.mock.lastCall;

    expect(proxy.foo).toBe(true);
    expect(errorCallbackNexo).toHaveBeenCalledTimes(1);
    expect(errorCallbackProxy).toHaveBeenCalledTimes(1);
    expect(proxyError).toBe(proxyError2);
    expect(proxyError).toBeInstanceOf(ProxyError);
  });
});
