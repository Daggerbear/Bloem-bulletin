import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import JustLaunched from "@/components/JustLaunched";
import FeaturedBusinesses from "@/components/FeaturedBusinesses";
import WhatsOn from "@/components/WhatsOn";
import CommunityUpdates from "@/components/CommunityUpdates";
import JobsTeaser from "@/components/JobsTeaser";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <CategoryGrid />
        <JustLaunched />
        <FeaturedBusinesses />
        <WhatsOn />
        <CommunityUpdates />
        <JobsTeaser />
      </main>
      <Footer />
    </>
  );
}