"use client"
import { useRef } from "react";
import Image from "next/image";
import styles from "./about.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  // Specify the type within the angle brackets < >
const container = useRef<HTMLDivElement>(null);
const leftCol = useRef<HTMLDivElement>(null);
const rightCol = useRef<HTMLUListElement>(null); // rightCol is a <ul>
const image1 = useRef<HTMLDivElement>(null);
const image2 = useRef<HTMLDivElement>(null);

 useGSAP(() => {
    // 1. Text and Points Reveal
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top 80%",
        end: "bottom 20%",
        // Key change here: play on enter, reverse on leave, 
        // play again on re-entry from bottom, reverse on leave top.
        toggleActions: "play reverse play reverse", 
      },
    });

    tl.from(leftCol.current?.children || [], {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
    })
    .from(rightCol.current?.querySelectorAll("li") || [], {
      x: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out"
    }, "-=0.4");

    // 2. Parallax (Scrubbing animations naturally "repeat" based on scroll position)
    gsap.to(image1.current, {
      y: -60,
      ease: "none",
      scrollTrigger: {
        trigger: container.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });

    gsap.to(image2.current, {
      y: 60,
      ease: "none",
      scrollTrigger: {
        trigger: container.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });

  }, { scope: container });
  return (
    <section className={styles.about} id="about" ref={container}>
      <div className={styles.inner}>

        {/* LEFT COLUMN */}
        <div className={styles.left} ref={leftCol}>
          <h2>ABOUT ME</h2>

          <p className={styles.description}>
            I lead the Executive Development Center at Sukkur IBA University,
            leading projects with global partners like USAID, UNDP, UNICEF,
            and the EU. With 15,000+ lives impacted, my work drives
            entrepreneurship, climate action, youth empowerment, and rural
            development — recognized by the UN for its impact.
          </p>

          <div className={styles.metric}>
            <span className={styles.icon}>🌍</span>
            <div>
              <strong>25+</strong>
              <p>
                Collaborated with 20+ international partners, with 4
                partnerships involving UN affiliated and globally recognized
                organizations.
              </p>
            </div>
          </div>

          <div className={styles.arrow}>↗</div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.right}>
          <div className={styles.imageLarge} ref={image1}>
            <Image
              src="/about-1.jpg"
              alt="Leadership"
              fill
              className={styles.image}
            />
          </div>

          <div className={styles.imageSmall} ref={image2}>
            <Image
              src="/about-2.jpg"
              alt="Collaboration"
              fill
              className={styles.image}
            />
          </div>

          <ul className={styles.points} ref={rightCol}>
            <li>
              <strong>Transformative Leadership</strong> — Guided AACSB-accredited
              universities to become catalysts for community empowerment and
              innovation.
            </li>

            <li>
              <strong>Bridge Builder & Connector</strong> — Built impactful
              networks by fostering partnerships with USAID, UNDP, UNICEF, and
              global universities.
            </li>

            <li>
              <strong>Future-Forward Visionary</strong> — Pioneered green
              entrepreneurship programs that align business success with
              environmental responsibility.
            </li>
          </ul>
        </div>

      </div>
    </section>
  );
}