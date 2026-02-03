"use client";
import { logout } from "@/lib/actions/auth";
import { Button } from "./ui/button";

export default function LogoutButton() {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await logout();
      }}
    >
      <Button
        type="submit"
        className="cursor-pointer"
      >
        Cerrar sesión
      </Button>
    </form>
  );
}