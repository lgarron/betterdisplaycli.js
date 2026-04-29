import { PrintableShellCommand } from "printable-shell-command";
import {
  type Device,
  type DeviceInfo,
  type Display,
  type DisplayGroup,
  deviceFromInfo,
  type VirtualScreen,
} from "./Device";

const BINARY_NAME = "betterdisplaycli";

export interface QuietOption {
  quiet?: boolean;
}

export interface DetachOption {
  detach?: boolean;
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

export async function shellOutSilentOrDetach(
  command: PrintableShellCommand,
  options?: DetachOption,
): Promise<void> {
  if (options?.detach) {
    command.spawnDetached();
  } else {
    await command.shellOut({ print: false });
  }
}

type GetDeviceOptions = {
  ignoreDisplayGroups?: true;
} & QuietOption;

async function getDeviceInfos<T>(
  printable_shell_command: PrintableShellCommand,
  options?: GetDeviceOptions,
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
  options?: GetDeviceOptions,
): Promise<(Display | VirtualScreen)[]>;
export async function getAllDevices(
  options?: GetDeviceOptions,
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

export function getMain(
  options?: QuietOption,
): Promise<Display | VirtualScreen> {
  return getDisplayWithSelectorArg("--displayWithMainStatus", {
    ...options,
    ignoreDisplayGroups: true,
  });
}

export async function getByName(
  name: string,
  options?: GetDeviceOptions,
): Promise<Display | VirtualScreen>;
export function getByName(
  name: string,
  options?: GetDeviceOptions,
): Promise<Display | VirtualScreen | DisplayGroup> {
  return getDisplayWithSelectorArg(`--name=${name}`, options);
}

export async function tryGetByName(
  name: string,
  options?: GetDeviceOptions,
): Promise<Display | VirtualScreen | undefined>;
export async function tryGetByName(
  name: string,
  options?: GetDeviceOptions,
): Promise<Display | VirtualScreen | DisplayGroup | undefined> {
  const devices = await getAllDevices(options);
  return devices.filter((device) => device.info.name === name)[0];
}

export async function getDisplayWithSelectorArg(
  arg: "--displayWithMainStatus" | `--name=${string}`,
  options?: GetDeviceOptions,
): Promise<Display> {
  return (
    await getDeviceInfos<Display>(
      new PrintableShellCommand("betterdisplaycli", [
        "get",
        arg,
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
