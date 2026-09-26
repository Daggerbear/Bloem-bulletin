import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function ThanksPage() {
  return (
    <>
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold mb-3">Thanks — you&apos;re in the queue</h1>
        <p className="text-cream/60 mb-6">
          Your business has been submitted and will appear in the directory
          once it&apos;s been reviewed.
        </p>
        <Link href="/directory" className="btn-secondary">Back to directory</Link>
      </main>
      <Footer />
    </>
  );
}