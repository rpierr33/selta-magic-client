import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
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

const contactInfo = [
  {
    icon: MapPin,
    label: 'Address',
    value: '2603 sw 85th Ave 101 miramar Fl, 33025',
    href: undefined,
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '(754) 231-7832',
    href: 'tel:+17542317832',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'info@seltamagic.com',
    href: 'mailto:info@seltamagic.com',
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: 'Mon–Fri: 9am–6pm | Sat: 10am–4pm',
    href: undefined,
  },
];

const faqs = [
  {
    question: 'What is your return policy?',
    answer: 'We accept returns within 30 days of purchase with receipt. Items must be in their original condition.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes, we proudly ship worldwide so everyone can experience Selta Magic. Shipping rates vary by destination.',
  },
  {
    question: 'Are your products cruelty-free?',
    answer: 'Absolutely. All of our products are cruelty-free and never tested on animals.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Domestic orders typically arrive within 3–7 business days. International shipping may take 7–21 business days.',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-selta-soft-purple rounded-xl overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-selta-soft-purple/30 transition-colors duration-200"
      >
        <span className="font-semibold text-selta-deep-purple text-sm md:text-base pr-4">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-selta-gold shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Contact Us — Selta Magic';
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Your message has been sent!', {
        description: 'We will get back to you as soon as possible.',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-selta-deep-purple pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(155,135,245,0.15),_transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <AnimatedSection>
            <p className="text-selta-gold font-semibold tracking-widest uppercase text-sm mb-4">
              We'd Love to Hear From You
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Get In Touch
            </h1>
            <div className="mx-auto w-24 h-1 bg-selta-gold rounded-full mb-6" />
            <p className="text-selta-light-purple/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Questions about our products, personalized recommendations, or just want to say hello? Our team is here to help.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
            {/* Contact Form — left */}
            <AnimatedSection className="lg:col-span-3">
              <div className="bg-white border border-selta-soft-purple rounded-2xl shadow-lg p-6 md:p-10">
                <h2 className="text-2xl font-bold text-selta-deep-purple mb-1">Send a Message</h2>
                <div className="w-12 h-1 bg-selta-gold rounded-full mb-6" />

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-selta-deep-purple mb-1.5">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your name"
                        className="border-selta-soft-purple focus:border-selta-gold focus:ring-selta-gold/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-selta-deep-purple mb-1.5">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="you@example.com"
                        className="border-selta-soft-purple focus:border-selta-gold focus:ring-selta-gold/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-selta-deep-purple mb-1.5">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="What is this regarding?"
                      className="border-selta-soft-purple focus:border-selta-gold focus:ring-selta-gold/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-selta-deep-purple mb-1.5">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Tell us how we can help..."
                      rows={5}
                      className="border-selta-soft-purple focus:border-selta-gold focus:ring-selta-gold/30 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-selta-gold text-selta-deep-purple font-semibold py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </AnimatedSection>

            {/* Right Column — Info + FAQ */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info Cards */}
              <AnimatedSection>
                <h2 className="text-2xl font-bold text-selta-deep-purple mb-1">Contact Info</h2>
                <div className="w-12 h-1 bg-selta-gold rounded-full mb-5" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  {contactInfo.map((item) => {
                    const Icon = item.icon;
                    const content = (
                      <div className="flex items-start gap-4 bg-selta-soft-purple/30 border border-selta-soft-purple rounded-xl p-4 hover:border-selta-gold/40 transition-colors duration-300">
                        <div className="w-10 h-10 rounded-full bg-selta-deep-purple flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-selta-gold" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-selta-gold uppercase tracking-wide mb-0.5">
                            {item.label}
                          </p>
                          <p className="text-sm text-gray-700 leading-snug">{item.value}</p>
                        </div>
                      </div>
                    );

                    return item.href ? (
                      <a key={item.label} href={item.href} className="block hover:opacity-90 transition-opacity">
                        {content}
                      </a>
                    ) : (
                      <div key={item.label}>{content}</div>
                    );
                  })}
                </div>
              </AnimatedSection>

              {/* FAQ */}
              <AnimatedSection>
                <h2 className="text-2xl font-bold text-selta-deep-purple mb-1">FAQ</h2>
                <div className="w-12 h-1 bg-selta-gold rounded-full mb-5" />

                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
