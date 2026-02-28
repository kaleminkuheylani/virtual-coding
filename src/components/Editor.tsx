"use client";

export function Editor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <section className="rounded-xl border p-3">
      <h3 className="font-semibold">Editor</h3>
      <textarea
        className="mt-2 h-64 w-full rounded border p-2 font-mono text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  );
}
