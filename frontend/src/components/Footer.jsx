import { Link } from "react-router-dom";
import { footerLinks } from "../assets/assets";

const Footer = () => {


    return (
        <div className="px-4 sm:px-6 lg:px-10 xl:px-16 mt-24 bg-black">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-10 py-10 border-b border-white/10 text-stone-400">
                <div>
                    {/* <img className="w-34 md:w-32" src={assets.logo} alt="dummyLogoColored" /> */}
                    <Link to="/">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Ayurvedic</h1>
                    </Link>
                </div>
                <div className="flex flex-wrap justify-between w-full lg:w-1/2 gap-5">
                    {footerLinks.map((section, index) => (
                        <div key={index}>
                            <h3 className="font-semibold text-base text-white md:mb-5 mb-2">{section.title}</h3>
                            <ul className="text-sm space-y-1">
                                {section.links.map((link, i) => (
                                    <li key={i}>
                                        {link.url.startsWith("/") ? (
                                            <Link to={link.url} onClick={() => { if (!link.url.includes("#")) scrollTo(0, 0); }} className="inline-flex min-h-11 items-center hover:text-white hover:underline transition">{link.text}</Link>
                                        ) : (
                                            <a href={link.url} target={link.url.startsWith("http") ? "_blank" : undefined} rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined} className="inline-flex min-h-11 items-center hover:text-white hover:underline transition">{link.text}</a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <p className="py-4 text-center text-sm md:text-base text-stone-500">
                Copyright {new Date().getFullYear()} © <Link to="/">Ayurvedic</Link> All Right Reserved.
            </p>
        </div>
    );
};

export default Footer