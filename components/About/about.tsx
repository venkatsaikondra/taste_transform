"use client";
import { useRef } from "react";
import styles from "./about.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lottie from "lottie-react";
import Food2 from '@/public/Animations/Food Carousel.json';
import Food1 from '@/public/Animations/food.json';
gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const container = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(contentRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: container.current,
        start: "top 75%",
      },
    });
  }, { scope: container });

  return (
    <section className={styles.about} id="about" ref={container}>
      <div className={styles.inner} ref={contentRef}>
        
        {/* LEFT COLUMN: The Story */}
        <div className={styles.left}>
          {/* Top Animation for visual hook */}
          <div className={styles.lottie_top}>
            <Lottie animationData={Food1} loop={true} />
          </div>

          <h2 className={styles.label}>THE MISSION</h2>
          <h3 className={styles.title}>Ending "Fridge Fatigue" with LLMs.</h3>
          
          <p className={styles.description}>
            Foodzilla was born out of the common kitchen dilemma: a fridge full of 
            random ingredients and zero inspiration. We use Large Language Models 
            to bridge the gap between waste and taste.
          </p>

         
        </div>

        {/* RIGHT COLUMN: The Features */}
        <div className={styles.right}>
          <ul className={styles.points}>
            <li>
              <span className={styles.pointNumber}>01</span>
              <div>
                <strong>Zero Waste Vision</strong>
                <p>Helping you use that half-used jar of pesto before it becomes a science project.</p>
              </div>
            </li>

            <li>
              <span className={styles.pointNumber}>02</span>
              <div>
                <strong>Hallucinated Creativity</strong>
                <p>Our AI suggests cooking steps that push the boundaries of traditional culinary arts.</p>
              </div>
            </li>

            <li>
              <span className={styles.pointNumber}>03</span>
              <div>
                <strong>Instant Planning</strong>
                <p>From "I have nothing to eat" to a full recipe in under 2 seconds.</p>
              </div>
            </li>
            
            {/* Bottom Animation to balance the right side */}
            <li className={styles.lottie_list_item}>
              <div className={styles.lottie_small}>
                <Lottie animationData={Food2} loop={true} />
              </div>
            </li>
          </ul>
        </div>

      </div>
    </section>
  );
}