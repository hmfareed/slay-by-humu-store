export default function TermsPage() {
  return (
    <div className="bg-brand-bg min-h-screen text-brand-text pt-32 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-serif mb-8 text-center">Terms of Service</h1>
        <p className="text-brand-text/60 mb-12 text-center text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-brand-text/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif mb-4 text-brand-text">1. Introduction</h2>
            <p>
              Welcome to Slay By Humu. By accessing our website and purchasing our products, you agree to be bound by these Terms of Service. Please read them carefully. If you do not agree to these terms, please do not use our site or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-brand-text">2. Intellectual Property Rights</h2>
            <p>
              Unless otherwise stated, Slay By Humu and/or its licensors own the intellectual property rights for all material on Slay By Humu. All intellectual property rights are reserved. You may access this from Slay By Humu for your own personal use subjected to restrictions set in these terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-brand-text">3. Products and Pricing</h2>
            <p>
              We strive to display our products and their colors as accurately as possible. However, the actual colors you see will depend on your monitor, and we cannot guarantee that your monitor's display of any color will be accurate. All prices are subject to change without notice. We reserve the right to modify or discontinue any product at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-brand-text">4. Payment and Billing</h2>
            <p>
              By providing a payment method, you represent and warrant that you are authorized to use the designated payment method. You authorize us to charge your payment method for the total amount of your order (including any applicable taxes and shipping charges). All transactions are securely processed through Paystack.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-brand-text">5. Limitation of Liability</h2>
            <p>
              In no event shall Slay By Humu, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this website. Slay By Humu shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-brand-text">6. Governing Law</h2>
            <p>
              These Terms will be governed by and interpreted in accordance with the laws of Ghana, and you submit to the non-exclusive jurisdiction of the state and federal courts located in Ghana for the resolution of any disputes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
