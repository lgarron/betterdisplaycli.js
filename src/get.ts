import { PrintableShellCommand } from "printable-shell-command";
import {
  type Device,
  type DeviceInfo,
  type Display,
  deviceFromInfo,
  type VirtualScreen,
} from "./Device";

interface QuietOption {
  quiet?: boolean;
}

function print(
  command: PrintableShellCommand,
  printOptions?: Parameters<PrintableShellCommand["print"]>[0],
  quietOptions?: QuietOption,
): PrintableShellCommand {
  if (!quietOptions?.quiet) {
    command.print(printOptions);
  }
  return command;
}

export async function getAllDevices(
  options?: {
    ignoreDisplayGroups?: true;
  } & QuietOption,
): Promise<(Display | VirtualScreen)[]>;
export async function getAllDevices(
  options?: {
    ignoreDisplayGroups?: boolean;
  } & QuietOption,
): Promise<Device[]> {
  const jsonStream = await print(
    new PrintableShellCommand("betterdisplaycli", [["get", "--identifiers"]]),
    { argumentLineWrapping: "inline" },
    options,
  )
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

export async function connectAllDisplays(options: QuietOption): Promise<void> {
  await print(
    new PrintableShellCommand("betterdisplaycli", [
      ["perform", "--connectAllDisplays"],
    ]),
    { argumentLineWrapping: "inline" },
    options,
  ).spawnTransparently().success;
}
