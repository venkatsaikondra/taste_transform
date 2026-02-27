/*"use client"
import React, { useState, useRef } from 'react'
import Styles from './menu.module.css'
import Link from 'next/link'
import Lottie from 'lottie-react'
import Food from '@/public/Animations/food.json'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger);

const menuLinks = [
    { path: '/', label: "Home" },
    { path: '/about', label: "About" },
    { path: '/education', label: "Education" },
    { path: '/experience', label: "Experience" },
    { path: '/projects', label: "Projects" },
    { path: '/photography', label: "Photography" },
]

const Menu = () => {
    const container = useRef<HTMLDivElement>(null);
    const menuBar = useRef<HTMLDivElement>(null);
    const resumeOverlayRef = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const tl = useRef<gsap.core.Timeline | null>(null);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    useGSAP(() => {
        // Navbar Hide/Show on Scroll logic
        const showAnim = gsap.from(menuBar.current, { 
            yPercent: -100,
            paused: true,
            duration: 0.3,
            ease: "power2.out"
        }).progress(1);

        ScrollTrigger.create({
            start: "top top",
            end: "max",
            onUpdate: (self) => {
                self.direction === 1 ? showAnim.reverse() : showAnim.play();
            }
        });

        tl.current = gsap.timeline({ paused: true });

        tl.current
            .to(`.${Styles.menu_overlay}`, {
                duration: 1,
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                ease: "power4.inOut",
            })
            .from(resumeOverlayRef.current, {
                y: -20,
                opacity: 0,
                duration: 0.5,
                ease: "power3.out"
            }, "-=0.4")
            .to(`.${Styles.menu_link_item_holder}`, {
                y: 0,
                duration: 0.8,
                stagger: 0.05,
                ease: "power4.out",
            }, "-=0.6");
    }, { scope: container });

    useGSAP(() => {
        if (isMenuOpen) {
            tl.current?.play();
        } else {
            tl.current?.reverse();
        }
    }, [isMenuOpen]);

    return (
        <div className={Styles.menu_container} ref={container}>
            {/* --- HOMEPAGE BAR --- *//*}
            <div className={Styles.menu_bar} ref={menuBar}>
                <div className={Styles.menu_logo}>
                    <Link href="/"><h1>FOODZILLA</h1></Link>
                </div>
                <Lottie animationData={Food}>
                    
                </Lottie>
                <div className={Styles.menu_controls}>
                    <div className={Styles.menu_open} onClick={toggleMenu}>
                        <p>MENU</p>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Menu;*/

"use client"
import React, { useRef } from 'react'
import Styles from './menu.module.css'
import Link from 'next/link'
import Lottie from 'lottie-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { User } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger);

const Menu = () => {
    const menuBar = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Navbar Hide/Show on Scroll logic
        const showAnim = gsap.from(menuBar.current, { 
            yPercent: -100,
            paused: true,
            duration: 0.3,
            ease: "power2.out"
        }).progress(1);

        ScrollTrigger.create({
            start: "top top",
            end: "max",
            onUpdate: (self) => {
                self.direction === 1 ? showAnim.reverse() : showAnim.play();
            }
        });
    });

    return (
        <nav className={Styles.menu_bar} ref={menuBar}>
            <div className={Styles.menu_logo}>
                <Link href="/"><h1>FOODZILLA</h1></Link>
            </div>
        

            <div className={Styles.menu_controls}>
                <Link href="/dashboard" className={Styles.nav_link}>DASHBOARD</Link>
                <Link href="/community" className={Styles.nav_link}>COMMUNITY</Link>
                <Link href="/fridge" className={Styles.cta_button}>OPEN FRIDGE</Link>
                <Link href="/profile" className={Styles.profile_icon}>
                    <User size={20} />
                </Link>
            </div>
        </nav>
    )
}

export default Menu;