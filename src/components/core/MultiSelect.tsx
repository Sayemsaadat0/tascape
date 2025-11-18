"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select items...",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  // Calculate dynamic height based on selections
  const buttonMinHeight = selectedLabels.length > 0 ? "min-h-[2.75rem]" : "h-11";
  const buttonPadding = selectedLabels.length > 2 ? "py-3" : "py-2";

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full px-3 rounded-full border border-gray-300 outline-none flex items-center justify-between gap-2 text-left ",
          buttonMinHeight,
          buttonPadding,
          className
        )}
      >
        <div className="flex-1 flex flex-wrap gap-1 min-h-[1.5rem] items-center">
          {selectedLabels.length > 0 ? (
            selectedLabels.map((label, idx) => {
              const option = options.find((opt) => opt.label === label);
              return (
                <span
                  key={option?.value || idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-sm text-black"
                >
                  {label}
                  <span
                    onClick={(e) => removeOption(option?.value || "", e)}
                    className="hover:bg-gray-200 rounded-full p-0.5 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        removeOption(option?.value || "", e as any);
                      }
                    }}
                  >
                    <XIcon className="w-3 h-3" />
                  </span>
                </span>
              );
            })
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDownIcon
          className={cn(
            "w-4 h-4 transition-transform text-gray-400 shrink-0",
            open && "transform rotate-180"
          )}
        />
      </button>

      {open && (
        <div 
          className={cn(
            "absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-auto",
            "w-full",
            value.length > 5 ? "max-h-80" : "max-h-60"
          )}
        >
          <div className="flex flex-wrap gap-2 p-2">
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    "px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 rounded-md border transition-colors",
                    isSelected 
                      ? "bg-t-orange/10 border-t-orange" 
                      : "bg-white border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 border rounded flex items-center justify-center shrink-0",
                      isSelected && "bg-t-orange border-t-orange"
                    )}
                  >
                    {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-black whitespace-nowrap">{option.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;

