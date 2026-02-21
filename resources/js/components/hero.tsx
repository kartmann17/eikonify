import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    CheckCircle2,
    Zap,
    Sparkles,
    FileImage,
    ImageDown,
    Gauge,
    Search,
    MousePointerClick,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface HeroProps {
    onScrollToUpload?: () => void;
}

// Animated counter component
function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }: { end: number; duration?: number; suffix?: string; prefix?: string }) {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    let start = 0;
                    const increment = end / (duration / 16);
                    const timer = setInterval(() => {
                        start += increment;
                        if (start >= end) {
                            setCount(end);
                            clearInterval(timer);
                        } else {
                            setCount(Math.floor(start));
                        }
                    }, 16);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration, hasAnimated]);

    return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

// Animated image transformation component
function ImageTransformation() {
    const { t } = useTranslation();
    const [stage, setStage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStage(prev => (prev + 1) % 4);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full max-w-md mx-auto">
            {/* Main transformation container */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 shadow-2xl">
                {/* Animated grid background */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px',
                    }}
                />

                {/* Center transformation visual */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Original file */}
                    <div
                        className={`absolute transition-all duration-700 ease-out ${
                            stage >= 1 ? 'scale-75 -translate-x-16 opacity-50' : 'scale-100 translate-x-0 opacity-100'
                        }`}
                    >
                        <div className="relative">
                            <div className="w-32 h-40 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex flex-col items-center justify-center shadow-lg shadow-orange-500/30">
                                <FileImage className="w-12 h-12 text-white/90 mb-2" />
                                <span className="text-white font-bold text-sm">.JPEG</span>
                                <span className="text-white/70 text-xs mt-1">2.4 Mo</span>
                            </div>
                            {/* Glow effect */}
                            <div className="absolute inset-0 rounded-xl bg-orange-500/20 blur-xl -z-10" />
                        </div>
                    </div>

                    {/* Transformation particles */}
                    {stage >= 1 && stage < 3 && (
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(12)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 animate-ping"
                                    style={{
                                        left: `${30 + Math.random() * 40}%`,
                                        top: `${30 + Math.random() * 40}%`,
                                        animationDelay: `${i * 100}ms`,
                                        animationDuration: '1s',
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Arrow animation */}
                    {stage >= 1 && (
                        <div className={`transition-all duration-500 ${stage >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className="relative">
                                <Sparkles className={`w-8 h-8 text-violet-400 ${stage === 1 || stage === 2 ? 'animate-spin' : ''}`} />
                                <div className="absolute inset-0 bg-violet-500/30 blur-xl" />
                            </div>
                        </div>
                    )}

                    {/* Converted file */}
                    <div
                        className={`absolute transition-all duration-700 ease-out ${
                            stage >= 2 ? 'scale-100 translate-x-16 opacity-100' : 'scale-50 translate-x-8 opacity-0'
                        }`}
                    >
                        <div className="relative">
                            <div className="w-32 h-40 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/30">
                                <ImageDown className="w-12 h-12 text-white/90 mb-2" />
                                <span className="text-white font-bold text-sm">.WebP</span>
                                <span className="text-white/70 text-xs mt-1">680 Ko</span>
                            </div>
                            {/* Success checkmark */}
                            {stage >= 3 && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center animate-bounce shadow-lg">
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                            )}
                            {/* Glow effect */}
                            <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-xl -z-10" />
                        </div>
                    </div>
                </div>

                {/* Bottom stats bar */}
                <div className="absolute bottom-0 inset-x-0 bg-black/50 backdrop-blur-sm border-t border-white/10 p-4">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${stage >= 3 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                            <span className="text-white/70">
                                {stage === 0 && t('home.hero.animation.ready')}
                                {stage === 1 && t('home.hero.animation.analyzing')}
                                {stage === 2 && t('home.hero.animation.converting')}
                                {stage === 3 && t('home.hero.animation.done')}
                            </span>
                        </div>
                        <span className={`font-mono font-bold ${stage >= 3 ? 'text-emerald-400' : 'text-white/50'}`}>
                            {stage >= 3 ? '-72%' : '...'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Floating feature badges */}
            <div className="absolute -left-4 top-1/4 animate-float">
                <div className="bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20 flex items-center gap-2 shadow-xl">
                    <Gauge className="w-4 h-4 text-cyan-400" />
                    <span className="text-white text-xs font-medium">{t('home.hero.badges.fast')}</span>
                </div>
            </div>

            <div className="absolute -right-4 top-1/3 animate-float-delayed">
                <div className="bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20 flex items-center gap-2 shadow-xl">
                    <Search className="w-4 h-4 text-violet-400" />
                    <span className="text-white text-xs font-medium">{t('home.hero.badges.seo')}</span>
                </div>
            </div>

            <div className="absolute -left-8 bottom-1/4 animate-float-slow">
                <div className="bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20 flex items-center gap-2 shadow-xl">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-white text-xs font-medium">{t('home.hero.badges.ai')}</span>
                </div>
            </div>
        </div>
    );
}

export function Hero({ onScrollToUpload }: HeroProps) {
    const { t } = useTranslation();

    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Dramatic gradient background */}
            <div className="absolute inset-0 -z-10">
                {/* Dark base */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-background to-background" />

                {/* Animated gradient orbs */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[100px] animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-500/10 rounded-full blur-[120px]" />

                {/* Subtle noise texture */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left content */}
                    <div className="text-center lg:text-left order-2 lg:order-1">
                        {/* Eyebrow */}
                        <div className="inline-flex items-center gap-2 mb-6">
                            <Badge variant="outline" className="border-violet-500/50 text-violet-400 bg-violet-500/10 px-3 py-1">
                                <Zap className="w-3 h-3 mr-1" />
                                {t('home.hero.new')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {t('home.hero.aiOptimization')}
                            </span>
                        </div>

                        {/* Main headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6">
                            <span className="text-foreground">{t('home.hero.headline1')}</span>
                            <br />
                            <span className="relative">
                                <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                                    {t('home.hero.headline2')}
                                </span>
                                {/* Underline decoration */}
                                <svg className="absolute -bottom-2 left-0 w-full h-3 text-violet-500/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                                    <path d="M0 10 Q 50 0, 100 10 T 200 10" fill="none" stroke="currentColor" strokeWidth="4" />
                                </svg>
                            </span>
                            <br />
                            <span className="text-foreground">{t('home.hero.headline3')}</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                            {t('home.hero.subheadline', {
                                webp: (chunks: any) => <span className="text-foreground font-medium">{chunks}</span>,
                                avif: (chunks: any) => <span className="text-foreground font-medium">{chunks}</span>,
                                savings: (chunks: any) => <span className="text-emerald-500 font-bold">{chunks}</span>,
                                alt: (chunks: any) => <span className="text-foreground font-medium">{chunks}</span>,
                            }).toString().replace(/<[^>]+>/g, '')}
                        </p>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto lg:mx-0">
                            <div className="text-center lg:text-left">
                                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                                    <AnimatedCounter end={72} suffix="%" prefix="-" />
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground">{t('home.hero.stats.compression')}</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                                    <AnimatedCounter end={500} suffix="+" />
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground">{t('home.hero.stats.users')}</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                                    <AnimatedCounter end={100} suffix="%" />
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground">{t('home.hero.stats.free')}</div>
                            </div>
                        </div>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                            <Button
                                size="lg"
                                onClick={onScrollToUpload}
                                className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <MousePointerClick className="w-5 h-5" />
                                    {t('home.hero.cta')}
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </span>
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="border-white/20 hover:bg-white/5"
                            >
                                <Link href="/tarifs">
                                    {t('home.hero.ctaPro')}
                                </Link>
                            </Button>
                        </div>

                        {/* Trust indicators */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>{t('home.hero.trust.noSignup')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>{t('home.hero.trust.freeImages')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>{t('home.hero.trust.secureData')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right visual */}
                    <div className="order-1 lg:order-2">
                        <ImageTransformation />
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <button
                    onClick={onScrollToUpload}
                    className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <span className="text-xs">{t('home.hero.scroll')}</span>
                    <div className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-1">
                        <div className="w-1.5 h-3 bg-current rounded-full animate-bounce" />
                    </div>
                </button>
            </div>
        </section>
    );
}
