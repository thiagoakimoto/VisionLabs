import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Sparkles, Zap, Brain, Layers, Palette, Workflow } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Brain className="size-12 text-[#e27241]" />,
      title: "Advanced AI Models",
      description: "Powered by cutting-edge generative AI technology that understands context and creates stunning visuals with precision."
    },
    {
      icon: <Palette className="size-12 text-[#e27241]" />,
      title: "Creative Flexibility",
      description: "Unlimited creative possibilities with customizable styles, formats, and artistic directions tailored to your vision."
    },
    {
      icon: <Zap className="size-12 text-[#e27241]" />,
      title: "Lightning Fast",
      description: "Generate high-quality visual assets in seconds, not hours. Accelerate your creative workflow exponentially."
    },
    {
      icon: <Layers className="size-12 text-[#e27241]" />,
      title: "Multi-Format Output",
      description: "Export in any format you need - from web-optimized images to print-ready files with consistent quality."
    },
    {
      icon: <Workflow className="size-12 text-[#e27241]" />,
      title: "Seamless Integration",
      description: "Integrate effortlessly with your existing design workflow and tools through our robust API and plugins."
    },
    {
      icon: <Sparkles className="size-12 text-[#e27241]" />,
      title: "Smart Enhancement",
      description: "Automatic quality enhancement, upscaling, and refinement to ensure professional-grade results every time."
    }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      {/* Hero Section */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1660165458059-57cfb6cc87e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0ZWNobm9sb2d5JTIwQUklMjBhYnN0cmFjdHxlbnwxfHx8fDE3NzI3NTYzOTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Features background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#1a1a1a]" />
        </div>

        <div className="relative container mx-auto px-6 text-center">
          <h1 className="font-light text-4xl md:text-5xl leading-tight tracking-tight text-white mb-6">
            Powerful Features for
            <br />
            <span className="text-[#e27241]">Creative Excellence</span>
          </h1>
          <p className="font-light text-lg md:text-xl leading-relaxed text-white/80 max-w-3xl mx-auto">
            Everything you need to transform your ideas into breathtaking visual assets with unprecedented speed and quality.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative container mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-[#e27241]/50 transition-all duration-300"
            >
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="font-light text-xl leading-snug text-white mb-4">
                {feature.title}
              </h3>
              <p className="font-light text-base leading-relaxed text-white/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-light text-3xl md:text-4xl leading-tight text-white mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="font-light text-lg leading-relaxed text-white/70 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already transforming their creative workflow with VisionLab.
          </p>
          <button className="font-light text-lg text-white bg-[#e27241] hover:bg-[#d16635] transition-colors px-12 py-4 rounded-lg shadow-lg shadow-[#e27241]/20">
            Start Creating Now
          </button>
        </div>
      </div>
    </div>
  );
}
