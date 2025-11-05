# `betterdisplaycli.js`

TypeScript bindings for `betterdisplaycli`.

Only a small number of bindings are currently supported. More will be added as needed.

## Example usage

```ts
import { getAllDevices } from "betterdisplaycli";

const numConnected = (await getAllDevices({ ignoreDisplayGroups: true })).length;
const plural = numConnected === 1 ? "" : "s";
console.log(`${numConnected} display${plural} and/or virtual screen${plural} connected.`);
```
