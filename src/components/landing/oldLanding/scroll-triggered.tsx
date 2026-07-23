/**
 * @fileoverview Disabled scroll-triggered feature cards from the previous landing page design.
 *
 * The entire file is commented out and exports nothing. It previously
 * contained a ScrollTriggered component that animated feature cards (online
 * store, order management, chats, support) into view with Motion spring
 * variants as the user scrolled. Kept for reference only.
 */
// "use client"; // ensure client-side (Next.js 13+)

// import React, {CSSProperties, ReactElement, ReactNode} from "react";
// import { motion, type Variants } from "motion/react";
// import {Icon} from "@iconify/react";
// import {useTranslations} from "next-intl";
// import { Badge } from "@heroui/react";
// import {pacifico} from "@/components/fonts";

// interface CardProps {
//     icon: ReactElement;
//     title: string;
//     description: string;
// }

// const cardVariants: Variants = {
//     offscreen: {
//         y: 235,
//     },
//     onscreen: {
//         y: 50,
//         rotate: 0,
//         transition: {
//             type: "spring",
//             bounce: 0.4,
//             duration: 0.8,
//         },
//     },
// };


// /**
//  * You can convert these inline styles to Tailwind if desired,
//  * but for clarity, we'll keep them as-is from your example.
//  */
// const container: React.CSSProperties = {
//     margin: "20px auto",
//     maxWidth: 500,
//     paddingBottom: 100,
//     width: "100%",
// }

// const cardContainer: React.CSSProperties = {
//     overflow: "hidden",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     position: "relative",
//     marginTop: 10,

// }

// const splash: React.CSSProperties = {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     clipPath: `path("M 0 303.5 C 0 292.454 8.995 285.101 20 283.5 L 460 219.5 C 470.085 218.033 480 228.454 480 239.5 L 500 430 C 500 441.046 491.046 450 480 450 L 20 450 C 8.954 450 0 441.046 0 430 Z")`,
// }

// const card: React.CSSProperties = {
//     width: 300,
//     height: 450,
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 20,
//     boxShadow:
//         "0 0 1px hsl(0deg 0% 0% / 0.075), 0 0 2px hsl(0deg 0% 0% / 0.075), 0 0 4px hsl(0deg 0% 0% / 0.075), 0 0 8px hsl(0deg 0% 0% / 0.075), 0 0 16px hsl(0deg 0% 0% / 0.075)",
//     transformOrigin: "10% 60%",
// }

// const food: [string, ReactElement, string, string][] = [
//     ["features.online_store.key", <Icon icon={`solar:shop-2-broken`}/>, "features.online_store.title", "features.online_store.description"],
//     ["features.order_management.key", <Icon icon={`solar:calculator-minimalistic-broken`}/>, "features.order_management.title", "features.order_management.description"],
//     ["features.all_chats.key", <Badge color="primary" content={<p className={pacifico.className + " p-1"}>Coming Soon</p>} size="sm"><Icon icon={`solar:chat-round-dots-broken`}/></Badge>, "features.all_chats.title", "features.all_chats.description"],
//     ["features.support.key", <Icon icon={`solar:help-broken`}/>, "features.support.title", "features.support.description"],
// ];

// function Card({ icon, title, description }: CardProps) {
//     const t = useTranslations("app/(landing)/components/scroll-triggered");
//     return (
//         <motion.div
//             style={cardContainer}
//             initial="offscreen"
//             whileInView="onscreen"
//             viewport={{ amount: 1 }}
//         >
//             <div style={{ ...splash}} className={`bg-gradient-secondary`}/>
//             <motion.div style={card} variants={cardVariants} className={`bg-gradient-card`}>
//                 <div
//                      style={{display: "flex", flexDirection: "column", alignItems: "center"}}
//                      className={`h-full py-10 gap-y-6 px-6`}
//                 >
//                     <div style={{fontSize: 64}}>{icon}</div>
//                     <h2 className={`bg-gradient-text text-3xl lg:text-2xl text-center mb-4`}>{t(title)}</h2>
//                     <p className={`text-lg text-grayText`}>{t(description)}</p>
//                 </div>
//             </motion.div>
//         </motion.div>
//     )
//     // return (
//     //     <motion.div
//     //         style={cardContainer}
//     //         initial="offscreen"
//     //         whileInView="onscreen"
//     //         viewport={{ amount: 0.8 }}
//     //     >
//     //         <div style={{ ...splash}} className={`bg-gradient-secondary`}/>
//     //        <motion.div style={card} variants={cardVariants} >

//     //         </motion.div>
//     //     </motion.div>
//     // );
// }

// export default function ScrollTriggered() {
//     return (
//         <div style={container}>
//             {food.map(([key, icon, title, description]) => (
//                 <Card shadow="none" key={key} icon={icon} title={title} description={description} />
//             ))}
//         </div>
//     );
// }
