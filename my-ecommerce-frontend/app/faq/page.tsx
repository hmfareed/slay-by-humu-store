export default function FAQPage() {
  return (
    <div className="bg-brand-bg min-h-screen text-brand-text pt-32 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-serif mb-12 text-center">Frequently Asked Questions</h1>
        
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold text-brand-accent mb-4">1. How long does shipping take?</h2>
            <p className="text-brand-text/80 leading-relaxed">
              Standard orders are typically processed within 2-3 business days. Delivery times vary depending on your location, but generally, local deliveries take 1-3 business days, while international shipping can take 5-10 business days. Once your order ships, you will receive a tracking number via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-accent mb-4">2. What kind of hair do you sell?</h2>
            <p className="text-brand-text/80 leading-relaxed">
              We specialize in 100% luxury raw and virgin hair extensions. Our hair is ethically sourced, unprocessed (raw), or minimally processed (virgin for certain textures) to ensure maximum longevity, natural luster, and styling versatility.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-accent mb-4">3. Can I color or bleach the hair?</h2>
            <p className="text-brand-text/80 leading-relaxed">
              Yes! Since our hair is 100% human hair, it can be dyed, bleached, and heat-styled just like your natural hair. We highly recommend having any chemical processes done by a licensed professional to protect your investment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-accent mb-4">4. How long does the hair last?</h2>
            <p className="text-brand-text/80 leading-relaxed">
              With proper care and maintenance, Slay By Humu hair can last up to 2-3 years or more. We recommend co-washing regularly, avoiding excessive heat without protectants, and wrapping your hair at night to maintain its quality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-accent mb-4">5. What is your return or exchange policy?</h2>
            <p className="text-brand-text/80 leading-relaxed">
              Due to hygiene and quality control, we only accept returns or exchanges on items that are unopened, unworn, and in their original packaging within 7 days of delivery. Please review our full Refund Policy page for detailed instructions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-accent mb-4">6. How can I contact customer support?</h2>
            <p className="text-brand-text/80 leading-relaxed">
              You can reach us through our Contact page, or by emailing us directly. Our customer support team is available Monday through Friday and typically responds within 24-48 hours.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
