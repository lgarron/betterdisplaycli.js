import { PrintableShellCommand } from "printable-shell-command";
import {
  type Device,
  type DeviceInfo,
  type Display,
  deviceFromInfo,
  type VirtualScreen,
} from "./Device";

const BINARY_NAME = "betterdisplaycli";

export interface QuietOption {
  quiet?: boolean;
}

export function print(
  command: PrintableShellCommand,
  printOptions?: Parameters<PrintableShellCommand["print"]>[0],
  quietOptions?: QuietOption,
): PrintableShellCommand {
  if (!quietOptions?.quiet) {
    command.print(printOptions);
  }
  return command;
}

async function getDeviceInfos<T>(
  printable_shell_command: PrintableShellCommand,
  options?: {
    ignoreDisplayGroups?: true;
  } & QuietOption,
): Promise<T[]> {
  const jsonStream = await print(
    printable_shell_command,
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
    }) as T[];
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
    new PrintableShellCommand(BINARY_NAME, [["get", "--identifiers"]]),
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

export async function getDisplayWithSelectorArg(
  arg: "--displayWithMainStatus" | `--name=${string}`,
  options?: QuietOption,
): Promise<Display> {
  return (
    await getDeviceInfos<Display>(
      new PrintableShellCommand("betterdisplaycli", [
        "get",
        arg,
        "--type=Display",
        "--identifiers",
      ]),
      options,
    )
  )[0];
}

export async function connectAllDisplays(options?: QuietOption): Promise<void> {
  await print(
    new PrintableShellCommand(BINARY_NAME, [
      ["perform", "--connectAllDisplays"],
    ]),
    { argumentLineWrapping: "inline" },
    options,
  ).spawnTransparently().success;
}
