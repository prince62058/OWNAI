# Overview

**PrinceTech AI** is a modern AI-powered search and discovery platform built with React, TypeScript, and Express. The application provides an intelligent search experience with features like trending topics, categorized content, user spaces, and personalized search history. It's designed as a Perplexity-like interface where users can ask questions and receive AI-generated responses with cited sources.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and data fetching
- **UI Components**: Radix UI primitives with custom styling through shadcn/ui
- **Theme System**: Custom theme provider with dark/light mode support using CSS variables

## Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with JSON responses
- **Middleware**: Custom logging, error handling, and authentication middleware
- **File Structure**: Modular approach with separate route handlers and business logic

## Authentication System
- **Provider**: Replit Auth using OpenID Connect (OIDC)
- **Session Management**: Express sessions with PostgreSQL storage via connect-pg-simple
- **Security**: HTTP-only cookies, secure session handling, and proper CSRF protection
- **User Management**: Automatic user creation and profile management

## Database & Data Storage
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL
- **Storage Interface**: Abstracted storage layer with both memory and database implementations
- **Data Models**: Users, searches, search history, trending topics, and spaces

## AI Integration
- **Provider**: OpenAI GPT-5 for generating search responses
- **Features**: Query processing, source citation, search suggestions
- **Response Format**: Structured JSON with content and sources
- **Error Handling**: Graceful fallbacks and retry logic

## External Dependencies

- **Database**: Neon Database (PostgreSQL serverless)
- **AI Service**: OpenAI API for GPT-5 responses
- **Authentication**: Replit Auth service for user authentication
- **Hosting**: Replit platform with development tooling integration
- **Build Tools**: Vite with React plugin and TypeScript support
- **UI Components**: Radix UI primitives and Lucide React icons