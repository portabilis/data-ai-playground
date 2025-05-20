import { sql } from '@vercel/postgres';
import "dotenv/config";

async function createSuggestionsTable() {
    try {
        // Criar tabela de sugestões
        const createTable = await sql`
      CREATE TABLE IF NOT EXISTS suggestions (
        id SERIAL PRIMARY KEY,
        query TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        console.log(`Created "suggestions" table`);

        // Inserir algumas sugestões padrão
        const defaultSuggestions = [
            "Média de idade dos alunos por série",
            "Distribuição de gêneros por série",
            "Quantidade de alunos beneficiados pelo Bolsa Família",
            "Número de alunos por escola",
            "Percentual de alunos por zona de localização",
            "Contagem de alunos por raça",
            "Lista de bairros com mais matrículas",
            "Comparar inscrições por gênero entre séries"
        ];

        for (const suggestion of defaultSuggestions) {
            try {
                await sql`
          INSERT INTO suggestions (query)
          VALUES (${suggestion})
          ON CONFLICT (query) DO NOTHING;
        `;
            } catch (error) {
                console.error(`Erro ao inserir sugestão "${suggestion}":`, error);
            }
        }

        console.log(`Seeded ${defaultSuggestions.length} default suggestions`);

        return { success: true };
    } catch (error) {
        console.error("Erro ao criar tabela de sugestões:", error);
        throw error;
    }
}

// Executar a função imediatamente
createSuggestionsTable()
    .then(() => {
        console.log("Tabela de sugestões criada com sucesso!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Falha ao criar tabela de sugestões:", error);
        process.exit(1);
    });