import Image from "next/image";

export default function OurStoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="page-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-text-dark">Our Story</h1>
        <div className="title-underline" />
      </div>

      <div className="text-center mb-10">
        <h2 className="page-title text-2xl md:text-3xl text-text-dark mb-8">Who are we?</h2>
      </div>

      <div className="space-y-6 text-text-dark font-normal leading-relaxed text-base md:text-lg mb-12">
        <p>
          We started in 2016, in our founder&apos;s bedroom! Fast forward a year later, we moved to
          his garage, and after that we grew to having our own office and expanded our production
          lines. Today our team is 25 people and still growing.
        </p>
        <p>
          Selora is an Egyptian fashion e-commerce brand, empowering independent women to wear
          whatever they want and celebrating the many characters they have.
        </p>
        <p>
          We design and produce all of our products locally. We get our inspiration from nomad
          artisans from all over Egypt.
        </p>
        <p>
          All of our manufacturing is in Egypt. We have strict quality control measures that allow
          us to deliver beautiful, durable products at affordable prices that will stay in your
          wardrobe for a long time and feel more sustainable.
        </p>
        <p>
          Every design has a story behind it, and is made with passion and lots of good energy.
        </p>
      </div>

      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-bg-off-white max-w-2xl mx-auto">
        <Image
          src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"
          alt="Selora Brand craftsmanship"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 672px"
        />
      </div>
    </div>
  );
}
