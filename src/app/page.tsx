import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import LeratoCard from "@/components/LeratoCard";
import RightNow from "@/components/RightNow";
import JustLaunched from "@/components/JustLaunched";
import FeaturedBusinesses from "@/components/FeaturedBusinesses";
import WhatsOn from "@/components/WhatsOn";
import CategoryGrid from "@/components/CategoryGrid";
import CommunityUpdates from "@/components/CommunityUpdates";
import JobsTeaser from "@/components/JobsTeaser";
import EmergencyStrip from "@/components/EmergencyStrip";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <LeratoCard />
        <RightNow />
        <JustLaunched />
        <FeaturedBusinesses />
        <WhatsOn />
        <CategoryGrid />
        <CommunityUpdates />
        <JobsTeaser />
        <EmergencyStrip />
      </main>
      <Footer />
    </>
  );
}