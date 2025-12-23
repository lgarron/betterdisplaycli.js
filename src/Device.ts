import { PrintableShellCommand } from "printable-shell-command";
import { print, type QuietOption } from "./get";

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
      settingName: "connected" | "hiDPI",
      options?: QuietOption,
    ): Promise<boolean> => {
      switch (
        (
          await print(
            new PrintableShellCommand("betterdisplaycli", [
              "get",
              `--name=${this.info.name}`,
              `--${settingName}`,
            ]),
            { argumentLineWrapping: "inline" },
            options,
          ).text()
        ).trim()
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
      setting: "connected" | "hiDPI",
      on: boolean,
      options?: QuietOption,
    ): Promise<void> => {
      await print(
        new PrintableShellCommand("betterdisplaycli", [
          "set",
          `--name=${this.info.name}`,
          `--${setting}=${on ? "on" : "off"}`,
        ]),
        { argumentLineWrapping: "inline" },
        options,
      ).spawn().success;
    },

    toggle: async (
      settingName: "connected" | "hiDPI",
      options?: QuietOption,
    ): Promise<void> => {
      await this.boolean.set(
        settingName,
        await this.boolean.get(settingName, options),
        options,
      );
    },
  };
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
