export default function RefundPolicyPage() {
  return (
    <div className="bg-brand-bg min-h-screen text-brand-text pt-32 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-serif mb-8 text-center">Refund and Return Policy</h1>
        <p className="text-brand-text/60 mb-12 text-center text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-brand-text/80 leading-relaxed">
          <p>
            At <strong className="text-brand-accent">Slay By Humu</strong>, we take pride in the exceptional quality of our luxury hair extensions. We thoroughly inspect all orders before they are shipped to ensure they meet our rigorous standards. 
          </p>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-brand-text">1. Return Eligibility</h2>
            <p>
              Due to strict hygiene protocols and the nature of our products, we offer returns or exchanges <strong>only</strong> on items that have not been opened, worn, or tampered with. To be eligible for a return, the hair must remain in its original packaging, with all tags and protective seals intact.
            </p>
            <p className="mt-4">
              Return requests must be initiated within <strong>7 days</strong> of the delivery date. Any requests made after 7 days will not be accepted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-brand-text">2. Non-Returnable Items</h2>
            <p>
              The following items cannot be returned or exchanged:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Hair that has been unraveled, washed, colored, or styled.</li>
              <li>Custom orders or final sale items.</li>
              <li>Products where the original hygienic seals have been broken.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-brand-text">3. How to Request a Return</h2>
            <p>
              To initiate a return or exchange, please contact us via our Contact Page or email our support team with your order number and a brief description of the reason for the return. We may require photos to verify the condition of the product before approving a return authorization.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-brand-text">4. Refunds and Processing</h2>
            <p>
              Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
            </p>
            <p className="mt-4">
              If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment (via Paystack) within a certain amount of days. Please note that original shipping costs are non-refundable, and you are responsible for the return shipping costs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-brand-text">5. Order Cancellations</h2>
            <p>
              Order cancellations are only accepted within 24 hours of placing the order, provided the order has not yet been processed or shipped. Once an order has shipped, it is subject to our standard return policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
