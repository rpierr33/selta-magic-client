import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const values = [
  {
    title: 'Effective',
    description: 'Delivering real, visible results for every hair type and skin concern with scientifically-backed formulations.',
    icon: (
      <svg className="w-8 h-8 text-selta-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Inclusive',
    description: 'Safe and crafted for all hair textures, skin tones, and beauty needs — because beauty has no boundaries.',
    icon: (
      <svg className="w-8 h-8 text-selta-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: 'Empowering',
    description: 'Helping individuals embrace their natural beauty with confidence, self-love, and radiant self-expression.',
    icon: (
      <svg className="w-8 h-8 text-selta-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const qualityItems = [
  { title: 'Safe Ingredients', text: 'Made with carefully selected, safe ingredients you can trust.' },
  { title: 'Nourish & Strengthen', text: 'Designed to nourish, strengthen, and protect from root to tip.' },
  { title: 'Cruelty-Free', text: 'Always cruelty-free and tested for performance — never on animals.' },
  { title: 'Results-Driven', text: 'Every formula is rigorously developed for real, measurable results.' },
];

const About = () => {
  useEffect(() => {
    document.title = 'About Us — Selta Magic';
    window.scrollTo(0, 0);
  }, []);

  const valuesRef = useRef<HTMLDivElement>(null);
  const valuesInView = useInView(valuesRef, { once: true, margin: '-80px' });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-selta-deep-purple pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(155,135,245,0.15),_transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <AnimatedSection>
            <p className="text-selta-gold font-semibold tracking-widest uppercase text-sm mb-4">
              Our Story
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              About Selta Magic
            </h1>
            <div className="mx-auto w-24 h-1 bg-selta-gold rounded-full mb-6" />
            <p className="text-selta-light-purple/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Empowering confidence and self-love through premium hair and beauty products — since 2020.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Story + Image */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <p className="text-selta-gold font-semibold tracking-widest uppercase text-sm mb-3">
                Founded in 2020
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-selta-deep-purple mb-6">
                Where It All Began
              </h2>
              <div className="w-16 h-1 bg-selta-gold rounded-full mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                At Selta Magic, we believe that beauty starts with confidence — and confidence begins with healthy, radiant hair and skin. Since 2020, we've been committed to creating high-quality, natural hair and beauty products designed to enhance your natural glow while promoting long-lasting health and strength.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                From our nourishing Hair Growth Oil to our gentle soaps, every product is crafted with care using ingredients that are safe, effective, and inclusive for all hair types and skin needs. We know that beauty is personal, so we make sure our products are not only results-driven but also celebrate uniqueness and empower self-expression.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <div className="relative">
                <div className="absolute -inset-4 bg-selta-soft-purple rounded-2xl -rotate-2" />
                <img
                  src="/lovable-uploads/hair-oil.avif"
                  alt="Selta Magic product collection"
                  className="relative rounded-2xl shadow-xl w-full object-cover aspect-[4/3]"
                />
                <div className="absolute -bottom-3 -right-3 bg-selta-gold text-selta-deep-purple font-bold text-sm px-4 py-2 rounded-full shadow-lg">
                  Est. 2020
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-selta-soft-purple/40">
        <div className="container mx-auto px-4">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <p className="text-selta-gold font-semibold tracking-widest uppercase text-sm mb-3">
              What Drives Us
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-selta-deep-purple mb-6">
              Our Mission
            </h2>
            <div className="mx-auto w-16 h-1 bg-selta-gold rounded-full mb-8" />
            <div className="bg-white rounded-2xl shadow-lg border border-selta-soft-purple p-8 md:p-12">
              <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                To inspire confidence and self-love by delivering innovative hair and beauty solutions that are effective, inclusive, and empowering — celebrating every individual's unique beauty.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-14">
            <p className="text-selta-gold font-semibold tracking-widest uppercase text-sm mb-3">
              What We Stand For
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-selta-deep-purple mb-4">
              Our Core Values
            </h2>
            <div className="mx-auto w-16 h-1 bg-selta-gold rounded-full" />
          </AnimatedSection>

          <motion.div
            ref={valuesRef}
            variants={staggerContainer}
            initial="hidden"
            animate={valuesInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                className="group bg-white border border-selta-soft-purple rounded-2xl p-8 text-center shadow-sm hover:shadow-xl hover:border-selta-gold/40 transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-selta-soft-purple flex items-center justify-center group-hover:bg-selta-gold/20 transition-colors duration-300">
                  {v.icon}
                </div>
                <h3 className="text-xl font-bold text-selta-deep-purple mb-3">{v.title}</h3>
                <p className="text-gray-600 leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quality Promise */}
      <section className="py-20 bg-selta-deep-purple">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-14">
            <p className="text-selta-gold font-semibold tracking-widest uppercase text-sm mb-3">
              Our Commitment
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Quality Promise
            </h2>
            <div className="mx-auto w-16 h-1 bg-selta-gold rounded-full" />
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {qualityItems.map((item) => (
              <AnimatedSection key={item.title}>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-6 h-full hover:bg-white/15 transition-colors duration-300">
                  <div className="w-10 h-10 rounded-full bg-selta-gold/20 flex items-center justify-center mb-4">
                    <div className="w-3 h-3 rounded-full bg-selta-gold" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-selta-light-purple/70 leading-relaxed">{item.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-selta-soft-purple/40">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="text-2xl md:text-3xl font-bold text-selta-deep-purple mb-4">
              Experience the Magic
            </h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Discover our collection of premium hair and beauty products crafted for real results.
            </p>
            <a
              href="/shop"
              className="inline-block bg-selta-gold text-selta-deep-purple font-semibold px-8 py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-md"
            >
              Shop Now
            </a>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default About;
