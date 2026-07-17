import {ClerkProvider} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Manrope } from "next/font/google";
import { ToastProvider } from "@/context/ToastContext";

import type { Metadata } from "next";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "MELODIA - Web Player",
  description: "Spotify-like music streaming web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable}`}>
      <body className="antialiased bg-[#0A0710] text-[#F8F5F0] h-screen flex flex-col overflow-hidden font-sans font-medium select-none">
        <ClerkProvider
          appearance={({
            baseTheme: dark,
            variables: {
              colorPrimary: '#FF2E74',
              colorBackground: '#15101F',
              colorText: '#FFFFFF',
              colorTextSecondary: '#D1D5DB', // text-gray-300
              colorInputText: '#FFFFFF',
              colorInputBackground: '#211735',
              colorDanger: '#FF3366',
            } as any,
            elements: {
              // Base Modals & Cards
              card: 'bg-[#15101F] shadow-2xl rounded-[16px] border border-[#211735]',
              profilePage: 'bg-[#15101F]',
              modalCloseButton: '!text-gray-400 hover:!text-white hover:bg-white/10 rounded-full transition-colors',
              
              // Sidebar Navigation
              navbar: 'bg-[#1B1329] border-r border-[#211735]',
              navbarHeader: '!text-white',
              navbarMobileMenuRow: '!text-white',
              pageScrollBox: '!text-white',
              navbarButton: '!text-gray-400 hover:!text-white hover:bg-white/5 transition-colors',
              navbarButtonActive: 'bg-[#FF2E74]/10 !text-[#FF2E74]',
              navbarButtonIcon: 'text-inherit',
              navbarButtonText: 'text-inherit',

              // Headers & Titles
              header: 'text-white',
              headerTitle: '!text-white font-semibold text-2xl',
              headerSubtitle: '!text-gray-400',
              profileSectionTitle: 'border-b border-[#211735] pb-2',
              profileSectionTitleText: '!text-white font-semibold text-lg',
              
              // Profile Content
              profileSectionContent: 'pt-4',
              profileSectionPrimaryText: '!text-white font-medium',
              userPreviewSecondaryIdentifier: '!text-gray-300',
              userPreviewMainIdentifier: '!text-white font-semibold',
              userPreview: 'hover:bg-white/5 p-2 rounded-lg transition-colors',
              
              // Secondary & Muted Text
              formFieldLabel: '!text-gray-300 font-medium',
              formFieldHintText: '!text-gray-400',
              footerActionText: '!text-gray-400 font-medium text-[14px]',
              
              // Links & Buttons
              footerActionLink: '!text-[#FF2E74] hover:text-[#ff668c] font-semibold transition-colors text-[14px]',
              formButtonPrimary: 'bg-[#FF2E74] hover:bg-[#e02665] border-none font-bold text-white shadow-md transition-all rounded-full',
              socialButtonsBlockButton: 'border border-[#211735] shadow-sm bg-[#211735] hover:bg-white/10 transition-all text-white',
              socialButtonsBlockButtonText: 'font-medium !text-white',
              menuButton: '!text-gray-400 hover:!text-white hover:bg-white/10 transition-colors',
              accordionTriggerButton: 'hover:bg-white/5',
              
              // Badges & Inputs
              badge: 'bg-[#211735] border border-[#FF2E74]/30 text-[#FF2E74]',
              formFieldInput: 'bg-white/10 border border-white/30 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#FF2E74]/50 focus:border-[#FF2E74] focus:outline-none transition-all',
              otpCodeFieldInput: '!bg-white/10 border !border-white/30 !text-white focus:ring-2 focus:ring-[#FF2E74]/50 focus:!border-[#FF2E74] focus:outline-none transition-all',
              
              // Popover
              userButtonPopoverCard: 'bg-[#15101F] border border-[#211735] shadow-2xl',
              userButtonPopoverActionButton: 'hover:bg-white/5 text-gray-300',
              userButtonPopoverActionButtonText: '!text-white',
              userButtonPopoverActionButtonIcon: '!text-gray-400',
              userButtonPopoverFooter: '!text-gray-400',
              
              // Dividers
              dividerLine: 'bg-[#211735]',
              dividerText: '!text-gray-400',
            }
          } as any)}
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}