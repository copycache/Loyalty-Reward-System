export default function AboutPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <section
        style={{
          padding: "80px 20px",
          textAlign: "center",
          background: "#fff",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: 800,
              marginBottom: "1.5rem",
            }}
          >
            About iQON ELITE Corporation
          </h1>
          <p style={{ fontSize: "1.2rem", lineHeight: 1.8, color: "#555" }}>
            iQON ELITE Corporation is a dynamic and innovative company dedicated
            to providing premium wellness products that enhance the quality of
            life. Our flagship product, iQONCELL Stemcell Coffee, combines rich
            flavor with health benefits, setting a new standard in the coffee
            industry.
          </p>
        </div>
      </section>

      <section
        style={{
          padding: "60px 20px",
          background: "#000",
          color: "#fff",
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          <div style={{ padding: "2rem" }}>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "#FFDE59",
                marginBottom: "1rem",
              }}
            >
              Our Mission
            </h2>
            <p style={{ lineHeight: 1.8, color: "#ccc" }}>
              To make the world a better place to live in by positively
              impacting the lives of 10 million people across the globe by the
              year 2030 through innovative wellness solutions and sustainable
              business opportunities.
            </p>
          </div>

          <div style={{ padding: "2rem" }}>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "#FFDE59",
                marginBottom: "1rem",
              }}
            >
              Our Vision
            </h2>
            <p style={{ lineHeight: 1.8, color: "#ccc" }}>
              To help decrease poverty around the world by creating a &ldquo;system
              for success&rdquo; using the latest cutting-edge technology that will
              support and nurture any individual in their journey to become
              successful in business and in all areas of life.
            </p>
          </div>

          <div style={{ padding: "2rem" }}>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "#FFDE59",
                marginBottom: "1rem",
              }}
            >
              Core Values
            </h2>
            <p style={{ lineHeight: 1.8, color: "#ccc" }}>
              Integrity, Innovation, Excellence, and Community. We believe in
              building lasting relationships based on trust, delivering
              exceptional quality, and fostering a culture of growth and
              collaboration.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 20px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "2rem",
            }}
          >
            Why Choose iQON ELITE?
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
              textAlign: "left",
            }}
          >
            {[
              {
                title: "Premium Quality",
                desc: "Our products are made with the highest quality ingredients, ensuring safety and efficacy.",
              },
              {
                title: "Innovative Products",
                desc: "We continuously research and develop cutting-edge wellness solutions.",
              },
              {
                title: "Sustainable Growth",
                desc: "We provide a proven system for financial freedom and personal development.",
              },
              {
                title: "Community Focused",
                desc: "Join a thriving community of like-minded individuals working together for success.",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "1.5rem",
                  border: "1px solid #e0e0e0",
                  borderRadius: 0,
                }}
              >
                <h3
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    color: "var(--primary-color)",
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ lineHeight: 1.7, color: "#555" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
