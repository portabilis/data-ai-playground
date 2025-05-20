import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { QueryWithTooltips } from "./ui/query-with-tooltips";
import { explainQuery } from "@/app/actions";
import { QueryExplanation } from "@/lib/types";
import { CircleHelp, Loader2, Star } from "lucide-react";
import { toast } from "sonner";

export const QueryViewer = ({
  activeQuery,
  inputValue,
}: {
  activeQuery: string;
  inputValue: string;
}) => {
  const activeQueryCutoff = 100;

  const [queryExplanations, setQueryExplanations] = useState<
    QueryExplanation[] | null
  >();
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [queryExpanded, setQueryExpanded] = useState(activeQuery.length > activeQueryCutoff);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Verificar se a pergunta já está favoritada
  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        const response = await fetch('/api/suggestions');
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.suggestions.includes(inputValue));
        }
      } catch (error) {
        console.error('Erro ao verificar sugestão:', error);
      }
    };

    if (inputValue) {
      checkIfFavorite();
    }
  }, [inputValue]);

  const handleExplainQuery = async () => {
    setQueryExpanded(true);
    setLoadingExplanation(true);
    const { explanations } = await explainQuery(inputValue, activeQuery);
    setQueryExplanations(explanations);
    setLoadingExplanation(false);
  };

  const handleToggleFavorite = async () => {
    if (isToggling) return;

    setIsToggling(true);
    try {
      if (isFavorite) {
        // Remover dos favoritos
        const response = await fetch('/api/suggestions', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: inputValue }),
        });

        if (response.ok) {
          setIsFavorite(false);
          toast.success('Sugestão removida com sucesso');
        } else {
          throw new Error('Falha ao remover sugestão');
        }
      } else {
        // Adicionar aos favoritos
        const response = await fetch('/api/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: inputValue }),
        });

        if (response.ok) {
          setIsFavorite(true);
          toast.success('Sugestão salva com sucesso');
        } else {
          throw new Error('Falha ao salvar sugestão');
        }
      }
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      toast.error('Erro ao processar a operação');
    } finally {
      setIsToggling(false);
    }
  };

  if (activeQuery.length === 0) return null;

  return (
    <div className="mb-4 relative group">
      <div
        className={`bg-muted rounded-md p-4 ${queryExpanded ? "" : "text-muted-foreground"}`}
      >
        <div className="font-mono text-sm">
          {queryExpanded ? (
            queryExplanations && queryExplanations.length > 0 ? (
              <>
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <QueryWithTooltips
                      query={activeQuery}
                      queryExplanations={queryExplanations}
                    />
                    <p className="font-sans mt-4 text-base">
                      Generated explanation! Hover over different parts of the SQL
                      query to see explanations.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleFavorite}
                    disabled={isToggling}
                    className={`ml-2 flex-shrink-0 ${isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
                    title={isFavorite ? 'Remover das sugestões' : 'Adicionar às sugestões'}
                  >
                    <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center">
                <span className="">{activeQuery}</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleFavorite}
                    disabled={isToggling}
                    className={`h-fit ${isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
                    title={isFavorite ? 'Remover das sugestões' : 'Adicionar às sugestões'}
                  >
                    <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleExplainQuery}
                    className="h-fit hover:text-muted-foreground hidden sm:inline-block"
                    aria-label="Explain query"
                    disabled={loadingExplanation}
                  >
                    {loadingExplanation ? (
                      <Loader2 className="h-10 w-10 p-2 animate-spin " />
                    ) : (
                      <CircleHelp className="h-10 w-10 p-2 " />
                    )}
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div className="flex justify-between items-center">
              <span>
                {activeQuery.slice(0, activeQueryCutoff)}
                {activeQuery.length > activeQueryCutoff ? "..." : ""}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                disabled={isToggling}
                className={`h-fit ${isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
                title={isFavorite ? 'Remover das sugestões' : 'Adicionar às sugestões'}
              >
                <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
          )}
        </div>
      </div>
      {!queryExpanded && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setQueryExpanded(true)}
          className="absolute inset-0 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
        >
          Show full query
        </Button>
      )}
    </div>
  );
};
