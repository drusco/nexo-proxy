import Nexo from "../types/Nexo.js";
import map from "./map.js";

const isProxy = (value: unknown): value is Nexo.Proxy => {
  return map.proxies.has(value as Nexo.Proxy);
};

export default isProxy;
