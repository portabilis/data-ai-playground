"use server";

import { Config, configSchema, explanationsSchema, Result } from "@/lib/types";
import { openai } from "@ai-sdk/openai";
import { sql } from "@vercel/postgres";
import { generateObject } from "ai";
import { z } from "zod";

export const generateQuery = async (input: string) => {
  "use server";
  try {
    const result = await generateObject({
      model: openai("gpt-4o"),
      system: `You are a SQL (PostgreSQL) and data visualization expert. Your job is to help the user write a SQL query to retrieve the data they need. The table schema is as follows:

alunos (
  id SERIAL PRIMARY KEY,
  aluno_data_nascimento DATE,
  aluno_genero VARCHAR(255),
  raca VARCHAR(255),
  bolsa_familia BOOLEAN,
  zona_localizacao VARCHAR(255),
  bairro VARCHAR(255),
  cidade VARCHAR(255),
  escola VARCHAR(255),
  curso VARCHAR(255),
  serie VARCHAR(255),
  matricula_id INTEGER NOT NULL UNIQUE
);

Only retrieval queries (SELECT) are allowed.

Use ILIKE with LOWER() for string comparisons, e.g.:
  LOWER(curso) ILIKE LOWER('%pedagogia%').

To filter by age, compute:
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, aluno_data_nascimento))

Always return at least two columns with quantitative data suitable for charting: counts, aggregates or rates. If a single field is requested, pair it with a COUNT or appropriate aggregate.

Return rates/percentages as decimals (e.g., 0.25 for 25%).

Format decimal numbers using ROUND() with 2 decimal places, e.g.:
  ROUND(column_name, 2) or ROUND(calculation, 2)

For time-based analyses, group by YEAR(aluno_data_nascimento) or by series as needed.

Use descriptive aliases in Brazilian Portuguese (pt-BR) for result columns to support chart labels. Examples:
- COUNT(*) as "quantidade_total"
- ROUND(AVG(age), 2) as "media_idade"
- raca as "etnia"
- aluno_genero as "genero"
`,
      prompt: `Generate the query necessary to retrieve the data the user wants: ${input}`,
      schema: z.object({
        query: z.string(),
      }),
    });
    return result.object.query;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to generate query");
  }
};

export const runGenerateSQLQuery = async (query: string) => {
  "use server";
  // Check if the query is a SELECT statement
  if (
    !query.trim().toLowerCase().startsWith("select") ||
    query.trim().toLowerCase().includes("drop") ||
    query.trim().toLowerCase().includes("delete") ||
    query.trim().toLowerCase().includes("insert") ||
    query.trim().toLowerCase().includes("update") ||
    query.trim().toLowerCase().includes("alter") ||
    query.trim().toLowerCase().includes("truncate") ||
    query.trim().toLowerCase().includes("create") ||
    query.trim().toLowerCase().includes("grant") ||
    query.trim().toLowerCase().includes("revoke")
  ) {
    throw new Error("Only SELECT queries are allowed");
  }

  let data: any;
  try {
    data = await sql.query(query);
  } catch (e: any) {
    if (e.message.includes('relation "alunos" does not exist')) {
      console.log(
        "Table does not exist, creating and seeding it with dummy data now...",
      );
      // throw error
      throw Error("Table does not exist");
    } else {
      throw e;
    }
  }

  return data.rows as Result[];
};

export const explainQuery = async (input: string, sqlQuery: string) => {
  "use server";
  try {
    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        explanations: explanationsSchema,
      }),
      system: `You are a SQL (PostgreSQL) expert. Your job is to explain to the user the SQL query you wrote to retrieve the data they asked for. The table schema is as follows:

alunos (
  id SERIAL PRIMARY KEY,
  aluno_data_nascimento DATE,
  aluno_genero VARCHAR(255),
  raca VARCHAR(255),
  bolsa_familia BOOLEAN,
  zona_localizacao VARCHAR(255),
  bairro VARCHAR(255),
  cidade VARCHAR(255),
  escola VARCHAR(255),
  curso VARCHAR(255),
  serie VARCHAR(255),
  matricula_id INTEGER NOT NULL UNIQUE
);

When explaining, break the query into logical sections (SELECT, FROM, WHERE, GROUP BY, etc.) and describe the purpose of each. Provide concise explanations in Brazilian Portuguese (pt-BR) suitable for a non-expert.

Example of explanation style:
- SELECT: Aqui selecionamos os campos que queremos mostrar
- WHERE: Filtramos os dados para mostrar apenas...
- GROUP BY: Agrupamos os resultados por...
`,
      prompt: `Explain the SQL query you generated to retrieve the data the user wanted. Assume the user is not an expert in SQL. Break down the query into steps. Be concise.

      User Query:
      ${input}

      Generated SQL Query:
      ${sqlQuery}`,
    });
    return result.object;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to generate query");
  }
};

export const generateChartConfig = async (
  results: Result[],
  userQuery: string,
) => {
  "use server";
  const system = `You are a data visualization expert. Your job is to generate chart configurations that best visualize the data. All labels, titles and descriptions must be in Brazilian Portuguese (pt-BR).`;

  try {
    const { object: config } = await generateObject({
      model: openai("gpt-4o"),
      system,
      prompt: `Given the following data from a SQL query result, generate the chart config that best visualises the data and answers the users query.
      For multiple groups use multi-lines.

      Here is an example complete config:
      export const chartConfig = {
        type: "pie",
        xKey: "month",
        yKeys: ["sales", "profit", "expenses"],
        colors: {
          sales: "#4CAF50",    // Green for sales
          profit: "#2196F3",   // Blue for profit
          expenses: "#F44336"  // Red for expenses
        },
        legend: true
      }

      User Query:
      ${userQuery}

      Data:
      ${JSON.stringify(results, null, 2)}`,
      schema: configSchema,
    });

    const colors: Record<string, string> = {};
    config.yKeys.forEach((key, index) => {
      colors[key] = `hsl(var(--chart-${index + 1}))`;
    });

    const updatedConfig: Config = { ...config, colors };
    return { config: updatedConfig };
  } catch (e) {
    // @ts-expect-errore
    console.error(e.message);
    throw new Error("Failed to generate chart suggestion");
  }
};
