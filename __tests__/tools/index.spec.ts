import { describe, expect, it } from "vitest";
import { tool } from "../../src/tools";
import expects from "./mermaid.json";

describe("schema check", () => {
  it("mermaid schema", () => {
    expect(tool).toEqual(expects);
  });
});
