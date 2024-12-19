import "../globals.css";

export const metadata = {
  title: "IGTS",
  description:
    "Dhanak 2k25 is a cultural fest organised by the students of Indian Institute of Space Science and Technology, Thiruvananthapuram.",
  icons: {
    icon: "/images/logo_half.png", // /public path
  },
  url: "https://dhanak.iist.org.in",
  type: "website",
  siteName: "Dhanak 2k25",
};

export default function SignUpLayout({ children }) {
  return (
    <section>{children}</section>
  );
}
