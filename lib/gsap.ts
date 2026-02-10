/**
 * 🎬 Configuration GSAP - Animations Modernes
 *
 * GSAP (GreenSock Animation Platform) pour animations fluides et performantes
 * ScrollTrigger pour animations au scroll
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Enregistrer le plugin ScrollTrigger uniquement côté client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Configuration globale GSAP
gsap.defaults({
  ease: 'power2.out',
  duration: 0.6,
})

export { gsap, ScrollTrigger }
