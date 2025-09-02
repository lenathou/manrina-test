import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import Image from 'next/image';

interface SearchBarNextProps {
  initialValue?: string;
  value?: string;
  onSearch: (searchValue: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBarNext({
  onSearch,
  initialValue = "",
  value,
  placeholder = "Rechercher un produit...",
  className = ""
}: SearchBarNextProps) {
  const isControlled = value !== undefined;
  const [search, setSearch] = useState(isControlled ? value : initialValue);
  const [debouncedSearch, setDebouncedSearch] = useState(isControlled ? value : initialValue);
  
  // Sync with controlled value
  useEffect(() => {
    if (isControlled && value !== search) {
      setSearch(value);
      setDebouncedSearch(value);
    }
  }, [value, isControlled, search]);
  
  useDebounce(
    () => {
      setDebouncedSearch(search);
    },
    300,
    [search],
  );
  
  useEffect(() => {
    if (isControlled) {
      // In controlled mode, always call onSearch when debounced value changes
      onSearch(debouncedSearch);
    } else {
      // In uncontrolled mode, only call onSearch if value changed from initial
      if (debouncedSearch !== initialValue) {
        onSearch(debouncedSearch);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, isControlled]);

  return (
    <div className={`flex items-center min-w-[200px] w-full max-w-[368px] mx-auto my-0 rounded-lg border border-[#A0A6A7] px-3 py-2 gap-2 bg-white ${className}`}>
      <Image
        src="/icon-search.svg"
        alt="search icon"
        width={24}
        height={24}
        className="flex-shrink-0"
      />
      <input
        type="text"
        className="flex-1 outline-none min-h-[24px] placeholder:text-[#A0A6A7] text-[#042424]"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}

export default SearchBarNext;