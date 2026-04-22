"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  value: string;
  trigger: string;
  content: string;
}

interface AccordionProps {
  items: Item[];
}

export function Accordion({ items }: AccordionProps) {
  const [open, setOpen] = useState<string | null>(items[0]?.value ?? null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = open === item.value;
        return (
          <div key={item.value} className="rounded-lg border border-slate-700 bg-slate-900/60">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.value)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-100"
            >
              {item.trigger}
              <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen ? <div className="border-t border-slate-700 px-4 py-3 text-sm text-slate-300">{item.content}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
