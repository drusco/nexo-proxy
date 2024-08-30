import type nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import isProxy from "../utils/isProxy.js";
import construct from "./construct.js";
import ProxyEvent from "../events/ProxyEvent.js";

describe("construct", () => {
  it("Emits a construct event", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const constructListener = jest.fn();

    nexo.on("proxy.construct", constructListener);
    wrapper.on("proxy.construct", constructListener);

    const args = ["foo", "bar"];
    const result = construct(wrapper.fn, args);

    const [constructEvent] = constructListener.mock.lastCall;

    expect(constructListener).toHaveBeenCalledTimes(2);
    expect(constructEvent.target).toBe(proxy);
    expect(constructEvent.cancelable).toBe(true);

    expect(constructEvent.data).toStrictEqual({
      arguments: args,
      result,
    });
  });

  it("Returns a new proxy by default", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const result = construct(wrapper.fn) as nx.Proxy;
    const resultWrapper = Nexo.wrap(result);

    expect(isProxy(result)).toBe(true);
    expect(resultWrapper.target).toBeUndefined();
  });

  it("Creates an instance from a function target and returns its proxy", () => {
    const nexo = new Nexo();
    class MyTarget {}
    const proxy = nexo.create(MyTarget);
    const wrapper = Nexo.wrap(proxy);

    const result = construct(wrapper.fn) as nx.Proxy;
    const resultWrapper = Nexo.wrap(result);

    expect(isProxy(result)).toBe(true);
    expect(resultWrapper.target).toBeInstanceOf(MyTarget);
  });

  it("Allows its return value to be defined by the event listener", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const expectedResult = "foo";

    wrapper.on("proxy.construct", (event: ProxyEvent) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = construct(wrapper.fn);

    expect(result).toBe(expectedResult);
  });

  it("Allows its return value to be converted to a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const expectedResult = [];

    wrapper.on("proxy.construct", (event: ProxyEvent) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = construct(wrapper.fn);
    const expectedProxy = nexo.create(expectedResult);
    const resultWrapper = Nexo.wrap(expectedProxy);

    expect(isProxy(result)).toBe(true);
    expect(result).toBe(expectedProxy);
    expect(resultWrapper.target).toBe(expectedResult);
  });

  it("Emits an update event when the expected return proxy changes", () => {
    const nexo = new Nexo();
    const updateCallback = jest.fn();

    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const expectedResult = "test";

    let expectedProxy: nx.Proxy;

    wrapper.on("proxy.construct", (event: ProxyEvent<{ result: nx.Proxy }>) => {
      event.preventDefault();
      expectedProxy = event.data.result;
      return expectedResult;
    });

    nexo.on("update", updateCallback);

    construct(wrapper.fn);

    const [updateEvent] = updateCallback.mock.lastCall;

    expect(updateCallback).toHaveBeenCalledTimes(1);
    expect(updateEvent.target).toBe(expectedProxy);
    expect(updateEvent.cancelable).toBe(false);
    expect(updateEvent.data).toBe(expectedResult);
  });

  it("Emits an update event when the target is instantiated and the return proxy changes", () => {
    const nexo = new Nexo();
    const updateCallback = jest.fn();

    const constructable = function () {};
    const proxy = nexo.create(constructable);
    const wrapper = Nexo.wrap(proxy);

    let expectedProxy: nx.Proxy;

    wrapper.on("proxy.construct", (event: ProxyEvent<{ result: nx.Proxy }>) => {
      expectedProxy = event.data.result;
    });

    nexo.on("update", updateCallback);

    const result = construct(wrapper.fn);
    const [updateEvent] = updateCallback.mock.lastCall;

    expect(updateCallback).toHaveBeenCalledTimes(1);
    expect(updateEvent.target).toBe(expectedProxy);
    expect(updateEvent.cancelable).toBe(false);
    expect(updateEvent.data).toBeInstanceOf(constructable);
    expect(isProxy(result)).toBe(true);
    expect(result).toBe(updateEvent.data);
  });
});
