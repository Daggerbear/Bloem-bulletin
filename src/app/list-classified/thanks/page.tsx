import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function ClassifiedThanksPage() {
  return (
    <>
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold mb-3">Thanks, we got it</h1>
        <p className="text-cream/70 mb-6">
          Your classified is waiting for review. Once approved, it goes live for 30 days.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Back to home
        </Link>
      </main>
      <Footer />
    </>
  );
}