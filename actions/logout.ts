export const logout = async () => {
  const response = await fetch("/api/logout", {
    method: "POST",
  }); 
    if (response.ok) {
        window.location.href = "/login";
    } else {
        console.error("Logout failed");
    }
};