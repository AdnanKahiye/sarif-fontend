// "use client";

// import Link from "next/link";
// import React from "react";

// export function NavLink({ href, pathname, children }: any) {
//   const active = pathname === href;

//   return (
//     <Link
//       href={href}
//       className={`relative transition
//         ${
//           active
//             ? "font-bold text-[#00bf63]"
//             : "font-medium text-gray-700 hover:text-[#090044]"
//         }
//         after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-[#00bf63]
//         ${active ? "after:w-full" : "after:w-0 hover:after:w-full"}
//         after:transition-all`}
//     >
//       {children}
//     </Link>
//   );
// }

// export function SpecialistDropdown({ closeMenu }: { closeMenu: () => void }) {
//   const links: [string, string][] = [
//     ["Backend API Development", "/Expertise"],
//     ["System Architecture & Scalability", "/Expertise"],
//     ["Security Hardening & Compliance", "/Expertise"],
//     ["Performance Optimization", "/Expertise"],
//     ["DevOps & CI/CD Automation", "/Expertise"],
//     ["Docker & Kubernetes", "/Expertise"],
//   ];

//   return (
//     <ul className="space-y-1">
//       {links.map(([label, href]) => (
//         <li key={label}>
//           <Link
//             href={href}
//             onClick={closeMenu}
//             className="flex items-center justify-between rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#00bf63] transition"
//           >
//             <span>{label}</span>
//             <span className="text-[#00bf63]">→</span>
//           </Link>
//         </li>
//       ))}
//     </ul>
//   );
// }

// export function MobileNavItem({ href, children, active, onClick }: any) {
//   return (
//     <Link
//       href={href}
//       onClick={onClick}
//       className={`w-full max-w-sm rounded-xl px-5 py-4 text-lg font-medium transition
//         ${active ? "bg-white text-[#00bf63] shadow-sm" : "bg-white/70 text-gray-800 hover:bg-white"}
//       `}
//     >
//       <div className="flex items-center justify-between">
//         <span>{children}</span>
//         <span className="text-gray-300">→</span>
//       </div>
//     </Link>
//   );
// }

// export function MobileAccordionItem({ title, open, setOpen, children }: any) {
//   return (
//     <div className="w-full max-w-sm rounded-xl bg-white/70">
//       <button
//         type="button"
//         onClick={() => setOpen(!open)}
//         className="w-full px-5 py-4 flex items-center justify-between rounded-xl transition hover:bg-white"
//       >
//         <span className="text-lg font-bold text-[#00bf63]">{title}</span>
//         <span className="text-xl text-gray-600">{open ? "−" : "+"}</span>
//       </button>

//       <div
//         className={`px-4 pb-4 overflow-hidden transition-all duration-200
//           ${open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"}
//         `}
//       >
//         {children}
//       </div>
//     </div>
//   );
// }

// export function MobileLink({ href, children, onClose }: any) {
//   return (
//     <Link
//       href={href}
//       onClick={onClose}
//       className="w-full rounded-lg px-4 py-3 bg-white/70 hover:bg-white transition flex items-center justify-between"
//     >
//       <span className="text-sm font-medium text-gray-800">{children}</span>
//       <span className="text-gray-300">→</span>
//     </Link>
//   );
// }