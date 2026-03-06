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
          <h3 className={styles.title}>Ending "Kitchen Confusion" with LLMs.</h3>
          
          <p className={styles.description}>
           Foodzilla solves a common kitchen problem — having a fridge full of random ingredients but not knowing what to cook. Using Large Language Models (LLMs), Foodzilla helps turn those unused ingredients into tasty meal ideas instead of letting them go to waste.
          </p>

         
        </div>

        {/* RIGHT COLUMN: The Features */}
        <div className={styles.right}>
          <ul className={styles.points}>
            <li>
              <span className={styles.pointNumber}>01</span>
              <div>
                <strong>Zero Waste Vision</strong>
                <p>We help you use leftover ingredients before they go to waste.</p>
              </div>
            </li>

            <li>
              <span className={styles.pointNumber}>02</span>
              <div>
                <strong>Creative Cooking Ideas</strong>
                <p>Our AI suggests simple and creative cooking steps using the ingredients you already have.</p>
              </div>
            </li>

            <li>
              <span className={styles.pointNumber}>03</span>
              <div>
                <strong>Instant Recipe Planning</strong>
                <p>From "I have nothing to eat" into a complete recipe in just a few seconds.</p>
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