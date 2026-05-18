import { Montserrat } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/providers/ReduxProvider";
import QueryProvider from "@/providers/QueryProvider";
import FcmProvider from "@/providers/FcmProvider";
import Navbar from "@/components/Navbar";
import HomeFooter from "@/components/home/HomeFooter";
import SupportWidget from "@/components/support/SupportWidget";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Luxor Stays",
  description: "Luxury campsite and vehicle bookings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased`}>
        <ReduxProvider>
          <QueryProvider>
            <FcmProvider>
              <Navbar />
              {children}
              <HomeFooter />
              <SupportWidget />
            </FcmProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
