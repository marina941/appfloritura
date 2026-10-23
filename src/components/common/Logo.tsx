import { useEffect, useRef, useState } from "react";
import { Flower2 } from "lucide-react";

const STORAGE_KEY = "floritura-logo";

export function Logo() {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setLogoSrc(saved);
  }, []);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      localStorage.setItem(STORAGE_KEY, dataUrl);
      setLogoSrc(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <button
      type="button"
      title="Clique para enviar o logo da Floritura"
      onClick={() => inputRef.current?.click()}
      className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white/70 bg-white/10 flex items-center justify-center"
    >
      {logoSrc ? (
        <img src={logoSrc} alt="Logo A Floritura" className="h-full w-full object-cover" />
      ) : (
        <Flower2 className="h-5 w-5 text-white" strokeWidth={1.5} />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </button>
  );
}
