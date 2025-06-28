<p align="center">
  <img src="https://raw.githubusercontent.com/Evren-os/Zaviye/main/.github/assets/zaviye.png" alt="Zaviye Logo" width="160">
</p>

<h1 align="center">Zaviye</h1>

<p align="center">
  A stateless application for creating and using precision AI personas.
</p>

<p align="center">
  <a href="https://zaviye.vercel.app/"><strong>Live Demo</strong></a>
</p>

<br/>

## What is Zaviye?

Zaviye is a specialized web application built on a **stateless architecture**. It is designed for creating and using single-purpose AI "personas" and is not a general-purpose conversational AI application like ChatGPT.

Each persona is governed by a specific system prompt to perform a well-defined task - such as correcting grammar, summarizing text, or generating code. Because the application is stateless, it has no memory of past interactions. Every request is a new, isolated event, ensuring that the AI's output is consistently sharp, predictable, and strictly aligned with its core instructions without the "conversational drift" common in stateful AI applications.

## Key Features

- **Persona Hub:** A central dashboard to create, manage, and run your own custom AI personas.
- **Built-in Examples:** Comes with three pre-configured personas to demonstrate its capabilities:
  - **Glitch:** Converts formal text into authentic, casual online speech.
  - **Blame:** Generates Conventional Commits-compliant git commit messages.
  - **Reson:** Provides simple, phonetic pronunciation guides for any English word.
- **Serverless by Design:** Built on a 100% client-side architecture, ensuring user privacy and eliminating the need for a backend server.
- **Modern UI:** A clean and responsive interface built with Next.js, React, and shadcn/ui.

## How It Works: The Core Mechanic

Zaviye's effectiveness is rooted in a simple, powerful formula. The quality of the output is a direct result of two factors:

1.  **The System Prompt:** The detailed instructions you provide to define the persona's behavior, rules, and goals.
2.  **The AI Model:** The underlying capability of the AI model being used (e.g., performance may vary between free vs. paid API tiers).

The interaction flow is straightforward: your system prompt and your current message are sent to the AI, which then generates a response based _only_ on that information. This makes Zaviye an ideal application for prompt engineering and building reliable, single-task AI utilities.

## Getting Started & Usage

The primary way to use Zaviye is by self-hosting it, which allows you to use your own API key.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Evren-os/Zaviye.git
    cd Zaviye
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up your environment:**
    Create a `.env.local` file in the project root and add your Google Gemini API key:

    ```
    GEMINI_API_KEY="your_gemini_api_key_here"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`. For production, you can easily deploy it to platforms like Vercel or Netlify.

## Contributing

Contributions are welcome and encouraged! If you have ideas for new features, improvements, or bug fixes, please feel free to open an issue or submit a pull request.

---

<p align="center">
  Licensed under the <a href="./LICENSE">MIT License</a>.
</p>
