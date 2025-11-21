import { expect, spyOn, test } from "bun:test";
import { stderr } from "node:process";
import { getAllDevices } from "./get";

stderr.isTTY = true;

const stderrMock = spyOn(stderr, "write");

test("getAllDevices", async () => {
  const numConnected = (await getAllDevices({ ignoreDisplayGroups: true }))
    .length;
  expect(numConnected).toBeTypeOf("number");
  expect(stderrMock.mock.calls.slice(-2)).toEqual([
    [
      "\u001B[90m\u001B[1mbetterdisplaycli get --identifiers\u001B[22m\u001B[39m",
    ],
    ["\n"],
  ]);
});

test("getAllDevices quiet", async () => {
  stderrMock.mockReset();
  const numConnected = (
    await getAllDevices({ ignoreDisplayGroups: true, quiet: true })
  ).length;
  expect(numConnected).toBeTypeOf("number");
  expect(stderrMock.mock.calls).toEqual([]);
});
