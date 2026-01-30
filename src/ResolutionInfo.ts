// biome-ignore lint/suspicious/noExplicitAny: `any` is the correct API.
export function isPositiveInteger(n: any): n is number {
  return Number.isInteger(n) && n > 0;
}

// biome-ignore lint/suspicious/noExplicitAny: `any` is the correct API.
export function isNotUndefined<T extends Exclude<any, undefined>>(
  v: T | undefined,
): v is T {
  return typeof v !== "undefined";
}

export interface ResolutionInfoData {
  width: number;
  height: number;
  pixelRatio?: number;
  notch?: boolean;
}

export class ResolutionInfo {
  #data: ResolutionInfoData;
  constructor(data: ResolutionInfoData) {
    this.#data = data;
    if (!isPositiveInteger(data.width)) {
      throw new Error("Invalid width (expected a positive integer).");
    }
    if (!isPositiveInteger(data.height)) {
      throw new Error("Invalid height (expected a positive integer).");
    }
    if (
      isNotUndefined(data.pixelRatio) &&
      (!isPositiveInteger(data.pixelRatio) || ![1, 2].includes(data.pixelRatio))
    ) {
      throw new Error("Invalid pixel ratio (expected 1 or 2 if set).");
    }
    if (isNotUndefined(data.notch) && typeof data.notch !== "boolean") {
      throw new Error("Invalid notch (expected boolean if present).");
    }
  }

  get width(): number {
    return this.#data.width;
  }

  get height(): number {
    return this.#data.height;
  }

  get pixelRatio(): number | undefined {
    return this.#data.pixelRatio;
  }

  get hiDPI(): boolean | undefined {
    if (isNotUndefined(this.pixelRatio)) {
      return this.pixelRatio === 2;
    }
    return undefined;
  }

  get notch(): boolean | undefined {
    return this.#data.notch;
  }

  static fromString(s: string): ResolutionInfo {
    const match = s.match(
      /^([1-9][0-9]*)[x×]([1-9][0-9]*)+(@([1-9][0-9]*)x)?([+-]notch)?$/,
    );
    console.log({ s, match });
    if (!match) {
      throw new Error("Invalid resolution info.");
    }
    const width = parseInt(match[1], 10);
    const height = parseInt(match[2], 10);
    const pixelRatio = match[4] ? parseInt(match[4], 10) : undefined;
    const notch = match[5] ? match[5][0] === "+" : undefined;
    return new ResolutionInfo({ width, height, pixelRatio, notch });
  }

  logicalResolutionString(): string {
    return `${this.width}x${this.height}`;
  }

  toString(): string {
    let output = this.logicalResolutionString();
    if (isNotUndefined(this.pixelRatio)) {
      output += `@${this.pixelRatio}x`;
    }
    if (isNotUndefined(this.notch)) {
      output += `${this.notch ? "+" : "-"}notch`;
    }
    return output;
  }
}
