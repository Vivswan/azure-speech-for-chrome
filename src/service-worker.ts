// Service worker entry point
// Refactored into multiple modules for better maintainability

// Import side effects for text helpers
import "./helpers/text-helpers";

// Import bootstrap and listener registration
import { bootstrap } from "./background/bootstrap";
import { registerListeners } from "./background/listeners";

// Export handlers for backward compatibility
export { handlers } from "./background/handlers";

// Initialize the extension
bootstrap();
registerListeners();
