# Maffy

Maffy is a comprehensive Next.js application designed to facilitate the management of WhatsApp messages, groups, and webhooks. It utilizes a modern tech stack including TypeScript, Tamagui for UI components, and Supabase for backend services.

## Features

- **WhatsApp Message Management**: Send and manage various types of WhatsApp messages such as text, images, documents, audio, location, and buttons.
- **Group Management**: Efficiently organize and manage WhatsApp groups.
- **Webhook Testing**: Test and manage webhooks for real-time updates.
- **Responsive Design**: Built with Tamagui for consistent cross-platform UI.
- **Internationalization**: Supports multiple languages using i18next and expo-localization.
- **State Management**: Utilizes Zustand for efficient state management.
- **Data Fetching**: Uses TanStack React Query for data fetching and caching.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tamagui
- **Backend**: Supabase, Prisma, MongoDB
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Internationalization**: i18next, expo-localization
- **Monorepo Management**: Turbo
- **Payment Processing**: Stripe

## Getting Started

To get started with Maffy, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/spaco67/whatsapp_tester_maffy.git
   cd whatsapp_tester_maffy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your environment variables. Refer to `.env.example` for the required variables.

4. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**:
   Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

- **apps**: Contains the Next.js and Expo applications.
- **packages**: Shared code and components.
- **api**: Backend services and API routes.
- **components**: UI components built with Tamagui.
- **pages**: Next.js pages.
- **prisma**: Prisma schema and database configuration.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/). Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) before making a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tamagui](https://tamagui.dev/)
- [Supabase](https://supabase.io/)
- [Zod](https://github.com/colinhacks/zod)
- [Stripe](https://stripe.com/)
