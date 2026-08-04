export function SkipToContent({ label }: { label: string }) {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-green focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
    >
      {label}
    </a>
  );
}
