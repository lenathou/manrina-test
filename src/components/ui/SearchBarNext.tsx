import { useState, useCallback } from 'react';
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
  // Utiliser uniquement l'état interne, ignorer la prop value pour éviter les conflits
  const [search, setSearch] = useState(value || initialValue);
  
  // Debounce et appel de onSearch
  useDebounce(
    () => {
      onSearch(search);
    },
    300,
    [search],
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

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
        onChange={handleInputChange}
      />
    </div>
  );
}

export default SearchBarNext;