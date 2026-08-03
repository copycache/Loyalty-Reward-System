import Image from "next/image";
import styles from "./membership.module.css";

export default function MembershipPage() {
  const packages = [
    "/Landing-Page/client-resources/package/iqon enroller bonus packes icon 01.png",
    "/Landing-Page/client-resources/package/iqon enroller bonus packes icon 1.png",
    "/Landing-Page/client-resources/package/iqon enroller bonus packes icon 2.png",
    "/Landing-Page/client-resources/package/iqon enroller bonus packes icon 3.png",
    "/Landing-Page/client-resources/package/iqon enroller bonus packes icon 4.png",
    "/Landing-Page/client-resources/package/iqon enroller bonus packes icon 5.png",
  ];

  return (
    <div className={styles.membershipContainer}>
      <section className={styles.membership}>
        {/* Desktop: 2 columns alternating */}
        <div className={styles.columnContainerDesktop}>
          <div className={styles.leftColumn}>
            <Image
              src="/Landing-Page/client-resources/package/iqon enroller bonus packes icon 01.png"
              alt="Package 1"
              width={600}
              height={400}
              className={`w-full h-auto ${styles.image}`}
            />
            <Image
              src="/Landing-Page/client-resources/package/iqon enroller bonus packes icon 2.png"
              alt="Package 3"
              width={600}
              height={400}
              className={`w-full h-auto ${styles.image}`}
            />
            <Image
              src="/Landing-Page/client-resources/package/iqon enroller bonus packes icon 4.png"
              alt="Package 5"
              width={600}
              height={400}
              className={`w-full h-auto ${styles.image}`}
            />
          </div>
          <div className={styles.rightColumn}>
            <Image
              src="/Landing-Page/client-resources/package/iqon enroller bonus packes icon 1.png"
              alt="Package 2"
              width={600}
              height={400}
              className={`w-full h-auto ${styles.image}`}
            />
            <Image
              src="/Landing-Page/client-resources/package/iqon enroller bonus packes icon 3.png"
              alt="Package 4"
              width={600}
              height={400}
              className={`w-full h-auto ${styles.image}`}
            />
            <Image
              src="/Landing-Page/client-resources/package/iqon enroller bonus packes icon 5.png"
              alt="Package 6"
              width={600}
              height={400}
              className={`w-full h-auto ${styles.image}`}
            />
          </div>
        </div>

        {/* Mobile: single column */}
        <div className={styles.columnContainerMobile}>
          <div className={styles.column}>
            {packages.map((src, idx) => (
              <Image
                key={idx}
                src={src}
                alt={`Package ${idx + 1}`}
                width={600}
                height={400}
                className={`w-full h-auto ${styles.image}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
