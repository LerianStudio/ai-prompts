# Claude Code with Playwright MCP: AI That Can See Its Work

Hey! Just imagine you're trying to build something cool, like a new website.

You've got Claude Code, that can write all the tricky computer code for you. That's awesome, right?

But here's a little secret: even though it's super smart, this AI can't actually see what it's building. It's like a chef who can follow a recipe perfectly but can't taste the food!

So, sometimes the website it builds might not look exactly how you want it.

This article is all about a neat trick that helps our AI helper actually see its work. It uses something called **Playwright MCP** (don't worry about the fancy name for now, just think of it as a special pair of glasses for our AI).

With these glasses, Claude Code can look at the website it's making and figure out what's wrong and fix it all by itself. Pretty cool, huh?

We'll talk about why this is a big deal and how Playwright MCP helps, and how you can set it up.

## The Problem: Our AI is a Bit Blind When it Comes to Design

So, our smart AI friend, Claude Code, is great at writing code.

It can whip up a website’s skeleton and muscles (the backend stuff) in no time.

But when it comes to the ‘face’ of the website — how it looks and feels to you, the user — it sometimes struggles. Think of it like this: if you’re building a LEGO castle, you follow the instructions step-by-step.

But what if you couldn’t actually see the castle as you were building it?

You’d just be putting pieces together based on a list. You might end up with a castle that’s technically correct but looks a bit wonky or maybe the drawbridge is in the wrong place.

That’s kind of what happens with AI and website design.

It’s working from a text description, not a visual one. So, the websites it creates can sometimes feel a bit plain or not quite right. It can’t look at its work and say,

> "Hmm, that button is a bit too big," or "This text is hard to read."

It’s like trying to draw a picture in the dark — you can follow the instructions but you won’t know what it truly looks like until the lights come on.

This means we, as humans, have to step in a lot to fix things, which takes time and effort.

```
            +---------------------+
+-----------| AI generates UI code|-----------+
|           +---------------------+           |
|                     |                       |
|                     v                       |
|           +-----------------------+         |
|           | Can AI see its output?|         |
|           +-----------------------+         |
|                  /          \               |
|          No     /            \    Yes       |
|                /              \             |
|               v                +------------+
|   +--------------------------+
|   | UI is generic/suboptimal |
|   +--------------------------+
|               |
|               v
|   +--------------------------+
|   | Requires human visual    |
+---| review & correction      |
    +--------------------------+
```

## The Solution: Giving Our AI Special Glasses (Playwright MCP)

Now, for the cool part! To help our AI friend see what it's doing we give it a special tool called **Playwright MCP**.

Think of Playwright MCP as a pair of magic glasses for our AI.

With these glasses, our AI can:

- **Control a web browser**: Just like you open Chrome or Firefox to browse the internet, Playwright MCP lets our AI open and control its own browser. It can click buttons, type in boxes, and move around web pages.

- **Take pictures (screenshots)**: When the AI makes a change to the website, it can take a quick snapshot. This is like taking a photo of your LEGO castle after adding a new tower. Now the AI can actually see what the tower looks like!

- **Read the browser's diary (console logs)**: Browsers keep a kind of diary where they write down important messages, like if something went wrong. Playwright MCP lets our AI read this diary, so it can understand if there are any hidden problems.

So, instead of just writing code blindly our AI can now build something, look at it through its special glasses and understand if it looks good or if something needs fixing.

It’s like giving our chef the ability to taste the food as they cook — they can adjust the seasoning right away instead of waiting until it’s served!

This makes the AI a much better partner in building websites.

## How Our AI Learns and Gets Better

### The Iterative Workflow and Orchestration Layer

With its new special glasses (Playwright MCP), our AI friend can now learn and improve its website designs much faster.

Think of it like this:

1. **First Try**: The AI writes some code for a part of the website, say, a new button.

2. **Look and Learn**: It then uses Playwright MCP to show that button in a real web browser. It takes a picture (screenshot) and checks how it looks. Is it too big? Is the color right? Is it in the right spot?

3. **Fix and Repeat**: If something looks off, the AI figures out what went wrong and changes its code. Then, it tries again, taking another picture, until the button looks just right. It's like a painter who keeps adjusting their brushstrokes until the painting is perfect.

This back-and-forth process, where the AI tries, sees and fixes, makes the websites much better and saves a lot of time.

It’s like having a super-fast helper who learns from their mistakes instantly!

To make this even smoother, we use something called an **"orchestration layer"**. This is just a fancy name for a central hub that gives our AI everything it needs to do its job well.

By having all these things organized in one place, our AI becomes a super-efficient website builder.

It can automatically test if the website looks good on a phone or a computer, check for mistakes and even gather information from other websites.

```
+-----------------------------------------------------------------------------------+
|                            Orchestration Layer                                    |
+-----------------------------------------------------------------------------------+
|  +---------------------+   +-----------------+   +-----------------------------+  |
|  | Context: Prompts, Docs|   | Tools: Playwright |   | Validators: Style Guides, Mocks |  |
|  +---------------------+   +-----------------+   +-----------------------------+  |
|           \                     |                          /                    |
|            \                    v                         /                     |
|             ----------------> +-----------+ <--------------                      |
|                               | AI Agent  |                                      |
|                               +-----------+                                      |
|                                     |                                          |
|                                     v                                          |
|                          +---------------------+                               |
|                          | High-Quality UI     |                               |
|                          +---------------------+                               |
+-----------------------------------------------------------------------------------+
```

## Getting Started: How to Set Up

Okay, so you want to get your Claude Code AI working with its new Playwright MCP glasses? It's not super complicated and I'll walk you through the main steps.

### 1. First, Get the Glasses (Install Playwright MCP)

To start, you need to tell Claude Code to get the Playwright MCP tool. You'll use a special command:

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

Once you do this, Claude Code knows where to find its new glasses and how to use them.

If you're using other tools like VS Code (a popular program for writing code), Cursor or Windsurf, then there are similar ways to set it up, usually by adding a small piece of text in a settings file.

### 2. Basic Settings for the Glasses (Basic Configuration)

Just like your phone apps have settings, Playwright MCP has settings too. These settings tell the AI how to use its glasses. You usually don't type these in every time; they're often saved in a special file.

Here are some common settings and what they mean:

- `--browser <browser>`: This tells the AI which web browser to use. Do you want it to use Chrome, Firefox, or something else? It's like choosing your favorite car to drive.

- `--headless`: This is a cool one! If you set this, the AI will use the browser without actually showing it on your screen. It's like having a secret agent working behind the scenes — you know it's doing its job, but you don't see it. This makes things faster.

- `--output-dir <path>`: This tells the AI where to save all the pictures (screenshots) and other notes it takes. It's like telling your camera where to put all your photos.

- `--user-data-dir <path>`: Imagine you log into your favorite website. This setting helps the AI remember that login so it doesn't have to log in every time. It's like saving your login details so you don't have to type them in again.

- `--isolated`: If you use this, the AI starts with a completely fresh browser each time, like opening a brand new browser window without any history or saved stuff. This is good for testing, like starting a game from scratch every time.

- `--viewport-size <size>`: This sets the size of the browser window the AI is looking through. It's like deciding if you want to look at the website on a big computer screen or a small phone screen.

So, a typical setup might look something like this:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--headless",
        "--viewport-size=1920,1080"
      ]
    }
  }
}
```

This basically says: "Use the latest Playwright MCP, run it secretly (headless) and pretend the screen is a big one (1920x1080 pixels)."

### 3. Custom Helpers and Quick Commands

Now, here's where it gets really cool and useful! You can teach your Claude Code AI to do specific jobs and even give it quick commands just like you might have shortcuts on your computer.

- **Custom Helpers (Subagents)**: These are 'subagents' — specialized AI helpers that focus on one thing. So, you could have a 'UI Testing Agent' whose only job is to use Playwright MCP to test your website's look and feel, take pictures of any problems, and tell you about them.

- **Quick Commands (Slash Commands)**: Ever used a shortcut like typing `/giphy` in a chat to quickly send a GIF? That's a slash command! You can set up similar quick commands for your AI. For example, you could create a `/checkwebsite` command. When you type this, your AI automatically kicks off a whole process: it builds the website, uses Playwright MCP to check it, and then tells you if everything looks good. The video even mentioned a `/iterate` command, which is like telling the AI, "Keep trying, looking, and fixing until this part of the website is perfect!"

These custom helpers and quick commands make your AI super efficient. You're basically teaching your AI your own best tricks and shortcuts!

### 4. Keeping Things Organized: Special Files for Your AI

Besides the basic settings for Playwright MCP, you can use other special files to make your AI even smarter and more organized.

- **Design Guides (Design Specifications)**: These are like detailed drawings or notes about how your website should look. They can include things like what colors to use, what fonts are best, and how different parts of the website should be laid out. Your AI can look at these files to make sure its designs match your vision.

- **Test Plans (Test Scenarios)**: These files tell your AI exactly what to test on the website. For example, "Click this button, then check if this new page appears." Or, "Make sure the website looks good when someone uses a small phone screen." It's like giving your AI a step-by-step guide for checking its work.

- **Rule Books (Validation Rules)**: These are like a set of rules that your AI uses to judge its own work. For instance, a rule might be, "All text must be easy to read for everyone," or "The website should load super fast." Your AI uses these rules to make sure its designs are not just pretty, but also work well for everyone.

By using these special files you're basically giving your AI a super clear roadmap.

Here is an ASCII diagram for that flowchart:

```
                                  +-----------------------------------+
                                  | Start: Basic Playwright MCP Setup |
                                  +-----------------------------------+
                                                  |
                                                  v
                                      +-----------------------+
                                      |  Load Special Files   |
                                      +-----------------------+
                                                  |
     +--------------------------------------------+--------------------------------------------+
     |                                            |                                            |
     v                                            v                                            v
+------------------------+           +------------------------------+           +-----------------------------+
|     Design Guides      |           |          Test Plans          |           |         Rule Books          |
|------------------------|           |------------------------------|           |-----------------------------|
| - Colors & Fonts       |           | - Click Tests                |           | - Accessibility Rules       |
| - Layout Specs         |           | - Responsive Design Tests    |           | - Performance Standards     |
| - Visual Standards     |           | - Step-by-Step Scenarios     |           | - Quality Guidelines        |
+------------------------+           +------------------------------+           +-----------------------------+
     \                                            |                                            /
      \-------------------------------------------+-------------------------------------------/
                                                  |
                                                  v
                                      +------------------------+
                                      | AI Design Generation   | <---------------------------+
                                      +------------------------+                             |
                                                  |                                          |
                                                  v                                          |
                                +-----------------------------------+                        |
                                |   Execute Tests with Playwright   |                        |
                                +-----------------------------------+                        |
                                                  |                                          |
                                                  v                                          |
                                  +---------------------------+                              |
                                  |   Validate Against Rules  |                              |
                                  +---------------------------+                              |
                                                  |                                          |
                                                  v                                          |
                                         /----------------\                                  |
                                         | All Tests Pass?|                                  |
                                         \----------------/                                  |
                                           /            \                                    |
                                     No   /              \   Yes                            |
                                        v                v                                   |
                            +-------------------+    +---------------------------+           |
                            |  Identify Issues  |    | Smart & Organized AI Output|           |
                            +-------------------+    +---------------------------+           |
                                        |                                                    |
                                        v                                                    |
                            +-----------------------+                                        |
                            | Self-Correct & Refine |                                        |
                            +-----------------------+                                        |
                                        |                                                    |
                                        +----------------------------------------------------+
```

This roadmap flowchart helps your AI understand exactly what you want and it makes it easier for you and your team to work together on projects.

## Conclusion

So, what have we learned?

By giving our Claude Code AI its special Playwright MCP, we've unlocked a whole new level of smarts for building websites. It's no longer just a code-writing machine; it's becoming a real designer that can see its creations, learn from them and make them better.

As AI keeps getting smarter, these kinds of tools will become super important by helping us make incredible things with ease.
</file>
