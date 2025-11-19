import type { styleText } from "node:util";
import { PrintableShellCommand } from "printable-shell-command";
import {
  type Device,
  type DeviceInfo,
  type Display,
  deviceFromInfo,
  type VirtualScreen,
} from "./Device";

export async function getAllDevices(options?: {
  ignoreDisplayGroups: true;
}): Promise<(Display | VirtualScreen)[]>;
export async function getAllDevices(options?: {
  ignoreDisplayGroups?: boolean;
}): Promise<Device[]> {
  const jsonStream = await new PrintableShellCommand("betterdisplaycli", [
    ["get", "--identifiers"],
  ])
    .print({ styleTextFormat: "auto", argumentLineWrapping: "inline" })
    .stdout()
    .text();
  const deviceInfos: DeviceInfo[] = JSON.parse(`[${jsonStream}]`);
  return deviceInfos
    .map((info) => deviceFromInfo(info))
    .filter((device: Device) => {
      return (
        !options?.ignoreDisplayGroups ||
        device.info.deviceType !== "DisplayGroup"
      );
    });
}

export async function connectAllDisplays(): Promise<void> {
  await new PrintableShellCommand("betterdisplaycli", [
    ["perform", "--connectAllDisplays"],
  ])
    .print({ styleTextFormat, argumentLineWrapping: "inline" })
    .spawnTransparently().success;
}

await getAllDevices();
