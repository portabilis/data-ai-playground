import { motion } from "framer-motion";
import { Button } from "./ui/button";

export const SuggestedQueries = ({
  handleSuggestionClick,
}: {
  handleSuggestionClick: (suggestion: string) => void;
}) => {
  const suggestionQueries = [
    {
      desktop: "Média de idade dos alunos por série",
      mobile: "Idade por série",
    },
    {
      desktop: "Distribuição de gêneros por série",
      mobile: "Gênero por série",
    },
    {
      desktop: "Quantidade de alunos beneficiados pelo Bolsa Família",
      mobile: "Bolsa Família",
    },
    {
      desktop: "Número de alunos por escola",
      mobile: "Alunos por escola",
    },
    {
      desktop: "Percentual de alunos por zona de localização",
      mobile: "Alunos por zona",
    },
    {
      desktop: "Contagem de alunos por raça",
      mobile: "Alunos por raça",
    },
    {
      desktop: "Lista de bairros com mais matrículas",
      mobile: "Top bairros",
    },
    {
      desktop: "Comparar inscrições por gênero entre séries",
      mobile: "Gênero vs série",
    },
  ];

  return (
    <motion.div
      key="suggestions"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
      exit={{ opacity: 0 }}
      className="h-full overflow-y-auto"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
        Sugestões
      </h2>
      <div className="flex flex-wrap gap-2">
        {suggestionQueries.map((suggestion, index) => (
          <Button
            key={index}
            className={index > 5 ? "hidden sm:inline-block" : ""}
            type="button"
            variant="outline"
            onClick={() => handleSuggestionClick(suggestion.desktop)}
          >
            <span className="sm:hidden">{suggestion.mobile}</span>
            <span className="hidden sm:inline">{suggestion.desktop}</span>
          </Button>
        ))}
      </div>
    </motion.div>
  );
};
