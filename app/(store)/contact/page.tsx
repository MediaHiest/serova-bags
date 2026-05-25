import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-10">
        <h1 className="page-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-text-dark">
          Contact Us
        </h1>
        <div className="title-underline" />
        <p className="mt-6 text-sm sm:text-base text-text-muted max-w-lg mx-auto leading-relaxed">
          Have a question about an order, product, or partnership? Send us a message and we&apos;ll
          get back to you as soon as we can.
        </p>
      </div>

      <ContactForm />
    </div>
  );
}
