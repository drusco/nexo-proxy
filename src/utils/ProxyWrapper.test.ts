import Nexo from "../Nexo.js";
import NexoEmitter from "../events/NexoEmitter.js";

describe("ProxyWrapper", () => {
  it("Access the proxy data", () => {
    const nexo = new Nexo();
    const target = [];
    const proxy = nexo.use("foo", target);
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper.id).toBe("foo");
    expect(wrapper).toBeInstanceOf(NexoEmitter);
    expect(wrapper.nexo).toBe(nexo);
    expect(wrapper.revoked).toBe(false);
  });

  it("Can revoke a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    wrapper.revoke();

    expect(proxy).toThrow();
    expect(wrapper.revoked).toBe(true);
  });
});
