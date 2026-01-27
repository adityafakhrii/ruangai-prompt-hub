import { Gift, Sparkles } from "lucide-react";
import { useState } from "react";

const AnnouncementBanner = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <section className="w-full py-3">
            <div className="container mx-auto px-4">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-[2px]">
                    <div className="relative flex items-center justify-between gap-4 rounded-[10px] bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 px-4 py-4 md:px-6 md:py-5">
                        {/* Icon */}
                        <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg flex-shrink-0">
                            <Gift className="h-6 w-6 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pr-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="h-4 w-4 text-amber-600 sm:hidden" />
                                <h3 className="text-sm md:text-base font-bold text-amber-900">
                                    Kejutan Spesial untuk Lulusan RuangAI!
                                </h3>
                            </div>
                            <p className="text-xs md:text-sm text-amber-800 leading-relaxed">
                                Submit <span className="font-bold text-orange-600">10 prompt valid</span> dan dapatkan{" "}
                                <span className="font-bold text-orange-600">1 Token Kelas Spesialisasi GRATIS!</span>{" "}
                                Jika sudah tercapai, silakan klaim token kelas melalui DM Instagram{" "}
                                <a
                                    href="https://www.instagram.com/ruangai.id"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-orange-600 underline hover:text-orange-700 transition-colors"
                                >
                                    @ruangai.id
                                </a> <br />
                                Mulai berkontribusi sekarang dan tingkatkan kreativitas prompt kamu bersama RuangAI!
                            </p>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-orange-300/30 to-amber-400/30 blur-xl" />
                        <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-gradient-to-br from-yellow-300/30 to-amber-400/30 blur-xl" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AnnouncementBanner;
