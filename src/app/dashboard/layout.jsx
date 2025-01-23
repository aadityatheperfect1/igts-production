export const metadata = {
  title: "Dashboard - IGTS",
  description:
    "Dhanak 2k25 is a cultural fest organised by the students of Indian Institute of Space Science and Technology, Thiruvananthapuram.",
  icons: {
    icon: "/images/icon.png", // /public path
  },
  url: "https://igts.dhanakiist.co.in",
  type: "website",
  siteName: "IGTS - Dhanak 2k25",
};
  
  export default function DashboardLayout({ children }) {
    return (
      <section>{children}</section>
    );
  }
  