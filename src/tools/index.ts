import { z } from "zod";
import { zodToJsonSchema } from "../utils";

export const schema = z.object({
  mermaid: z
    .string()
    .describe(`The mermaid diagram syntax used to be generated, such as, graph TD;
A-->B;
A-->C;
B-->D;
C-->D;.`)
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
      "The output type of the diagram. Default is 'base64'. Recommended: 'file' (saves PNG to disk for easy viewing). 'base64' returns PNG as a base64 encoded string. 'svg' returns SVG markup. 'mermaid' returns the raw Mermaid syntax. 'svg_url' and 'png_url' return public mermaid.ink links for sharing.",
    )
    .optional()
    .default("base64"),
});

export const tool = {
  name: "generate_mermaid_diagram",
  description:
    'Generate mermaid diagram and chart with mermaid syntax dynamically. Mermaid is a JavaScript based diagramming and charting tool that uses Markdown-inspired text definitions and a renderer to create and modify complex diagrams. Syntax tips: quote labels containing special characters, e.g. B["Label text"], and use <br/> for line breaks.',
  inputSchema: zodToJsonSchema(schema),
};
