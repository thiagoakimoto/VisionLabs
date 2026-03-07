import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Describe Your Vision",
      description: "Start by describing what you want to create. Use natural language to express your ideas, concepts, and creative direction.",
      image: "https://images.unsplash.com/photo-1746016168296-f2ecff6ebbc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwd29ya3NwYWNlJTIwaW50ZXJmYWNlfGVufDF8fHx8MTc3Mjc1NjM5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      number: "02",
      title: "AI Processing",
      description: "Our advanced AI analyzes your request, understands the context, and prepares to generate high-fidelity visual assets tailored to your needs.",
      image: "https://images.unsplash.com/photo-1660165458059-57cfb6cc87e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0ZWNobm9sb2d5JTIwQUklMjBhYnN0cmFjdHxlbnwxfHx8fDE3NzI3NTYzOTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      number: "03",
      title: "Refine & Customize",
      description: "Review the generated results and fine-tune them with our intuitive editing tools. Adjust colors, styles, and details until perfect.",
      image: "https://images.unsplash.com/photo-1758626052247-79003b45f802?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JrZmxvdyUyMGF1dG9tYXRpb24lMjBuZXR3b3JrfGVufDF8fHx8MTc3Mjc1NjM5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      number: "04",
      title: "Export & Deploy",
      description: "Download your assets in any format you need. Integrate seamlessly into your workflow and start using them immediately.",
      image: "https://images.unsplash.com/photo-1642606571328-fc0233172bdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcHJpY2luZyUyMGNvbmNlcHR8ZW58MXx8fHwxNzcyNzU2Mzk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      {/* Hero Section */}
      <div className="relative py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="font-light text-4xl md:text-5xl leading-tight tracking-tight text-white mb-6">
            How VisionLab
            <br />
            <span className="text-[#e27241]">Brings Ideas to Life</span>
          </h1>
          <p className="font-light text-lg md:text-xl leading-relaxed text-white/80 max-w-3xl mx-auto">
            A simple, intuitive process that transforms your concepts into stunning visual reality in minutes.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="relative container mx-auto px-6 pb-24">
        <div className="space-y-24">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } gap-12 items-center`}
            >
              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-4">
                  <span className="font-light text-5xl md:text-6xl text-[#e27241]/20">
                    {step.number}
                  </span>
                  <ArrowRight className="size-8 text-[#e27241]" />
                </div>
                <h2 className="font-light text-2xl md:text-3xl leading-snug text-white">
                  {step.title}
                </h2>
                <p className="font-light text-lg leading-relaxed text-white/70 max-w-xl">
                  {step.description}
                </p>
              </div>

              {/* Image */}
              <div className="flex-1">
                <div className="relative rounded-2xl overflow-hidden group">
                  <ImageWithFallback
                    src={step.image}
                    alt={step.title}
                    className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#e27241] rounded-full transition-all duration-1000"
                        style={{ width: `${((index + 1) / steps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 text-center">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-[#e27241]/10 to-transparent border border-[#e27241]/20 rounded-3xl p-16">
            <h2 className="font-light text-3xl md:text-4xl leading-tight text-white mb-6">
              See It in Action
            </h2>
            <p className="font-light text-lg leading-relaxed text-white/70 mb-8 max-w-2xl mx-auto">
              Experience the magic yourself. Start creating professional visual assets in minutes.
            </p>
            <button className="font-light text-lg text-white bg-[#e27241] hover:bg-[#d16635] transition-colors px-12 py-4 rounded-lg shadow-lg shadow-[#e27241]/20">
              Try VisionLab Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
