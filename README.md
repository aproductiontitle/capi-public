# CAPI - Campaign AI Platform Interface

## Overview

CAPI is a powerful web application that enables businesses to create, manage, and execute automated phone campaigns using conversational AI. Built with modern web technologies, it provides a seamless interface for managing AI-powered voice assistants and phone campaigns at scale.

## Key Features

- **AI Voice Assistants**: Create and customize AI assistants with specific personalities and behaviors
- **Campaign Management**: Schedule and manage automated calling campaigns
- **Contact Management**: Import and organize contact lists
- **Real-time Analytics**: Monitor campaign performance, call durations, and success rates
- **Voice Integration**: Seamless integration with VAPI.ai for natural voice synthesis
- **Team Collaboration**: Multi-user support with role-based access control

## Technology Stack

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Authentication, Database, Storage)
- **Voice AI**: VAPI.ai
- **State Management**: TanStack Query

## Getting Started

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- A Supabase account
- VAPI.ai API credentials

### Local Development

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

### Configuration

1. Configure your environment variables in Supabase:
   - VAPI API key
   - Other necessary API credentials

2. Set up authentication providers in your Supabase project

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Route components
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
└── utils/         # Helper functions
```

## Deployment

You can deploy this project in several ways:

1. **Using Lovable**:
   - Visit [Lovable](https://lovable.dev/projects/36537c70-d4c9-4741-aad4-07e3b138a4bc)
   - Click on Share -> Publish

2. **Custom Domain**:
   - For custom domain deployment, we recommend using Netlify
   - Follow our [Custom domains guide](https://docs.lovable.dev/tips-tricks/custom-domain/)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Security

- All sensitive credentials are stored securely in Supabase
- Row Level Security (RLS) policies protect data access
- Regular security audits are performed

## License

This project is proprietary software. All rights reserved.
