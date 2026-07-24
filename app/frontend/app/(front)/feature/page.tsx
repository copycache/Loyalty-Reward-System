import { Card, CardContent } from "@/components/ui/card";
import {
  Network,
  Wallet,
  LayoutDashboard,
  Settings,
  BarChart3,
  PieChart,
  MessageSquare,
  MessageCircle,
  Mail,
  Link,
  ShoppingBag,
} from "lucide-react";

const basicFeatures = [
  {
    icon: Network,
    title: "Genealogy Tree",
    description:
      "Visualize your entire network with an interactive genealogy tree. Track downlines, uplines, and monitor team growth effortlessly.",
  },
  {
    icon: Wallet,
    title: "eWallet",
    description:
      "Manage your earnings with a built-in digital wallet. Withdraw funds, view transaction history, and track commission payouts in real time.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Income",
    description:
      "Get a comprehensive overview of your income streams at a glance. Monitor daily, weekly, and monthly earnings from a single dashboard.",
  },
  {
    icon: Settings,
    title: "Profile Management Settings",
    description:
      "Update your personal information, change passwords, and configure account preferences through an intuitive profile management panel.",
  },
  {
    icon: BarChart3,
    title: "Income Reports",
    description:
      "Generate detailed income reports with filtering options. Analyze commission breakdowns, bonuses, and payout summaries by date range.",
  },
  {
    icon: PieChart,
    title: "Points Reports",
    description:
      "Track and analyze point-based earnings and purchases. View point accumulation, redemption history, and team performance metrics.",
  },
];

const addonFeatures = [
  {
    icon: MessageSquare,
    title: "IMS / Internal Messaging",
    description:
      "Communicate with your team and uplines through a built-in internal messaging system. Send announcements, updates, and private messages.",
  },
  {
    icon: MessageCircle,
    title: "SMS Feature",
    description:
      "Send SMS notifications directly from the system. Alert your team about important updates, promotions, and payout confirmations via text.",
  },
  {
    icon: Mail,
    title: "Emailing Feature",
    description:
      "Reach your entire network with bulk email campaigns. Send newsletters, product updates, and marketing materials with built-in email tools.",
  },
  {
    icon: Link,
    title: "Recruitment Replicated Link",
    description:
      "Generate unique replicated links for recruitment. Share your personalized link to grow your network and track sign-ups through referrals.",
  },
  {
    icon: ShoppingBag,
    title: "Product Replicated Link",
    description:
      "Share product pages with your unique replicated link. Earn commissions on sales made through your link and track order conversions.",
  },
];

export default function FeaturePage() {
  return (
    <div>
      <section className="py-16 bg-linear-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold">MLM System Features</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl space-y-16">
          {/* Basic Features */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Basic Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {basicFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index}>
                    <CardContent className="pt-8 pb-8 px-6 text-center">
                      <Icon className="h-10 w-10 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Add-on Features */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Add-on Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addonFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index}>
                    <CardContent className="pt-8 pb-8 px-6 text-center">
                      <Icon className="h-10 w-10 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
