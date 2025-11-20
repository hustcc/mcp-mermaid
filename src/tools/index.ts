import { z } from "zod";
import { zodToJsonSchema } from "../utils";

export const schema = z.object({
  mermaid: z
    .string()
    .describe(`The mermaid diagram syntax to be generated. Use 'flowchart' instead of 'graph' for v10+ compatibility. Example:
flowchart TD
  A-->B
  A-->C
  B-->D
  C-->D

Other diagram types: sequenceDiagram, classDiagram, stateDiagram, erDiagram, gantt, pie, etc.`)
    .nonempty({ message: "The mermaid string cannot be empty." }),
  theme: z
    .enum(["default", "base", "forest", "dark", "neutral"])
    .describe("Theme for the diagram (optional). Default is 'default'.")
    .optional()
    .default("default"),
  backgroundColor: z
    .string()
    .describe(
      "Background color for the diagram (optional). Default is 'white'.",
    )
    .optional()
    .default("white"),
  outputType: z
    .enum(["base64", "svg", "mermaid", "file", "svg_url", "png_url"])
    .describe(
      "The output type of the diagram. Can be 'base64', 'svg', 'mermaid', 'file', 'svg_url', or 'png_url'. Default is 'base64'. 'base64' returns PNG image as base64 encoded string. 'file' saves the PNG image to disk. The *_url options return public mermaid.ink links for remote-friendly sharing.",
    )
    .optional()
    .default("base64"),
});

export const tool = {
  name: "generate_mermaid_diagram",
  description:
    "Generate mermaid diagram and chart with mermaid syntax dynamically. Mermaid is a JavaScript based diagramming and charting tool that uses Markdown-inspired text definitions and a renderer to create and modify complex diagrams. The main purpose of Mermaid is to help documentation catch up with development.",
  inputSchema: zodToJsonSchema(schema),
};
