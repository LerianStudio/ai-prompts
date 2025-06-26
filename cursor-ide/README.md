# Cursor IDE Team Configuration

This repository contains our team's shared Cursor IDE configuration, designed to maintain consistency and enhance productivity across our development workflow. Cursor is an AI-powered IDE that helps us write better code faster.

## 📁 Structure

```
cursor-ide/
├── .cursor/
│   ├── rules/          # Custom rules and coding standards
│   └── mcp.json        # Model Context Protocol server configurations
├── .cursorignore       # Files/patterns to be ignored by Cursor
├── user-rules.txt      # User rules to be manually added to Cursor settings
└── README.md           # This documentation
```

## 🎯 Purpose

This configuration is designed to:
1. Enforce consistent coding standards across the team
2. Share best practices and common patterns
3. Streamline development workflows
4. Maintain code quality and architectural principles
5. Provide unified MCP server configurations

## 🔧 Configuration Components

### User Rules (user-rules.txt)

The `user-rules.txt` file contains our guidelines that need to be **manually added to Cursor's user rules settings**. This file includes:

- Front-end development standards (ReactJS, NextJS, TypeScript, etc.)
- Code implementation guidelines
- Architecture rules and best practices
- Memory and feedback handling instructions

**⚠️ Important**: These rules must be manually copied and pasted into Cursor's user rules settings as they cannot be automatically applied through configuration files.

### MCP Servers (.cursor/mcp.json)

We have configured several Model Context Protocol servers to enhance our development experience:

- **Midaz** - Financial ledger system integration
- **Memory** - Persistent memory management via Docker
- **Interactive Feedback** - Real-time feedback system
- **Context7** - Context-aware documentation and assistance
- **Sequential Thinking** - Advanced problem-solving capabilities
- **Browser Tools** - Browser-based development utilities

Each server is configured with specific commands, arguments, and timeout settings to ensure optimal performance.

### Rules (.cursor/rules/)

We have defined comprehensive rules for various aspects of development:

- **Accessibility** - Guidelines for creating accessible applications
- **API Structure** - Standards for API design and implementation
- **Clean Architecture** - Principles for maintaining clean and maintainable code
- **Coding Standards** - General coding conventions and best practices
- **Components** - Guidelines for component development
- **Git Commit** - Standards for commit messages and version control
- **Internationalization** - Rules for implementing multi-language support
- **Observability** - Standards for logging, monitoring, and debugging
- **Project Structure** - Guidelines for organizing project files and directories
- **Pull Request** - Standards for code review and pull request process
- **Security** - Security best practices and guidelines
- **Serverless Functions** - Standards for serverless development
- **Slash Commands** - Custom Cursor commands for common tasks
- **State Management** - Guidelines for managing application state
- **Testing** - Standards for writing and maintaining tests

### Ignore Rules (.cursorignore)

The `.cursorignore` file specifies which files and directories should be ignored by Cursor's AI features, including:
- Build artifacts and runtime files
- Dependencies
- Test snapshots and reports
- Logs and temporary files
- Generated code
- Large static assets
- Environment files and secrets

## 🚀 Getting Started

1. **Install [Cursor IDE](https://cursor.sh/)**

2. **Clone this repository**
   ```bash
   git clone [repository-url]
   ```

3. **Set up User Rules (Manual Step)**

4. **Apply Configuration Files**
   - Copy the `.cursor` and `.cursorignore` files to your project root
   - Restart Cursor IDE to apply the configurations

5. **Verify Setup**
   - Check that MCP servers are loaded (you should see them in Cursor's status)
   - Test that user rules are active by asking Cursor to follow the coding guidelines

## 📋 User Rules Setup Guide

Since Cursor doesn't support automatic user rules import, you need to manually add our team rules:

### Step-by-Step Instructions for Cursor v1+:

**Method 1 (Menu Navigation):**
1. **Open Cursor Settings**
   - Go to `File` → `Preferences` → `Cursor Settings`
   - Navigate to the **`Rules`** tab

2. **Add User Rules**
   - In the **`User Rules`** section
   - Open the `user-rules.txt` file from this repository
   - Copy each section and paste it into the User Rules text area
   - Save the settings

**Method 2 (Quick Command):**
1. **Open User Rules Directly**
   - Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on Mac)
   - Type and select **"View User Rules"**

2. **Add User Rules**
   - Open the `user-rules.txt` file from this repository
   - Copy each section and paste it into the User Rules text area
   - Save the settings

### Verification:
Ask Cursor to write a React component and verify it follows our guidelines (uses TypeScript, Tailwind, proper naming conventions, etc.).

### Important Notes:
- User Rules are **global** and apply to all your projects
- These rules are stored locally on your machine
- Team members need to set up these rules individually on their own Cursor installations
- User Rules are always active and included in the AI context

## 🤝 Contributing

If you want to suggest changes to our Cursor configuration:

1. Create a new branch
2. Make your changes
3. Submit a pull request with a clear description of the changes
4. Get approval from the team

## 📝 Notes

- These configurations are specifically tailored for our team's workflow
- **User rules must be manually added** - they cannot be automatically imported
- Regular updates will be made to improve and refine the rules
- Feel free to suggest improvements or report issues
- Make sure to pull the latest changes regularly and update your user rules accordingly

## MCP-Interactive Feedback

## Installation (Cursor)

![Instalation on Cursor](https://github.com/noopstudios/interactive-feedback-mcp/blob/main/.github/cursor-example.jpg?raw=true)

1.  **Prerequisites:**
    *   Python 3.11 or newer.
    *   [uv](https://github.com/astral-sh/uv) (Python package manager). Install it with:
        *   Windows: `pip install uv`
        *   Linux/Mac: `curl -LsSf https://astral.sh/uv/install.sh | sh`
2.  **Get the code:**
    *   Clone this repository:
        `git clone https://github.com/noopstudios/interactive-feedback-mcp.git`
    *   Or download the source code.
3.  **Navigate to the directory:**
    *   `cd path/to/interactive-feedback-mcp`
4.  **Install dependencies:**
    *   `uv sync` (this creates a virtual environment and installs packages)
5.  **Run the MCP Server:**
    *   `uv run server.py`
6.  **Configure in Cursor:**
    *   Cursor typically allows specifying custom MCP servers in its settings. You'll need to point Cursor to this running server. The exact mechanism might vary, so consult Cursor's documentation for adding custom MCPs.
    *   **Manual Configuration (e.g., via `mcp.json`)**
        **Remember to change the `/Users/fabioferreira/Dev/scripts/interactive-feedback-mcp` path to the actual path where you cloned the repository on your system.**

        ```json
        {
          "mcpServers": {
            "interactive-feedback-mcp": {
              "command": "uv",
              "args": [
                "--directory",
                "/Users/fabioferreira/Dev/scripts/interactive-feedback-mcp",
                "run",
                "server.py"
              ],
              "timeout": 600,
              "autoApprove": [
                "interactive_feedback"
              ]
            }
          }
        }
        ```
    *   You might use a server identifier like `interactive-feedback-mcp` when configuring it in Cursor.

## ⚠️ Important

- Do not commit any sensitive information or tokens
- Keep the rules up to date with our evolving development practices
- Make sure to pull the latest changes regularly
