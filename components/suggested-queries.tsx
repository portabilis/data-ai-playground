import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

        // Se houver sugestões no banco, usá-las
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        setSuggestions([]);
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
        ) : formattedSuggestions.length > 0 ? (
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
        ) : (
          <p className="text-muted-foreground">Nenhuma sugestão disponível</p>
        )}
      </div>
    </motion.div>
  );
};
