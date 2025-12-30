# Testing Documentation

## Installation

Run the following command to install testing dependencies:

```bash
bun add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @vitest/ui @vitest/coverage-v8
```

## Running Tests

- `bun run test` - Run tests in watch mode
- `bun run test:ui` - Run tests with UI interface
- `bun run test:coverage` - Generate coverage report

## Test Structure

```
tests/
├── setup.ts           # Global test setup
├── setup.test.ts      # Basic setup verification
├── components/        # React component tests
├── unit/             # Unit tests for utilities, hooks, services
└── integration/      # Integration tests
```

## Writing Tests

### Unit Tests
```typescript
import { describe, it, expect } from "vitest";

describe("My Function", () => {
  it("should return expected value", () => {
    expect(myFunction()).toBe(expected);
  });
});
```

### Component Tests
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MyComponent } from "@/components/my-component";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

## Globals

The following globals are available without imports:
- `describe`, `it`, `test`, `expect`, `vi` from Vitest
- `render`, `screen` from @testing-library/react
- Jest DOM matchers like `toBeInTheDocument()`, `toHaveTextContent()`
