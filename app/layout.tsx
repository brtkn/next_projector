import "./global.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

//This statement means to cache nothing and fetch the latest data from server
export const revalidate = 0;

export const metadata = {
  title: "Projector",
  description: "Share and Find Creative Projects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
