import { Info } from "lucide-react";
import { DeployButton } from "./deploy-button";
import { Alert, AlertDescription } from "./ui/alert";
import Link from "next/link";

export const ProjectInfo = () => {
  return (
    <div className="bg-muted p-4 mt-auto">
      <Alert className="bg-muted text-muted-foreground border-0">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription>
          Essa é uma aplicação de playground de dados. As respostas precisam ser validadas para garantir que sejam corretas.
        </AlertDescription>
      </Alert>
    </div>
  );
};
