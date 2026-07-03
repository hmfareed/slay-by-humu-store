export default function AboutPage() {
  return (
    <div className="bg-brand-bg min-h-screen text-brand-text pt-32 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-serif mb-8 text-center">About Us</h1>
        <div className="space-y-8 text-lg leading-relaxed text-brand-text/80">
          <p>
            Welcome to <strong className="text-brand-accent font-semibold">Slay By Humu</strong>, your premier destination for luxury raw hair and premium extensions. Founded on the belief that beauty is an art form, we are dedicated to providing our clients with top-tier hair products that embody elegance, durability, and natural beauty.
          </p>
          <p>
            Our journey began with a simple mission: to source and deliver the most exquisite, ethically-sourced hair to individuals who refuse to compromise on quality. We understand that your hair is your crown, and we take pride in offering extensions that blend seamlessly, last longer, and give you the confidence to conquer every room you enter.
          </p>
          <div className="my-12 py-12 border-y border-brand-text/10 text-center">
            <h2 className="text-2xl font-serif mb-4 text-brand-accent">Our Promise</h2>
            <p className="max-w-2xl mx-auto">
              We meticulously inspect every bundle to ensure it meets our rigorous standards. From silky straight to voluminous curls, our collections are crafted to elevate your style while maintaining the integrity and health of natural hair.
            </p>
          </div>
          <p>
            At Slay By Humu, we don't just sell hair; we provide an experience. Our commitment extends beyond our products to our exceptional customer service. We are here to support you in your hair journey, offering guidance, care tips, and a community that celebrates individuality and luxury.
          </p>
          <p>
            Thank you for choosing Slay By Humu. We are honored to be part of your beauty routine and look forward to helping you express your unique style.
          </p>
        </div>
      </div>
    </div>
  );
}
