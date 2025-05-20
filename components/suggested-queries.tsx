import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Sugestões padrão como fallback
const defaultSuggestions = [
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

export const SuggestedQueries = ({
  handleSuggestionClick,
}: {
  handleSuggestionClick: (suggestion: string) => void;
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar sugestões do servidor
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch('/api/suggestions');
        if (!response.ok) {
          throw new Error('Falha ao buscar sugestões');
        }
        const data = await response.json();

        // Se houver sugestões no banco, usá-las, senão usar as padrão
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        } else {
          // Usar apenas o texto desktop das sugestões padrão
          setSuggestions(defaultSuggestions.map(s => s.desktop));
        }
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        // Em caso de erro, usar sugestões padrão
        setSuggestions(defaultSuggestions.map(s => s.desktop));
        toast.error('Erro ao carregar sugestões');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  // Converter sugestões simples para o formato desktop/mobile
  const formattedSuggestions = suggestions.map(suggestion => ({
    desktop: suggestion,
    mobile: suggestion.length > 20 ? suggestion.substring(0, 18) + '...' : suggestion,
  }));

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
        {isLoading ? (
          <p className="text-muted-foreground">Carregando sugestões...</p>
        ) : (
          formattedSuggestions.map((suggestion, index) => (
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
          ))
        )}
      </div>
    </motion.div>
  );
};
