import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/theme";
import App from "./App";

const app = document.getElementById("root")!;

const root = createRoot(app);
// Render react component
root.render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
);
