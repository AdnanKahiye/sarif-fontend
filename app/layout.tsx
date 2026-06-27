import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Adnan Kahiye - System Builder",
  description: "SaaS built with Next.js",
  icons: {
    icon: "Images/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light" />
      </head>

      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            success: {
              style: { background: "#0ab39c", color: "#fff" },
              iconTheme: { primary: "#fff", secondary: "#0ab39c" },
            },
            error: {
              style: { background: "#f06548", color: "#fff" },
              iconTheme: { primary: "#fff", secondary: "#f06548" },
            },
          }}
        />
      </body>
    </html>
  );
}