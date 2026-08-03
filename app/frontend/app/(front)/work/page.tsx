import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Register & Get Started",
    description:
      "Sign up for free and choose a membership package that suits your goals. Complete your profile and gain instant access to your personal dashboard.",
  },
  {
    number: "02",
    title: "Share Your Link",
    description:
      "Share your unique referral link with friends, family, and social networks. Every click and sign-up through your link brings you closer to earning rewards.",
  },
  {
    number: "03",
    title: "Build Your Network",
    description:
      "Grow your team by sponsoring new members. Help your downlines succeed through mentorship and team support to strengthen your entire organization.",
  },
  {
    number: "04",
    title: "Earn Rewards",
    description:
      "Earn commissions, bonuses, and incentives as your network grows. Track your earnings in real time through your dashboard and withdraw anytime.",
  },
];

export default function WorkPage() {
  return (
    <div>
      <section style={{
        padding: "80px 20px",
        textAlign: "center",
        background: "#fff",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "1rem" }}>
            How It Works
          </h1>
        </div>
      </section>

      <section style={{ padding: "60px 20px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute",
              left: 35,
              top: 0,
              bottom: 0,
              width: 2,
              background: "var(--primary-color)",
              opacity: 0.3,
            }} className="hidden md:block" />

            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {steps.map((step, index) => (
                <div key={index} style={{ position: "relative", paddingLeft: "5rem" }} className="step-item">
                  <div style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    background: "var(--primary-color)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    fontWeight: "bold",
                    zIndex: 10,
                  }} className="hidden md:flex">
                    {step.number}
                  </div>

                  <Card>
                    <CardContent style={{ padding: "2rem" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          background: "var(--primary-color)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                          flexShrink: 0,
                        }} className="md:hidden">
                          {step.number}
                        </div>
                        <div>
                          <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                            {step.title}
                          </h3>
                          <p style={{ color: "#666", lineHeight: 1.7 }}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 768px) {
          .step-item {
            padding-left: 0 !important;
          }
        }
        .hidden {
          display: none !important;
        }
        @media (min-width: 768px) {
          .hidden.md\\:flex {
            display: flex !important;
          }
          .hidden.md\\:block {
            display: block !important;
          }
          .md\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
