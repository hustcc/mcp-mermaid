import { describe, expect, it } from "vitest";
import { schema, tool } from "../../src/tools";
describe("tools", () => {
  describe("schema", () => {
    it("should validate correct mermaid input", () => {
      const validInput = {
        mermaid: "graph TD;\\nA-->B;",
        theme: "default",
        backgroundColor: "white",
        outputType: "base64",
      };
      const result = schema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
    it("should reject empty mermaid string", () => {
      const invalidInput = {
        mermaid: "",
      };
      const result = schema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
    it("should use default values for optional fields", () => {
      const input = {
        mermaid: "graph TD;\\nA-->B;",
      };
      const result = schema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.theme).toBe("default");
        expect(result.data.backgroundColor).toBe("white");
        expect(result.data.outputType).toBe("base64");
      }
    });
  });
  describe("tool", () => {
    it("should have correct name", () => {
      expect(tool.name).toBe("generate_mermaid_diagram");
    });
    it("should have description", () => {
      expect(tool.description).toBeTruthy();
      expect(typeof tool.description).toBe("string");
    });
    it("should have inputSchema", () => {
      expect(tool.inputSchema).toBeDefined();
      expect(typeof tool.inputSchema).toBe("object");
    });
  });
});
