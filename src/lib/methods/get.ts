import Exotic from "../../types/Exotic";
import { findProxy, encode, map } from "../../utils";

export default async function get(
  scope: Exotic.Emulator,
  value?: any,
): Promise<any> {
  const proxy = findProxy(value);
  const { options } = map.emulators.get(scope);

  if (!proxy) {
    return value;
  }

  return await new Promise((resolve) => {
    scope.emit("get", encode(value), (result: any) => {
      resolve(result);
    });
    setTimeout(resolve, options.responseTimeout);
  });
}
