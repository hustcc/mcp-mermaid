import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zodToJsonSchema } from "../../src/utils/schema";

describe("schema", () => {
  describe("zodToJsonSchema", () => {
    it("should convert simple string schema", () => {
      const schema = z.string();
      const jsonSchema = zodToJsonSchema(schema);
      expect(jsonSchema).toHaveProperty("type", "string");
    });

    it("should convert object schema", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      const jsonSchema = zodToJsonSchema(schema);
      expect(jsonSchema).toHaveProperty("type", "object");
      expect(jsonSchema).toHaveProperty("properties");
    });

    it("should convert enum schema", () => {
      const schema = z.enum(["option1", "option2"]);
      const jsonSchema = zodToJsonSchema(schema);
      expect(jsonSchema).toHaveProperty("type", "string");
      expect(jsonSchema).toHaveProperty("enum");
    });

    it("should handle optional fields", () => {
      const schema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });
      const jsonSchema = zodToJsonSchema(schema);
      expect(jsonSchema.required).toContain("required");
      expect(jsonSchema.required).not.toContain("optional");
    });

    it("should handle default values", () => {
      const schema = z.object({
        field: z.string().default("default value"),
      });
      const jsonSchema = zodToJsonSchema(schema);
      expect(jsonSchema.properties.field.default).toBe("default value");
    });

    it("should convert number schema", () => {
      const schema = z.number();
      const jsonSchema = zodToJsonSchema(schema);
      expect(jsonSchema).toHaveProperty("type", "number");
    });

    it("should convert boolean schema", () => {
      const schema = z.boolean();
      const jsonSchema = zodToJsonSchema(schema);
      expect(jsonSchema).toHaveProperty("type", "boolean");
    });

    it("should handle array schemas", () => {
      const schema = z.array(z.string());
      const jsonSchema = zodToJsonSchema(schema);
      expect(jsonSchema).toHaveProperty("type", "array");
      expect(jsonSchema).toHaveProperty("items");
    });

    it("should include descriptions", () => {
      const schema = z.string().describe("This is a description");
      const jsonSchema = zodToJsonSchema(schema);
      expect(jsonSchema.description).toBe("This is a description");
    });

    it("should handle nested objects", () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string(),
        }),
      });
      const jsonSchema = zodToJsonSchema(schema);
      expect(jsonSchema.properties.user).toBeDefined();
      expect(jsonSchema.properties.user.type).toBe("object");
    });

    it("should return an object", () => {
      const schema = z.string();
      const jsonSchema = zodToJsonSchema(schema);
      expect(typeof jsonSchema).toBe("object");
    });
  });
});
