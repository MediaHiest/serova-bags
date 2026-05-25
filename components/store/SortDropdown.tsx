"use client";

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const options = [
  { value: "newest", label: "Date, New to Old" },
  { value: "oldest", label: "Date, Old to New" },
  { value: "price_asc", label: "Price, Low to High" },
  { value: "price_desc", label: "Price, High to Low" },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      <span className="text-base text-text-muted font-medium">Sort by:</span>
      <select
        className="select-field"
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
