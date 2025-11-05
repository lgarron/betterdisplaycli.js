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

export class Display extends Device {
  constructor(public override readonly info: DisplayInfo) {
    super(info);
  }
}

export class VirtualScreen extends Device {
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
