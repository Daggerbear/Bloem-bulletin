import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function EventThanksPage() {
  return (
    <>
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold mb-3">Thanks — your event is in review</h1>
        <p className="text-cream/60 mb-6">
          It&apos;ll appear on What&apos;s On once it&apos;s been approved.
        </p>
        <Link href="/whats-on" className="btn-secondary">Back to What&apos;s On</Link>
      </main>
      <Footer />
    </>
  );
}