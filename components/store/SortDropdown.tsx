"use client";

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const options = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 max-w-md mx-auto sm:max-w-none">
      <span className="text-sm sm:text-base text-text-muted font-medium text-center sm:text-left shrink-0">
        Sort by
      </span>
      <select
        className="select-field w-full sm:w-auto min-w-0 text-sm sm:text-base"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
