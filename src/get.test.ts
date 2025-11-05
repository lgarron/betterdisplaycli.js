import { expect, test } from "bun:test";
import { getAllDevices } from "./get";

test("getAllDevices", async () => {
  const numConnected = (await getAllDevices({ ignoreDisplayGroups: true }))
    .length;
  expect(numConnected).toBeTypeOf("number");
});
