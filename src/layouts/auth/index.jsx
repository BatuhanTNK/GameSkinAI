import Footer from "components/footer/FooterAuthDefault";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import routes from "routes.js";
import FixedPlugin from "components/fixedPlugin/FixedPlugin";
import { useTranslation } from "contexts/TranslationContext";
import { MdLanguage } from "react-icons/md";
import heroCharacterImg from "assets/img/auth/hero_character.png";
import { HiSparkles, HiBolt, HiSwatch, HiStar } from "react-icons/hi2";

export default function Auth() {
  const { t, lang, changeLanguage } = useTranslation();

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/auth") {
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };
  document.documentElement.dir = "ltr";
  return (
    <div>
      <div className="relative float-right h-full min-h-screen w-full !bg-white dark:!bg-navy-900">
        <FixedPlugin />
        <main className={`mx-auto min-h-screen`}>
          <div className="relative flex">
            <div className="mx-auto flex min-h-full w-full flex-col justify-start pt-12 md:max-w-[75%] lg:max-w-[1013px] lg:px-8 lg:pt-0 xl:min-h-[100vh] xl:max-w-[1383px] xl:px-0 xl:pl-[70px]">
              <div className="mb-auto flex flex-col pl-5 pr-5 md:pr-0 md:pl-12 lg:max-w-[48%] lg:pl-0 xl:max-w-full">
                <div className="flex items-center justify-between mt-0 w-full lg:pt-10 pr-4 lg:pr-0">
                  <Link to="/admin" className="w-max">
                    <div className="mx-auto flex h-fit w-fit items-center hover:cursor-pointer">
                      <svg
                        width="8"
                        height="12"
                        viewBox="0 0 8 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.70994 2.11997L2.82994 5.99997L6.70994 9.87997C7.09994 10.27 7.09994 10.9 6.70994 11.29C6.31994 11.68 5.68994 11.68 5.29994 11.29L0.709941 6.69997C0.319941 6.30997 0.319941 5.67997 0.709941 5.28997L5.29994 0.699971C5.68994 0.309971 6.31994 0.309971 6.70994 0.699971C7.08994 1.08997 7.09994 1.72997 6.70994 2.11997V2.11997Z"
                          fill="#A3AED0"
                        />
                      </svg>
                      <p className="ml-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {t('auth.backToDashboard')}
                      </p>
                    </div>
                  </Link>

                  {/* Language Switcher (TR / EN) */}
                  <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-navy-800 border border-gray-200/50 dark:border-white/10">
                    <MdLanguage className="ml-1 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <button
                      type="button"
                      onClick={() => changeLanguage('tr')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all duration-200 ${
                        lang === 'tr'
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'text-gray-500 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white'
                      }`}
                    >
                      TR
                    </button>
                    <button
                      type="button"
                      onClick={() => changeLanguage('en')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all duration-200 ${
                        lang === 'en'
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'text-gray-500 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                <Routes>
                  {getRoutes(routes)}
                  <Route
                    path="/"
                    element={<Navigate to="/auth/sign-in" replace />}
                  />
                </Routes>

                {/* Ultra-Premium Hero Side Banner */}
                <div className="absolute right-0 hidden h-full min-h-screen md:block lg:w-[49vw] 2xl:w-[44vw]">
                  <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0c0f24] via-[#151a4a] to-[#09071b] p-8 text-white lg:rounded-bl-[120px] xl:rounded-bl-[180px] shadow-2xl">
                    
                    {/* Ambient Neon Glow Orbs */}
                    <div className="absolute -top-32 -right-32 h-[450px] w-[450px] rounded-full bg-brand-500/25 blur-[120px] pointer-events-none" />
                    <div className="absolute -bottom-32 -left-32 h-[450px] w-[450px] rounded-full bg-purple-600/25 blur-[120px] pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

                    {/* Subtle Futuristic Grid Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

                    {/* Main Content Container */}
                    <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
                      
                      {/* Character Artwork Card with Glowing Neon Frame */}
                      <div className="relative mb-6 w-full max-w-[340px] group">
                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-brand-500 to-purple-600 opacity-75 blur-lg group-hover:opacity-100 transition duration-500" />
                        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-slate-950/70 p-2 backdrop-blur-xl shadow-2xl">
                          <img
                            src={heroCharacterImg}
                            alt="GameSkinAI Character Preview"
                            className="h-[280px] w-full rounded-2xl object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          
                          {/* Live Indicator Floating Badge */}
                          <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-bold text-white border border-white/20 backdrop-blur-md shadow-lg">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                            <span className="h-2 w-2 rounded-full bg-emerald-400 absolute" />
                            <span className="ml-2.5">AI ENGINE v2.0</span>
                          </div>

                          {/* Stats Floating Glass Card */}
                          <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-slate-900/85 p-2.5 border border-white/15 backdrop-blur-md shadow-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/30 text-brand-300">
                                <HiSparkles className="h-4 w-4 text-cyan-300" />
                              </div>
                              <div className="text-left">
                                <p className="text-[11px] font-semibold text-gray-300">Skin Generator</p>
                                <p className="text-xs font-bold text-white">50K+ Avatars</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30">
                              <HiStar className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                              <span className="text-xs font-bold text-amber-300">4.9</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Brand Title */}
                      <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-white lg:text-5xl drop-shadow-lg">
                        GameSkin<span className="bg-gradient-to-r from-cyan-400 via-brand-300 to-pink-400 bg-clip-text text-transparent">AI</span>
                      </h1>

                      {/* Subtitle */}
                      <p className="mb-6 text-sm text-indigo-200/90 font-medium leading-relaxed max-w-sm">
                        {t('auth.heroSubtitle')}
                      </p>

                      {/* Feature Highlights */}
                      <div className="flex flex-col gap-2.5 w-full max-w-sm">
                        <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-2.5 border border-white/10 backdrop-blur-md transition-all duration-200 hover:bg-white/10 hover:border-white/20">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
                            <HiBolt className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-semibold text-gray-200 text-left">
                            {t('auth.heroFeature1')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-2.5 border border-white/10 backdrop-blur-md transition-all duration-200 hover:bg-white/10 hover:border-white/20">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
                            <HiSwatch className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-semibold text-gray-200 text-left">
                            {t('auth.heroFeature2')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
