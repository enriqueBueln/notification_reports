"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface SmartComboBoxProps<T> {
  placeholder?: string;
  searchPlaceholder?: string;
  fetchInitial: () => Promise<T[]>; // Últimos 10 registros
  searchFn: (query: string) => Promise<T[]>; // Búsqueda backend
  labelField: keyof T;
  valueField: keyof T;
  secondLabelField?: string;
  disabled?: boolean;
  multiple?: boolean; // Nueva prop
  value: T | T[] | null; // Ahora puede ser array
  onSelect: (item: T | T[]) => void; // Ahora puede retornar array
  error?: string; // Para mostrar errores de validación
}

export function SmartComboBox<T>({
  placeholder = "Selecciona...",
  searchPlaceholder = "Buscar...",
  fetchInitial,
  searchFn,
  labelField,
  valueField,
  onSelect,
  value,
  secondLabelField,
  disabled,
  multiple = false,
  error,
}: SmartComboBoxProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [initialItems, setInitialItems] = useState<T[]>([]);
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const loadedInitial = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number>(0);

  // Actualizar el ancho del trigger cuando cambia
  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  // Cargar los últimos 10 al abrir por primera vez
  useEffect(() => {
    if (open && !loadedInitial.current) {
      loadedInitial.current = true;
      (async () => {
        setLoading(true);
        try {
          const data = await fetchInitial();
          setInitialItems(data);
          setItems(data); // Mostrar directamente
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [open, fetchInitial]);

  // Buscar remoto cuando el usuario escribe
  useEffect(() => {
    if (!query) {
      // Si borra, regresar a los últimos 10
      setItems(initialItems);
      return;
    }

    const run = setTimeout(async () => {
      setLoading(true);
      try {
        const remote = await searchFn(query);

        if (remote.length > 0) {
          setItems(remote);
        } else {
          // Si backend no devuelve nada, filtrar localmente los initialItems por label
          const localFiltered = initialItems.filter((item) =>
            String(item[labelField])
              .toLowerCase()
              .includes(query.toLowerCase()),
          );
          setItems(localFiltered);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(run);
  }, [query, initialItems, searchFn, labelField]);

  const selectedLabel = multiple && Array.isArray(value) && value.length > 0
    ? `${value.length} seleccionado${value.length > 1 ? 's' : ''}`
    : !multiple && value && !Array.isArray(value)
    ? String(value[labelField])
    : placeholder;

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between cursor-pointer",
              disabled && "cursor-not-allowed",
              error && "border-red-500 focus:ring-red-500"
            )}
          >
            {selectedLabel}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>

      <PopoverContent
        className="p-0"
        align="start"
        style={{ width: triggerWidth }}
      >
        <Command className="w-full">
          {/* INPUT CONTROLADO */}
          <CommandInput
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={setQuery}
            className="h-9"
            disabled={disabled}
          />

          <CommandList>
            {loading && (
              <div className="p-3 text-sm text-muted-foreground">
                Cargando...
              </div>
            )}

            {!loading && items.length === 0 && (
              <CommandEmpty>No hay resultados.</CommandEmpty>
            )}

            <CommandGroup>
              {items.map((item) => {
                const label = String(item[labelField]);
                // IMPORTANTE: usamos label como `value` para que cmdk lo pueda filtrar por texto
                return (
                  <CommandItem
                    className="text-sm"
                    key={String(item[valueField])}
                    value={`${item[valueField]}:::${label}`}
                    onSelect={(selectedValue) => {
                      // selectedValue viene como la cadena que seteamos en `value`
                      const sv = String(selectedValue ?? "");
                      const [valKey] = sv.split(":::");
                      // Intentamos encontrar por valueField primero, y si no, por label
                      const found =
                        items.find((i) => String(i[valueField]) === valKey) ??
                        items.find((i) => String(i[labelField]) === sv);
                      
                      if (multiple) {
                        // Modo múltiple
                        const currentValues = Array.isArray(value) ? value : [];
                        const isAlreadySelected = currentValues.some(
                          (v) => v[valueField] === found?.[valueField]
                        );
                        
                        if (isAlreadySelected) {
                          // Remover
                          const newValues = currentValues.filter(
                            (v) => v[valueField] !== found?.[valueField]
                          );
                          onSelect(newValues as T[]);
                        } else {
                          // Agregar
                          onSelect([...currentValues, found] as T[]);
                        }
                        // No cerrar el popover en modo múltiple
                      } else {
                        // Modo único
                        if (found) {
                          onSelect(found);
                        }
                        setOpen(false);
                        setQuery("");
                      }
                    }}
                  >
                    {label}
                    {secondLabelField && (
                      <span className="ml-2 text-muted-foreground text-xs">
                        {secondLabelField}
                      </span>
                    )}
                    <Check
                      className={cn(
                        "ml-auto",
                        multiple && Array.isArray(value)
                          ? value.some((v) => v[valueField] === item[valueField])
                            ? "opacity-100"
                            : "opacity-0"
                          : value && !Array.isArray(value) && value[valueField] === item[valueField]
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    {error && (
      <p className="text-sm text-red-500 mt-1">{error}</p>
    )}
    </div>
  );
}
