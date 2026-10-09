import { Suspense } from "react";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LeratoChat from "@/components/LeratoChat";

export const metadata: Metadata = {
  title: "Ask Lerato — BLOEM BULLETIN",
  description: "Ask Lerato to find local businesses, events and jobs in Bloemfontein.",
};

export default function LeratoPage() {
  return (
    <>
      <Nav />
      <main>
        <Suspense fallback={null}>
          <LeratoChat />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}