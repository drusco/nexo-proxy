import Exotic from "../../types/Exotic.js";
import { map } from "../../utils/index.js";

export default function links(scope: Exotic.Emulator): Exotic.key[] {
  const { links }: Exotic.emulator.data = map.emulators.get(scope);
  return Object.keys(links);
}
