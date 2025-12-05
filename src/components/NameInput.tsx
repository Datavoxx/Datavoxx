import { useState, useEffect, useRef } from "react";
import { User, Check, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUserSession } from "@/hooks/useUserSession";

const NameInput = () => {
  const { userName, updateUserName, isLoading } = useUserSession();
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalName(userName);
  }, [userName]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    updateUserName(localName.trim());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setLocalName(userName);
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 animate-fade-in-up">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            placeholder="Ditt namn"
            className="pl-9 pr-10 h-9 w-40 text-sm bg-background/80 backdrop-blur-sm border-border/50 focus:border-foreground/50"
          />
          <button
            onClick={handleSave}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted transition-colors"
          >
            <Check className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 hover:border-foreground/30 hover:bg-muted/50 transition-all duration-300 animate-fade-in-up"
    >
      <User className="h-4 w-4 text-muted-foreground" />
      {userName ? (
        <>
          <span className="text-sm font-medium text-foreground max-w-24 truncate">
            {userName}
          </span>
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </>
      ) : (
        <span className="text-sm text-muted-foreground">Ange namn</span>
      )}
    </button>
  );
};

export default NameInput;
