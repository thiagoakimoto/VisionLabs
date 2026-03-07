import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "29",
      period: "month",
      description: "Perfect for individuals and small projects",
      features: [
        "100 AI generations per month",
        "Standard quality output",
        "Basic editing tools",
        "5 GB storage",
        "Email support",
        "Commercial license"
      ],
      highlighted: false
    },
    {
      name: "Professional",
      price: "79",
      period: "month",
      description: "Ideal for professionals and growing teams",
      features: [
        "500 AI generations per month",
        "High quality output",
        "Advanced editing suite",
        "50 GB storage",
        "Priority support",
        "Commercial license",
        "API access",
        "Team collaboration (up to 5)"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large teams and organizations",
      features: [
        "Unlimited AI generations",
        "Ultra quality output",
        "Full editing capabilities",
        "Unlimited storage",
        "24/7 dedicated support",
        "Commercial license",
        "Full API access",
        "Unlimited team members",
        "Custom integrations",
        "SLA guarantee"
      ],
      highlighted: false
    }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #e27241 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Hero Section */}
      <div className="relative py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="font-light text-4xl md:text-5xl leading-tight tracking-tight text-white mb-6">
            Simple, Transparent
            <br />
            <span className="text-[#e27241]">Pricing</span>
          </h1>
          <p className="font-light text-lg md:text-xl leading-relaxed text-white/80 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. All plans include our core features with no hidden fees.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="relative container mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 transition-all duration-300 flex flex-col ${plan.highlighted
                  ? 'border-2 border-[#e27241] shadow-2xl shadow-[#e27241]/20 lg:scale-105'
                  : 'border border-white/10 hover:border-white/20'
                }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-max">
                  <span className="bg-[#e27241] text-white px-4 py-1.5 rounded-full text-sm font-medium tracking-wide">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8 mt-2">
                <h3 className="font-light text-xl leading-snug text-white mb-2">
                  {plan.name}
                </h3>
                <p className="font-light text-base leading-relaxed text-white/60">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  {plan.price !== "Custom" && (
                    <span className="font-light text-xl leading-none text-white/60">
                      $
                    </span>
                  )}
                  <span className="font-light text-5xl leading-none tracking-tight text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="font-light text-base leading-none text-white/60">
                      /{plan.period}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="size-5 text-[#e27241] flex-shrink-0 mt-0.5" />
                    <span className="font-light text-base leading-relaxed text-white/80">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 mt-auto rounded-xl font-light text-lg transition-all duration-300 ${plan.highlighted
                    ? 'bg-[#e27241] hover:bg-[#d16635] text-white shadow-lg shadow-[#e27241]/20'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
              >
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative py-24 border-t border-white/10">
        <div className="container mx-auto px-6">
          <h2 className="font-light text-3xl md:text-4xl leading-tight text-white text-center mb-16">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "Can I switch plans anytime?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences."
              },
              {
                question: "What happens if I exceed my generation limit?",
                answer: "You can purchase additional generations as needed, or upgrade to a higher tier. Your account won't be locked - you'll just be notified."
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 14-day money-back guarantee for all new subscriptions. If you're not satisfied, contact us for a full refund."
              },
              {
                question: "Is there a free trial?",
                answer: "Yes! All plans come with a 7-day free trial with full access to features. No credit card required to start."
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <h3 className="font-light text-xl leading-snug text-white mb-3">
                  {faq.question}
                </h3>
                <p className="font-light text-base leading-relaxed text-white/70">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-light text-3xl md:text-4xl leading-tight text-white mb-6">
            Still Have Questions?
          </h2>
          <p className="font-light text-lg leading-relaxed text-white/70 mb-8 max-w-2xl mx-auto">
            Our team is here to help you find the perfect plan for your needs.
          </p>
          <button className="font-light text-lg text-white bg-[#e27241] hover:bg-[#d16635] transition-colors px-12 py-4 rounded-lg shadow-lg shadow-[#e27241]/20">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
