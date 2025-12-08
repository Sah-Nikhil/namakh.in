import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer: React.FC = () => {
    return (
        <footer className="bg-black text-white pt-12 pb-6 px- md:px-12">
            <div className="max-w-[90rem] mx-auto flex flex-col md:flex-row items-start md:items-start gap-6 md:gap-0 border-b border-gray-700 pb-4">
                {/* Logo */}
                <div className="flex flex-col justify-start items-start min-w-[120px] mr-12">
                    <div className="mb-2">
                        <Image
                            src="/assets/namakh_logo.png"
                            alt="NAMAKH Logo"
                            width={185}
                            height={40}
                            className="inline-block rounded px-2 py-1"
                            priority
                        />
                    </div>
                </div>
                {/* Columns */}
                <div className="flex flex-1 flex-row justify-between w-full">
                    {/* About */}
                    <div className="flex flex-col gap-2 min-w-[150px]">
                        <h4 className="font-semibold mb-2">About</h4>
                        <ul className="space-y-1 text-gray-300">
                            {/* <li><Link href="#" className="hover:text-white">Our Story</Link></li> */}
                            <li><Link href="#" className="hover:text-white">Formulation</Link></li>
                            {/* <li><Link href="#" className="hover:text-white">Science</Link></li> */}
                            <li><Link href="#" className="hover:text-white">Recipes</Link></li>
                        </ul>
                    </div>
                    {/* Shop */}
                    <div className="flex flex-col gap-2 min-w-[150px]">
                        <h4 className="font-semibold mb-2">Shop</h4>
                        <ul className="space-y-1 text-gray-300">
                            {/* <li><Link href="#" className="hover:text-white">Shop All</Link></li> */}
                            <li><Link href="#" className="hover:text-white">Hydration Pack</Link></li>
                            <li><Link href="#" className="hover:text-white">Sports Pack</Link></li>
                            {/* <li><Link href="#" className="hover:text-white">Merchandise</Link></li> */}
                        </ul>
                    </div>
                    {/* Resources */}
                    <div className="flex flex-col gap-2 min-w-[150px]">
                        <h4 className="font-semibold mb-2">Resources</h4>
                        <ul className="space-y-1 text-gray-300">
                            {/* <li><Link href="#" className="hover:text-white">Sign In</Link></li> */}
                            {/* <li><Link href="#" className="hover:text-white">Help Center</Link></li> */}
                            <li><Link href="#" className="hover:text-white">FAQ</Link></li>
                            <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
                            {/* <li><Link href="#" className="hover:text-white">Wholesale</Link></li> */}
                        </ul>
                    </div>
                    {/* Newsletter & Socials */}
                    <div className="flex flex-col gap-2 min-w-[220px]">
                        <div className="flex items-center">
                            <span className="font-semibold mt-1">Want the latest from</span>
                            <span className="inline-block align-middle mx-2">
                                <Image
                                    src="/assets/namakh_logo.png"
                                    alt="NAMAKH Logo"
                                    width={80}
                                    height={18}
                                    className="inline-block rounded px-1 py-0"
                                    priority
                                />
                            </span>
                            <span className="font-semibold mt-1">?</span>
                        </div>
                        <form className="flex gap-2 mb-4">
                            <input
                                type="email"
                                placeholder="Enter Email..."
                                className="px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-white w-full"
                            />
                            <button
                                type="submit"
                                className="bg-[#f4f4f4] text-[#1a1a1a] font-semibold px-4 py-2 rounded hover:bg-[#1a1a1a] hover:text-[#f4f4f4] transition whitespace-nowrap"
                            >
                                Get Notified
                            </button>
                        </form>
                        <div className="flex gap-6 text-2xl">
                            <Link href="#" aria-label="Instagram" className="hover:text-[#f4f4f4] text-[#1a1a1a]"><i className="fab fa-instagram" /></Link>
                            <Link href="#" aria-label="Twitter" className="hover:text-[#f4f4f4] text-[#1a1a1a]"><i className="fab fa-twitter" /></Link>
                            <Link href="#" aria-label="Facebook" className="hover:text-[#f4f4f4] text-[#1a1a1a]"><i className="fab fa-facebook" /></Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-6 text-xs text-gray-400">
                <div className="mb-2 md:mb-0">© {new Date().getFullYear()} NAMAKH, INC.</div>
                <div className="flex flex-wrap gap-4">
                    {/* <Link href="#" className="hover:text-white">Form C-AR Filing</Link> */}
                    <Link href="#" className="hover:text-white">Refunds & Returns</Link>
                    {/* <Link href="#" className="hover:text-white">Privacy Policy</Link> */}
                    <Link href="#" className="hover:text-white">Terms of Use</Link>
                    {/* <Link href="#" className="hover:text-white">Accessibility</Link> */}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
