import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StateMessageProps = {
  title: string;
  description?: string;
  className?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function LoadingState({ title, className }: { title: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-muted",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p>{title}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  className,
  actionLabel,
  onAction,
}: StateMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-center text-muted",
        className
      )}
    >
      <Inbox className="h-10 w-10 text-muted/60" aria-hidden />
      <p className="font-medium text-foreground">{title}</p>
      {description ? <p className="max-w-md text-sm">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  className,
  actionLabel = "إعادة المحاولة",
  onAction,
}: StateMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-center",
        className
      )}
      role="alert"
    >
      <AlertTriangle className="h-10 w-10 text-amber-400" aria-hidden />
      <p className="font-medium text-foreground">{title}</p>
      {description ? <p className="max-w-md text-sm text-muted">{description}</p> : null}
      {onAction ? (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
