import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Share2, Users, Award } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Register & Get Started",
    description:
      "Sign up for free and choose a membership package that suits your goals. Complete your profile and gain instant access to your personal dashboard.",
  },
  {
    number: "02",
    icon: Share2,
    title: "Share Your Link",
    description:
      "Share your unique referral link with friends, family, and social networks. Every click and sign-up through your link brings you closer to earning rewards.",
  },
  {
    number: "03",
    icon: Users,
    title: "Build Your Network",
    description:
      "Grow your team by sponsoring new members. Help your downlines succeed through mentorship and team support to strengthen your entire organization.",
  },
  {
    number: "04",
    icon: Award,
    title: "Earn Rewards",
    description:
      "Earn commissions, bonuses, and incentives as your network grows. Track your earnings in real time through your dashboard and withdraw anytime.",
  },
];

export default function WorkPage() {
  return (
    <div>
      <section className="py-16 bg-linear-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold">How It Works</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/20 hidden md:block" />

            <div className="space-y-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative md:pl-20">
                    {/* Number badge */}
                    <div className="hidden md:flex absolute left-0 top-0 h-16 w-16 rounded-full bg-primary text-white items-center justify-center text-lg font-bold z-10">
                      {step.number}
                    </div>

                    <Card>
                      <CardContent className="pt-8 pb-8 px-6">
                        <div className="flex items-start gap-4">
                          <div className="md:hidden flex h-12 w-12 shrink-0 rounded-full bg-primary text-white items-center justify-center font-bold">
                            {step.number}
                          </div>
                          <Icon className="hidden md:block h-8 w-8 text-primary mt-1 shrink-0" />
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
