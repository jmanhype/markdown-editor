# Markdown Editor Documentation

Comprehensive documentation for the Markdown Editor application.

## Documentation Index

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, process model, security |
| [API.md](./API.md) | IPC channels, components, hooks reference |
| [CONFIGURATION.md](./CONFIGURATION.md) | Theming, CSS variables, storage keys |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Development guide, project structure |

## Quick Links

- **Getting Started**: See the main [README.md](../README.md)
- **Architecture**: [Process model](./ARCHITECTURE.md#process-architecture) | [Security](./ARCHITECTURE.md#security-model)
- **API Reference**: [IPC Channels](./API.md#ipc-api-reference) | [Components](./API.md#component-api) | [Hooks](./API.md#hooks-reference)
- **Theming**: [CSS Variables](./CONFIGURATION.md#theme-color-variables) | [Custom Themes](./CONFIGURATION.md#custom-theme-creation)
- **Development**: [Project Structure](./DEVELOPMENT.md#project-structure) | [Adding Features](./DEVELOPMENT.md#adding-new-features)

## Overview

A clean, minimal markdown editor built with Electron, React, and TypeScript featuring:

- Live preview with real-time markdown rendering
- Multiple document tabs with file system integration
- Vim and Emacs keybinding modes
- Custom theme builder with CSS variable customization
- Focus mode and distraction-free mode
- Export to HTML and PDF
