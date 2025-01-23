import { signUp, login, logout } from "./auth";
// Signup
signUp("test@example.com", "password123")
  .then((user) => console.log("Signup success:", user))
  .catch((error) => console.error(error));

console.log("Signup function called");
