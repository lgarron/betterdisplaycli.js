import { PrintableShellCommand } from "printable-shell-command";
import { print, type QuietOption } from "./get";
import { isNotUndefined, ResolutionInfo } from "./ResolutionInfo";

type BOOLEAN_SETTING = "connected" | "hiDPI" | "notch";
type STRING_SETTING = "resolution";

export type NumberString = string;

export interface DeviceInfoCommon {
  deviceType: "Display" | "VirtualScreen" | "DisplayGroup";
  name: string;
  tagID: NumberString;
}

export interface DisplayInfo extends DeviceInfoCommon {
  deviceType: "Display";
  UUID: string;
  alphanumericSerial: string;
  displayID: NumberString;
  model: string; // `NumberString`?
  originalName: string;
  productName: string;
  registryLocation: string;
  serial: string;
  vendor: string;
  weekOfManufacture: NumberString; // "0" if unavailable?
  yearOfManufacture: NumberString; // "0" if unavailable?
}

export interface VirtualScreenInfo extends DeviceInfoCommon {
  deviceType: "VirtualScreen";
}

export interface DisplayGroupInfo extends DeviceInfoCommon {
  deviceType: "DisplayGroup";
}

export type DeviceInfo = DisplayInfo | VirtualScreenInfo | DisplayGroupInfo;

export class Device {
  constructor(public readonly info: DeviceInfoCommon) {}
}

class SingleDisplay extends Device {
  constructor(public override readonly info: DeviceInfoCommon) {
    super(info);
  }
  boolean = {
    get: async (
      settingName: BOOLEAN_SETTING,
      options?: QuietOption,
    ): Promise<boolean> => {
      switch (
        await print(
          new PrintableShellCommand("betterdisplaycli", [
            "get",
            `--name=${this.info.name}`,
            `--${settingName}`,
          ]),
          { argumentLineWrapping: "inline" },
          options,
        ).text({ trimTrailingNewlines: "single-required" })
      ) {
        case "on": {
          return true;
        }
        case "off": {
          return true;
        }
        default:
          throw new Error("Invalid value") as never;
      }
    },

    set: async (
      settingName: BOOLEAN_SETTING,
      on: boolean,
      options?: QuietOption,
    ): Promise<void> => {
      await print(
        new PrintableShellCommand("betterdisplaycli", [
          "set",
          `--name=${this.info.name}`,
          `--${settingName}=${on ? "on" : "off"}`,
        ]),
        { argumentLineWrapping: "inline" },
        options,
      ).shellOut({ print: false });
    },

    toggle: async (
      settingName: BOOLEAN_SETTING,
      options?: QuietOption,
    ): Promise<void> => {
      await print(
        new PrintableShellCommand("betterdisplaycli", [
          "toggle",
          `--name=${this.info.name}`,
          `--${settingName}`,
        ]),
        { argumentLineWrapping: "inline" },
        options,
      ).shellOut({ print: false });
    },
  };
  string = {
    get: async (
      settingName: STRING_SETTING,
      options?: QuietOption,
    ): Promise<string> => {
      return print(
        new PrintableShellCommand("betterdisplaycli", [
          "get",
          `--name=${this.info.name}`,
          `--${settingName}`,
        ]),
        { argumentLineWrapping: "inline" },
        options,
      ).text({ trimTrailingNewlines: "single-required" });
    },

    set: async (
      settingName: STRING_SETTING,
      value: string,
      options?: QuietOption,
    ): Promise<void> => {
      await print(
        new PrintableShellCommand("betterdisplaycli", [
          "set",
          `--name=${this.info.name}`,
          `--${settingName}=${value}`,
        ]),
        { argumentLineWrapping: "inline" },
        options,
      ).shellOut({ print: false });
    },
  };

  resolution = {
    get: async (): Promise<ResolutionInfo> => {
      return ResolutionInfo.fromString(await this.string.get("resolution"));
    },
    // The return value indicates if any changes were needed (and performed)
    set: async (
      resolutionInfo: ResolutionInfo,
      options?: QuietOption,
    ): Promise<boolean> => {
      const currentResolution = await this.resolution.get();

      const args: string[] = [];
      if (resolutionInfo.width !== currentResolution.width) {
        args.push(`--width=${resolutionInfo.width}`);
      }
      if (resolutionInfo.width !== currentResolution.height) {
        args.push(`--height=${resolutionInfo.height}`);
      }
      if (
        isNotUndefined(resolutionInfo.hiDPI) &&
        resolutionInfo.hiDPI !== currentResolution.hiDPI
      ) {
        args.push(`--hiDPI=${resolutionInfo.hiDPI}`);
      }
      if (
        isNotUndefined(resolutionInfo.notch) &&
        resolutionInfo.notch !== currentResolution.notch
      ) {
        args.push(`--notch=${resolutionInfo.notch ? "on" : "off"}`);
      }

      if (args.length === 0) {
        // No changes to perform.
        return false;
      }

      await print(
        new PrintableShellCommand("betterdisplaycli", [
          "set",
          `--name=${this.info.name}`,
          ...args,
        ]),
        { argumentLineWrapping: "inline" },
        options,
      ).shellOut({ print: false });
      return true;
    },
  };

  async connect(): Promise<void> {
    await this.boolean.set("connected", true);
  }

  async disconnect(): Promise<void> {
    await this.boolean.set("connected", false);
  }
}

export class Display extends SingleDisplay {
  constructor(public override readonly info: DisplayInfo) {
    super(info);
  }
}

export class VirtualScreen extends SingleDisplay {
  constructor(public override readonly info: VirtualScreenInfo) {
    super(info);
  }
}

export class DisplayGroup extends Device {
  constructor(public override readonly info: DisplayGroupInfo) {
    super(info);
  }
}

export function deviceFromInfo(info: DisplayInfo): Display;
export function deviceFromInfo(info: VirtualScreenInfo): VirtualScreen;
export function deviceFromInfo(info: DisplayGroupInfo): DisplayGroup;
export function deviceFromInfo(info: DeviceInfo): Device;
export function deviceFromInfo(info: DeviceInfo): Device {
  switch (info.deviceType) {
    case "Display": {
      return new Display(info);
    }
    case "VirtualScreen": {
      return new VirtualScreen(info);
    }
    case "DisplayGroup": {
      return new DisplayGroup(info);
    }
  }
}
