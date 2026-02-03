"use client";
import { useActionState, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { login } from "@/lib/actions/auth";

export const LoginForm = () => {
  const [state, action, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-4" action={action}>
      {/* Input Número de Cuenta */}
      <div className="space-y-2">
        <Label htmlFor="num_cuenta">Número de Cuenta</Label>
        <Input
          id="num_cuenta"
          name="num_cuenta"
          placeholder="318123456"
          required
          className="h-11"
        />
      </div>

      {/* Input NIP */}
      <div className="space-y-2">
        <Label htmlFor="nip">NIP</Label>
        <div className="relative">
          <Input
            id="nip"
            name="nip"
            type={showPassword ? "text" : "password"}
            placeholder="••••"
            required
            className="h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* CORRECCIÓN: Mostrar Mensaje Global (Credenciales incorrectas) */}
      {state?.message && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {state.message}
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-11 text-base font-medium cursor-pointer"
        disabled={pending}
      >
        {pending ? (
          <Spinner />
        ) : (
          <>
            <LogIn className="w-5 h-5 mr-2" /> {/* Agregué margen */}
            Acceder al Sistema
          </>
        )}
      </Button>
    </form>
  );
};
