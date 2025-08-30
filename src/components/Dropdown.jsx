import { Listbox } from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";

// Reusable Dropdown (no changes needed here)
export default function Dropdown({ value, setValue, options, width = "w-44" }) {
  const display = (v) => {
    if (!v && v !== "") return "";
    if (typeof v !== "string") return String(v);
    if (v.toLowerCase() === "all" || v === "select category" || v === "select difficulty") return "All";
    return v.charAt(0).toUpperCase() + v.slice(1);
  };
  return (
    <div className={`relative ${width}`}>
      <Listbox value={value} onChange={setValue}>
        <Listbox.Button className="flex justify-between items-center w-full px-3 py-2 rounded bg-[var(--color-bg)] border border-[var(--color-fg)]/10 text-[var(--color-fg)]">
          <span className="truncate">{display(value)}</span>
          <FaChevronDown className="ml-2 text-xs" />
        </Listbox.Button>
        <Listbox.Options className="absolute mt-1 w-full rounded-md bg-zinc-900 border border-[var(--color-muted)] shadow-lg max-h-60 overflow-auto focus:outline-none z-50">
          {options.map((opt) => (
            <Listbox.Option
              key={opt}
              value={opt}
              className={({ active }) =>
                `cursor-pointer select-none px-3 py-2 ${active ? "bg-zinc-800 text-white" : "text-[var(--color-fg)]"}`
              }
            >
              {typeof opt === "string" ? (opt === "all" ? "All" : opt.charAt(0).toUpperCase() + opt.slice(1)) : String(opt)}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
}