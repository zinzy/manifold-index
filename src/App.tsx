import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, ChevronRight, ArrowLeft, BookOpen, ExternalLink, Filter, Menu, X, Info, LogOut, MousePointerClick, Sun, Moon, Monitor, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getDailyReadings } from './lib/lectionary';
import contentData from './content.json';
import logoMainLight from './logo.svg';
import logoMainDark from './logo_dark.svg';
import logoSmallLight from './logo_small.svg';
import logoSmallDark from './logo_small_dark.svg';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Resource {
  type: string;
  title: string;
  collection?: string;
  author?: string;
  url: string;
  themes?: string[];
}

interface Story {
  id: string;
  title: string;
  reference: string;
  summary: string;
  themes?: string[];
  resources: Resource[];
}

interface BibleBook {
  id: string;
  number: number;
  name: string;
  category: string;
  description: string;
  stories: Story[];
  resources?: Resource[];
}

// --- Components ---

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
      root.classList.add(isDark ? 'dark' : 'light');

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const newIsDark = e.matches;
        root.classList.remove('light', 'dark');
        root.classList.add(newIsDark ? 'dark' : 'light');
        setResolvedTheme(newIsDark ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setResolvedTheme(theme);
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const pos = theme === 'light' ? 0 : theme === 'system' ? 1 : 2;
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="flex items-center gap-3">
      <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", theme === 'light' ? 'text-brand-text' : 'text-brand-muted')}>Light</span>

      <div
        className={cn(
          "flex items-center h-7 w-16 rounded-full border px-1 cursor-pointer card-shadow transition-all",
          isDark ? "border-transparent" : "bg-black/5 border-transparent"
        )}
        style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '' }}
        onClick={() => {
          if (theme === 'light') setTheme('system');
          else if (theme === 'system') setTheme('dark');
          else setTheme('light');
        }}
        title="Toggle dark mode"
      >
        <motion.div
          animate={{ x: pos * 18 }}
          className="h-5 w-5 rounded-full bg-white dark:bg-brand-bg shadow flex items-center justify-center"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {theme === 'light' ? <Sun className="w-3 h-3 text-amber-500" /> :
            theme === 'dark' ? <Moon className="w-3 h-3 text-indigo-400" /> :
              <Monitor className="w-3 h-3 text-brand-muted" />}
        </motion.div>
      </div>

      <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", theme === 'dark' ? 'text-brand-text' : 'text-brand-muted')}>Dark</span>
    </div>
  );
};

const CategoryBadge = ({ category }: { category: string }) => {
  const styles: Record<string, string> = {
    'Pentateuch': 'bg-category-pentateuch text-category-pentateuch-dot',
    'Historical Books': 'bg-category-historical text-category-historical-dot',
    'Writings': 'bg-category-writings text-category-writings-dot',
    'Wisdom': 'bg-category-wisdom text-category-wisdom-dot',
    'Prophets': 'bg-category-prophets text-category-prophets-dot',
    'Deuterocanonical': 'bg-category-deuterocanonical text-category-deuterocanonical-dot',
    'Gospels': 'bg-category-gospels text-category-gospels-dot',
    'Acts of Apostles': 'bg-category-acts text-category-acts-dot',
    'Pauline Epistles': 'bg-category-pauline text-category-pauline-dot',
    'Catholic Epistles': 'bg-category-catholic text-category-catholic-dot',
    'Apocalypse': 'bg-category-apocalypse text-category-apocalypse-dot',
  };

  const dotStyles: Record<string, string> = {
    'Pentateuch': 'bg-category-pentateuch-dot',
    'Historical Books': 'bg-category-historical-dot',
    'Writings': 'bg-category-writings-dot',
    'Wisdom': 'bg-category-wisdom-dot',
    'Prophets': 'bg-category-prophets-dot',
    'Deuterocanonical': 'bg-category-deuterocanonical-dot',
    'Gospels': 'bg-category-gospels-dot',
    'Acts of Apostles': 'bg-category-acts-dot',
    'Pauline Epistles': 'bg-category-pauline-dot',
    'Catholic Epistles': 'bg-category-catholic-dot',
    'Apocalypse': 'bg-category-apocalypse-dot',
  };

  return (
    <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", styles[category] || 'bg-gray-100 text-gray-500')}>
      <span className={cn("w-1 h-1 rounded-full mr-1.5", dotStyles[category] || 'bg-gray-400')} />
      {category}
    </div>
  );
};

const LogoLink = ({ size = 'small' }: { size?: 'small' | 'large' }) => {
  const location = useLocation();
  const isFrontPage = location.pathname === '/';
  const { resolvedTheme } = useTheme();

  const logoMainImg = resolvedTheme === 'dark' ? logoMainDark : logoMainLight;
  const logoSmallImg = resolvedTheme === 'dark' ? logoSmallDark : logoSmallLight;

  return (
    <Link
      to="/"
      className="relative flex items-center group isolate"
    >
      {!isFrontPage && (
        <motion.div
          initial={{ opacity: 0, x: 2 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="hidden md:flex absolute -left-6 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 text-brand-muted" />
        </motion.div>
      )}
      <div className="relative flex items-center justify-center">
        {!isFrontPage && (
          <div className="absolute -inset-3 rounded-xl border border-transparent group-hover:border-black/5 group-hover:bg-black/[0.02] transition-all duration-200 pointer-events-none" />
        )}
        <img
          src={size === 'large' ? logoMainImg : logoSmallImg}
          alt="Manifold"
          className={cn(
            "relative z-10 w-auto transition-all",
            size === 'large' ? "h-10 md:h-12" : "h-6 md:h-7"
          )}
        />
      </div>
    </Link>
  );
};



const Header = () => {
  const [isWipOpen, setIsWipOpen] = useState(false);

  return (
    <>
      <header className="pt-8 md:pt-16 pb-12 px-6 max-w-5xl mx-auto relative">
        <div className="absolute top-4 right-6 md:top-6">
          <ThemeToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mt-32 mb-10 inline-block relative">
            <LogoLink size="large" />
            <motion.div
              onClick={() => setIsWipOpen(true)}
              initial={{ rotate: 8 }}
              whileHover={{
                scale: 1.15,
                rotate: -4,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              className="absolute -top-4 -right-8 md:-right-10 bg-yellow-200 text-yellow-900 border border-yellow-900/20 text-[10px] md:text-xs font-black px-2 py-0.5 shadow-sm origin-bottom-left cursor-pointer"
              style={{
                fontFamily: '"Marker Felt", "Comic Sans MS", "Chalkboard SE", sans-serif',
                borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px'
              }}
            >
              WIP
            </motion.div>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl leading-tight max-w-2xl font-normal text-brand-text">
            A free repository of inclusive, liberating, deconstructing, queer-affirming, anti-racist, trauma-sensitive resources on every single story in the Bible
          </h1>
        </motion.div>
      </header>

      <AnimatePresence>
        {isWipOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWipOpen(false)}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden"
            >
              <div className="p-8 pb-6">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">This is a work in progress</h2>
                  <p className="text-gray-600 leading-relaxed text-sm">The Manifold Index is a passion project by <a href="https://zinzy.website" target="_blank" rel="noopener noreferrer">Zinzy Waleson Geene</a>, and is updated at her convenience.</p>
                </div>
                {/* <div className="flex justify-end">
                  <a href="https://zinzy.website" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#6576F3] text-white rounded-xl font-medium text-sm hover:bg-[#5260c7] transition-colors focus:outline-none focus:ring-4 focus:ring-[#6576F3]/20"
                  >
                    <MousePointerClick className="w-4 h-4" />
                    More about this project
                  </a>
                </div> */}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = () => {
  const getOrigin = (url: string) => {
    try {
      const u = new URL(url);
      return { origin: u.origin, hostname: u.hostname.replace(/^www\./, '') };
    } catch {
      return null;
    }
  };

  const domainCounts = new Map<string, { origin: string; count: number }>();

  const addDomain = (url: string) => {
    const parsed = getOrigin(url);
    if (!parsed) return;
    if (parsed.hostname === 'archive.org') return;

    const existing = domainCounts.get(parsed.hostname);
    if (existing) {
      existing.count += 1;
    } else {
      domainCounts.set(parsed.hostname, { origin: parsed.origin, count: 1 });
    }
  };

  (contentData.books as BibleBook[]).forEach(book => {
    if (book.resources) {
      book.resources.forEach(r => addDomain(r.url));
    }
    book.stories.forEach(story => {
      story.resources.forEach(r => addDomain(r.url));
    });
  });

  const domains = Array.from(domainCounts.entries())
    .filter(([_, data]) => data.count >= 2)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([hostname, data]) => [hostname, data.origin]);

  let totalStories = 0;
  let totalResources = 0;
  let storiesWithResources = 0;

  (contentData.books as BibleBook[]).forEach(book => {
    if (book.resources) {
      totalResources += book.resources.length;
    }
    book.stories.forEach(story => {
      totalStories++;
      if (story.resources && story.resources.length > 0) {
        storiesWithResources++;
        totalResources += story.resources.length;
      }
    });
  });

  const coveragePercentage = totalStories > 0 ? Math.round((storiesWithResources / totalStories) * 100) : 0;

  return (
    <footer className="py-6 md:py-8 px-6 border-t border-black/5 mt-12">
      {domains.length > 0 && (
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-6 text-center border-b border-black/5 pb-4">
            Frequently-used sources
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {domains.map(([hostname, origin]) => (
              <a
                key={hostname}
                href={origin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-brand-card hover:bg-white border border-black/5 hover:border-black/20 rounded-lg card-shadow transition-all group"
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                  alt=""
                  className="w-4 h-4 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                />
                <span className="text-xs font-semibold text-brand-muted group-hover:text-[#6576F3] transition-colors">
                  {hostname}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto text-center text-sm text-brand-muted font-medium">
        {(import.meta as any).env.DEV && (
          <div className="mb-12 mt-6 p-6 rounded-xl bg-brand-card/50 border border-black/5 text-left max-w-sm mx-auto">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#6576F3] mb-4">Local Dev Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-brand-text">
                <span className="text-brand-muted">Total Stories</span>
                <span className="font-semibold">{totalStories}</span>
              </div>
              <div className="flex justify-between items-center text-brand-text">
                <span className="text-brand-muted">Total Resources</span>
                <span className="font-semibold">{totalResources}</span>
              </div>
              <div className="flex justify-between items-center text-brand-text">
                <span className="text-brand-muted">Coverage</span>
                <span className="font-semibold">{coveragePercentage}% ({storiesWithResources})</span>
              </div>
              <div className="w-full bg-black/5 dark:bg-white/20 rounded-full h-2 mt-2 truncate">
                <div className="bg-[#6576F3] h-2 rounded-full transition-all duration-500" style={{ width: `${coveragePercentage}%` }} />
              </div>
            </div>
          </div>
        )}
        <p>
          Created by{' '}
          <a
            href="https://zinzy.website"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-text hover:text-[#6576F3] transition-colors underline decoration-black/10 underline-offset-4"
          >
            Zinzy Waleson Geene
          </a>
        </p>
      </div>
    </footer>
  );
};

const SearchBar = ({
  value,
  onChange,
  view,
  setView,
  bookSort,
  setBookSort,
  showBookSort = false
}: {
  value: string,
  onChange: (v: string) => void,
  view: 'books' | 'topics',
  setView: (v: 'books' | 'topics') => void,
  bookSort?: 'by_book' | 'by_availability' | 'readings',
  setBookSort?: (s: 'by_book' | 'by_availability' | 'readings') => void,
  showBookSort?: boolean
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const searchBarRef = React.useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  React.useEffect(() => {
    const handleScroll = () => {
      if (searchBarRef.current) {
        setIsSticky(searchBarRef.current.getBoundingClientRect().top <= 1);
      } else {
        setIsSticky(window.scrollY > 300);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger once on mount to handle initial load position
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={searchBarRef}
      className={cn(
        "sticky top-0 z-10 transition-all duration-300 border-b bg-brand-bg/95 backdrop-blur-md",
        isSticky ? "border-black/10 py-2" : "border-transparent py-4"
      )}
    >
      <div className="max-w-5xl mx-auto px-6 my-1">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
          <div className={cn(
            "flex items-center justify-between md:justify-start gap-2 md:gap-4 w-full md:w-auto flex-shrink-0",
            isSticky && "hidden md:flex"
          )}>
            <div className="flex items-center gap-2 md:gap-4">
              <AnimatePresence mode="popLayout">
                {isSticky && (
                  <motion.div
                    key="logo"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LogoLink size="small" />
                  </motion.div>
                )}
                {showBookSort && view === 'books' && bookSort && setBookSort && (
                  <motion.div
                    key="sort"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-1 bg-brand-card border border-black/5 p-1 rounded-xl h-10"
                  >
                    <button
                      onClick={() => setBookSort('by_book')}
                      title="By book"
                      className={cn(
                        "flex items-center gap-1.5 px-3 h-full rounded-xl text-sm font-semibold transition-colors cursor-pointer",
                        bookSort === 'by_book' ? (isDark ? "bg-brand-bg/50 text-white" : "bg-brand-bg/50 text-[#6576F3]") : "text-brand-muted hover:text-brand-text"
                      )}
                    >
                      <BookOpen className="w-4 h-4" fill={bookSort === 'by_book' ? "currentColor" : "none"} fillOpacity={0.15} />
                      <span className="hidden sm:inline">By book</span>
                    </button>
                    <button
                      onClick={() => setBookSort('by_availability')}
                      title="By availability"
                      className={cn(
                        "flex items-center gap-1.5 px-3 h-full rounded-xl text-sm font-semibold transition-colors cursor-pointer",
                        bookSort === 'by_availability' ? (isDark ? "bg-brand-bg/50 text-white" : "bg-brand-bg/50 text-[#6576F3]") : "text-brand-muted hover:text-brand-text"
                      )}
                    >
                      <Filter className="w-4 h-4" fill={bookSort === 'by_availability' ? "currentColor" : "none"} fillOpacity={0.15} />
                      <span className="hidden sm:inline">By availability</span>
                    </button>
                    <button
                      onClick={() => setBookSort('readings')}
                      title="Readings"
                      className={cn(
                        "flex items-center gap-1.5 px-3 h-full rounded-xl text-sm font-semibold transition-colors cursor-pointer",
                        bookSort === 'readings' ? (isDark ? "bg-brand-bg/50 text-white" : "bg-brand-bg/50 text-[#6576F3]") : "text-brand-muted hover:text-brand-text"
                      )}
                    >
                      <Calendar className="w-4 h-4" fill={bookSort === 'readings' ? "currentColor" : "none"} fillOpacity={0.15} />
                      <span className="hidden sm:inline">Readings</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center text-sm font-semibold whitespace-nowrap h-10 md:hidden">
              <div className="flex items-center gap-1 md:gap-2 px-1 md:px-3 h-full">
                <span className={cn("cursor-default inline transition-colors", view === 'books' ? 'text-brand-text' : 'text-brand-muted')}>Books</span>
                <button
                  onClick={() => setView(view === 'books' ? 'topics' : 'books')}
                  className={cn(
                    "group relative inline-flex h-5 w-10 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer",
                    view === 'topics' ? "bg-[#F27CDB]" : "bg-[#6576F3]"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      view === 'topics' ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
                <span className={cn("cursor-default inline transition-colors", view === 'topics' ? 'text-brand-text' : 'text-brand-muted')}>Topics</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full">
            {isSticky && (
              <div className="md:hidden flex-shrink-0">
                <LogoLink size="small" />
              </div>
            )}
            <div className={cn(
              "relative flex-1 transition-all duration-300",
              view === 'topics' ? "md:max-w-lg md:mr-auto" : "md:max-w-lg md:mx-auto"
            )}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="text"
                placeholder={view === 'books' ? "Find book" : "Find topic"}
                className="w-full h-10 pl-10 pr-4 bg-brand-card border border-black/5 rounded-xl focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/10 text-sm font-medium placeholder:text-brand-muted transition-all"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            </div>
            <div className="hidden md:flex items-center text-sm font-semibold whitespace-nowrap h-10">
              <div className="flex items-center gap-1 md:gap-2 px-1 md:px-3 h-full">
                <span className={cn("cursor-default inline transition-colors", view === 'books' ? 'text-brand-text' : 'text-brand-muted')}>Books</span>
                <button
                  onClick={() => setView(view === 'books' ? 'topics' : 'books')}
                  className={cn(
                    "group relative inline-flex h-5 w-10 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer",
                    view === 'topics' ? "bg-[#F27CDB]" : "bg-[#6576F3]"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      view === 'topics' ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
                <span className={cn("cursor-default inline transition-colors", view === 'topics' ? 'text-brand-text' : 'text-brand-muted')}>Topics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookCard: React.FC<{ book: BibleBook }> = ({ book }) => {
  const totalStoryResources = book.stories.reduce((acc, s) => acc + s.resources.length, 0);
  const totalResources = totalStoryResources + (book.resources ? book.resources.length : 0);
  const isAvailable = (book.resources && book.resources.length > 0) || (book.stories.length > 0 && totalStoryResources > 0);

  const cardContent = (
    <motion.div
      whileHover={isAvailable ? { y: -4 } : undefined}
      className={cn(
        "bg-brand-card p-2 md:p-4 sm:p-6 rounded-2xl border border-black/5 card-shadow h-full flex flex-col transition-all overflow-hidden",
        !isAvailable && "grayscale opacity-50 cursor-not-allowed"
      )}
    >
      <div className="mb-3 sm:mb-4 truncate">
        <CategoryBadge category={book.category} />
      </div>
      <h3 className="text-base sm:text-xl font-semibold mb-2 truncate">{book.name}</h3>
      <div className="mt-auto flex items-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] text-brand-muted uppercase tracking-wider font-semibold truncate">
        <span className="truncate whitespace-nowrap">{book.stories.length} stories</span>
        <span className="truncate whitespace-nowrap">{totalResources} resources</span>
      </div>
    </motion.div>
  );

  if (!isAvailable) return cardContent;

  return (
    <Link to={`/book/${book.id}`}>
      {cardContent}
    </Link>
  );
};

// --- Pages ---

const ReadingsView = () => {
  const { title, day, week, psalms, lessons } = getDailyReadings(new Date());

  const getOrdinal = (n: number) => {
    const ords = ["", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth"];
    return ords[n] || n + "th";
  };

  let displayTitle = title;
  if (!displayTitle) {
    const match = week.match(/Week of (\d+)\s+(.*)/i);
    if (match && day.toLowerCase() !== 'sunday') {
      const num = parseInt(match[1], 10);
      const season = match[2];

      let prep = 'in';
      if (season.toLowerCase().includes('easter')) prep = 'of';
      if (season.toLowerCase().includes('epiphany') || season.toLowerCase().includes('pentecost')) prep = 'after';
      if (season.toLowerCase() === 'christmas') prep = 'after';

      displayTitle = `${day} after the ${getOrdinal(num)} Sunday ${prep} ${season}`;
    } else {
      const formattedWeek = week.replace(/Week of (\d+) (.*)/i, 'Week $1 of $2');
      displayTitle = title || `${day}, ${formattedWeek}`;
    }
  }

  const { matchedStories, matchedBookResources } = useMemo(() => {
    const stories: { story: Story, bookId: string }[] = [];
    const bookResources: { resource: Resource, bookName: string, bookId: string }[] = [];
    const allBooks = contentData.books as BibleBook[];

    // Parse starting and ending chapters from a reference like "Gen. 1:1-2:3", "Gen 41:46-57", or "Gen. 37-50"
    const parseChapterRange = (ref: string): { start: number, end: number } | null => {
      // Strip out common book prefixes that look like chapter numbers (e.g. "1 John" -> "John")
      let cleanRef = ref.toLowerCase().replace(/^(1|2|3|i|ii|iii|first|second|third|1st|2nd|3rd)\s+/, '');

      // Find all numbers that are followed by a colon (i.e., chapters in a chapter:verse format)
      let chapters = Array.from(cleanRef.matchAll(/(\d+):/g)).map(m => parseInt(m[1], 10));

      if (chapters.length === 0) {
        // If no colons, extract all contiguous numbers from the string
        chapters = Array.from(ref.matchAll(/\b(\d+)\b/g)).map(m => parseInt(m[1], 10));
      }

      if (chapters.length === 0) return null;

      return {
        start: chapters[0],
        end: chapters[chapters.length - 1]
      };
    };

    const normalizeBookName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

    allBooks.forEach(b => {
      const bName = normalizeBookName(b.name);
      // Find lessons or psalms that apply to this book
      const relevantReadings = [...lessons, ...psalms].filter(r => {
        let rName = r;
        const colonIndex = r.indexOf(':');
        if (colonIndex !== -1) {
          rName = r.substring(0, colonIndex);
        }
        rName = rName.replace(/\d+\s*$/, '').trim();
        rName = normalizeBookName(rName);

        // Don't match if rName is empty (defensive check)
        if (!rName) return false;

        return rName === bName || rName.startsWith(bName) || bName.startsWith(rName); // E.g., '1 cor' matches '1 corinthians'
      });

      if (relevantReadings.length > 0) {
        if (b.resources && b.resources.length > 0) {
          b.resources.forEach(r => {
            const cleanTitle = r.title.toLowerCase().replace(b.name.toLowerCase(), '').trim();
            const resRange = parseChapterRange(cleanTitle);

            let isResMatch = false;
            if (!resRange) {
              // No specific chapters found, assume it applies to the whole book
              isResMatch = true;
            } else {
              // Specific chapters found, check if they overlap with the day's readings
              isResMatch = relevantReadings.some(read => {
                const readingRange = parseChapterRange(read);
                if (!readingRange) return false;

                // Strict overlap check
                return (resRange.start <= readingRange.end && resRange.end >= readingRange.start);
              });
            }

            // Prevent exact duplicates in the array
            if (isResMatch && !bookResources.some(br => br.resource.url === r.url && br.resource.title === r.title)) {
              bookResources.push({ resource: r, bookName: b.name, bookId: b.id });
            }
          });
        }

        b.stories.forEach(s => {
          if (s.resources.length > 0) {
            const storyRange = parseChapterRange(s.reference);

            const isMatch = relevantReadings.some(r => {
              const readingRange = parseChapterRange(r);
              if (!storyRange || !readingRange) return false;

              // Strict overlap check
              return (storyRange.start <= readingRange.end && storyRange.end >= readingRange.start);
            });

            if (isMatch) {
              stories.push({ story: s, bookId: b.id });
            }
          }
        });
      }
    });
    return {
      matchedStories: stories,
      matchedBookResources: bookResources
    };
  }, [lessons, psalms]);

  return (
    <div className="space-y-12">
      <section className="my-12">
        <h2 className="text-xl md:text-2xl font-semibold font-sans text-brand-text mb-2 text-center tracking-tight">Daily Office Readings</h2>
        <h3 className="text-sm font-semibold text-brand-muted text-center mb-4 uppercase tracking-wider">{displayTitle}</h3>
        <div className="flex flex-col items-center gap-6 pt-10">
          {psalms.length > 0 && (
            <div className="text-center">
              <span className="block text-xs font-semibold text-brand-muted uppercase tracking-widest mb-2">Psalms</span>
              <div className="flex flex-wrap justify-center gap-2">
                {psalms.map(p => <span key={p} className="px-3 py-1 bg-brand-card dark:bg-brand-card border border-black/5 rounded-full text-sm font-medium">{p}</span>)}
              </div>
            </div>
          )}
          {lessons.length > 0 && (
            <div className="text-center">
              <span className="block text-xs font-semibold text-brand-muted uppercase tracking-widest mb-2">Lessons</span>
              <div className="flex flex-wrap justify-center gap-2">
                {lessons.map(l => <span key={l} className="px-3 py-1 bg-brand-card dark:bg-brand-card border border-black/5 rounded-full text-sm font-medium">{l}</span>)}
              </div>
            </div>
          )}
        </div>
      </section>

      {(matchedStories.length > 0 || matchedBookResources.length > 0) ? (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-6 border-b border-black/5 pb-2">
            Related ({matchedStories.length + matchedBookResources.length})
          </h2>
          <div className="columns-1 md:columns-2 gap-4">
            {matchedBookResources.map(({ resource, bookName }, idx) => (
              <a
                key={`br-${idx}`}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block break-inside-avoid mb-4 bg-brand-card p-4 rounded-xl border border-black/5 hover:border-black/20 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider">
                      {bookName}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-200 rounded">
                      {resource.type}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-brand-muted group-hover:text-[#6576F3] transition-colors flex-shrink-0 mt-0.5" />
                </div>
                <h4 className="font-semibold text-lg group-hover:text-[#6576F3] transition-colors line-clamp-2">
                  {resource.title}
                </h4>
                {resource.author && (
                  <div className="text-sm text-brand-muted italic mt-1 line-clamp-2">
                    By {resource.author}
                    {resource.collection && ` in ${resource.collection}`}
                  </div>
                )}
              </a>
            ))}

            {matchedStories.map(({ story, bookId }) => (
              <Link
                key={story.id}
                to={`/book/${bookId}/story/${story.id}`}
                className="group block break-inside-avoid mb-4 bg-brand-card p-4 rounded-xl border border-black/5 hover:border-black/20 transition-all cursor-pointer"
              >
                <div className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider mb-2">
                  {story.reference}
                </div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-lg group-hover:text-[#6576F3] transition-colors truncate">
                    {story.title}
                  </h4>
                  <span className="text-[10px] font-semibold h-5 w-5 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-200 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                    {story.resources.length}
                  </span>
                </div>
                <div className="text-sm text-brand-muted italic mt-1 line-clamp-2">
                  {story.summary}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="text-center text-brand-muted text-sm mt-4">
          No related stories with resources found for today's readings.
        </div>
      )}
    </div>
  );
};

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const view = (searchParams.get('view') as 'books' | 'topics') || 'books';

  const setSearch = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val) params.set('q', val);
    else params.delete('q');
    setSearchParams(params, { replace: true });
  };

  const setView = (val: 'books' | 'topics') => {
    const params = new URLSearchParams(searchParams);
    params.set('view', val);
    setSearchParams(params, { replace: true });
  };

  const filteredBooks = useMemo(() => {
    return (contentData.books as BibleBook[])
      .filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.category.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => a.number - b.number);
  }, [search]);

  const themesMap = useMemo(() => {
    const map: Record<string, Record<string, { resource: Resource, references: { bookName: string, storyTitle: string, storyRef: string }[] }>> = {};
    (contentData.books as BibleBook[]).forEach(book => {
      book.stories.forEach(story => {
        story.resources.forEach(resource => {
          // If resource has its own themes, use them. Otherwise, inherit from story.
          const themes = (resource.themes && resource.themes.length > 0) ? resource.themes : (story.themes || []);
          themes.forEach(theme => {
            if (!map[theme]) map[theme] = {};
            const key = resource.url || resource.title; // Group by URL, fallback to title

            if (!map[theme][key]) {
              map[theme][key] = { resource, references: [] };
            }

            // Only add reference if it doesn't already exist for this resource (avoid exact duplicate refs)
            const refExists = map[theme][key].references.some(r => r.storyRef === story.reference);
            if (!refExists) {
              map[theme][key].references.push({
                bookName: book.name,
                storyTitle: story.title,
                storyRef: story.reference
              });
            }
          });
        });
      });
    });

    const finalMap: Record<string, { resource: Resource, references: { bookName: string, storyTitle: string, storyRef: string }[] }[]> = {};
    Object.keys(map).forEach(theme => {
      finalMap[theme] = Object.values(map[theme]);
    });
    return finalMap;
  }, []);

  const sortedThemes = useMemo(() => {
    return Object.keys(themesMap).sort().filter(t =>
      t.toLowerCase().includes(search.toLowerCase())
    );
  }, [themesMap, search]);

  const hasAnyStoryResourcesGlobal = useMemo(() => {
    return (contentData.books as BibleBook[]).some(b => b.stories.some(s => s.resources.length > 0));
  }, []);

  const bookSortParam = searchParams.get('sort') as 'by_book' | 'by_availability' | 'readings' | null;
  const bookSort = bookSortParam || (hasAnyStoryResourcesGlobal ? 'by_availability' : 'by_book');

  const setBookSort = (val: 'by_book' | 'by_availability' | 'readings') => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', val);
    setSearchParams(params, { replace: true });
  };

  const availableBooks = useMemo(() => filteredBooks.filter(b => {
    const totalStoryResources = b.stories.reduce((acc, s) => acc + s.resources.length, 0);
    return (b.resources && b.resources.length > 0) || (b.stories.length > 0 && totalStoryResources > 0);
  }), [filteredBooks]);

  const unavailableBooks = useMemo(() => filteredBooks.filter(b => {
    const totalStoryResources = b.stories.reduce((acc, s) => acc + s.resources.length, 0);
    return !((b.resources && b.resources.length > 0) || (b.stories.length > 0 && totalStoryResources > 0));
  }), [filteredBooks]);

  const otBooks = useMemo(() => filteredBooks.filter(b => b.number >= 1 && b.number <= 39), [filteredBooks]);
  const deuterocanonBooks = useMemo(() => filteredBooks.filter(b => b.number >= 40 && b.number <= 51), [filteredBooks]);
  const ntBooks = useMemo(() => filteredBooks.filter(b => b.number >= 52 && b.number <= 78), [filteredBooks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-4"
    >
      <Header />
      <SearchBar
        value={search}
        onChange={setSearch}
        view={view}
        setView={setView}
        bookSort={bookSort}
        setBookSort={setBookSort}
        showBookSort={true}
      />

      <main className="max-w-5xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {view === 'books' ? (
            <motion.div
              key="books"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-12"
            >
              {bookSort === 'readings' ? (
                <ReadingsView />
              ) : (
                [
                  { title: 'Old Testament', books: otBooks },
                  { title: 'Deuterocanonical', books: deuterocanonBooks },
                  { title: 'New Testament', books: ntBooks }
                ].map(({ title, books: sectionBooks }) => {
                  if (sectionBooks.length === 0) return null;

                  const availableInSection = sectionBooks.filter(b => {
                    const totalStoryResources = b.stories.reduce((acc, s) => acc + s.resources.length, 0);
                    return (b.resources && b.resources.length > 0) || (b.stories.length > 0 && totalStoryResources > 0);
                  });

                  if (bookSort === 'by_availability' && availableInSection.length === 0) {
                    return null;
                  }

                  const displayedCount = bookSort === 'by_book' ? sectionBooks.length : availableInSection.length;

                  return (
                    <section key={title} className="space-y-6">
                      <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-6 border-b border-black/5 pb-2">
                        {title} ({displayedCount})
                      </h2>

                      {bookSort === 'by_book' ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                          {sectionBooks.map((book) => (
                            <BookCard key={book.id} book={book} />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                          {availableInSection.map((book) => (
                            <BookCard key={book.id} book={book} />
                          ))}
                        </div>
                      )}
                    </section>
                  );
                }))}

              {bookSort === 'by_availability' && unavailableBooks.length > 0 && (
                <section className="mt-16 pt-8">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-6 border-b border-black/5 pb-2">
                    No resources yet
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 text-left">
                    {unavailableBooks.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="topics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12 mt-6"
            >
              {sortedThemes.length > 0 ? (
                sortedThemes.map(theme => (
                  <section key={theme}>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-6 border-b border-black/5 pb-2">
                      {theme} ({themesMap[theme].length})
                    </h2>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
                      {themesMap[theme].map(({ resource, references }) => (
                        <a key={resource.url || resource.title} href={resource.url} target="_blank" rel="noopener noreferrer" className="block break-inside-avoid mb-4">
                          <div className="group bg-brand-card p-4 rounded-xl border border-black/5 card-shadow hover:border-black/20 transition-all h-full flex flex-col">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex-1">
                                <div className="text-[10px] font-semibold text-[#6576F3] uppercase tracking-wider mb-1">
                                  {resource.type}
                                </div>
                                <h4 className="font-semibold text-brand-text group-hover:text-[#6576F3] transition-colors leading-tight mb-2">
                                  {resource.title}
                                </h4>
                                {resource.author && (
                                  <div className="text-xs text-brand-muted italic">
                                    By {resource.author}
                                    {resource.collection && ` in ${resource.collection}`}
                                  </div>
                                )}
                              </div>
                              <ExternalLink className="w-4 h-4 text-brand-muted group-hover:text-[#6576F3] transition-colors flex-shrink-0 mt-1" />
                            </div>

                            <div className="pt-3 border-t border-black/5 flex flex-col gap-1.5 mt-auto">
                              {references.map((ref, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-[10px] font-medium text-brand-muted">
                                  <BookOpen className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  <span className="leading-tight">{ref.bookName} · {ref.storyTitle} <span className="opacity-60">{ref.storyRef}</span></span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="bg-brand-card p-12 rounded-3xl border border-black/5 card-shadow text-center">
                  <Filter className="w-12 h-12 text-brand-muted/20 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No themes found</h2>
                  <p className="text-brand-muted max-w-md mx-auto">
                    Switch back to the Books view
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

const BookDetailPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const book = (contentData.books as BibleBook[]).find(b => b.id === bookId);

  if (!book) return <div>Book not found</div>;

  const hasBookResources = book.resources && book.resources.length > 0;
  const hasAnyStoryResources = book.stories.some(s => s.resources.length > 0);
  const initialSort = hasBookResources && !hasAnyStoryResources
    ? 'about_book'
    : hasAnyStoryResources ? 'by_availability' : 'by_story';

  const storySortParam = searchParams.get('sort') as 'by_story' | 'by_availability' | 'about_book' | null;
  const storySort = storySortParam || initialSort;

  const setStorySort = (val: 'by_story' | 'by_availability' | 'about_book') => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', val);
    setSearchParams(params, { replace: true });
  };
  const [showNestedResources, setShowNestedResources] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { resolvedTheme } = useTheme();

  const filteredStories = useMemo(() => {
    if (!searchQuery.trim()) return book.stories;
    const queryStr = searchQuery.toLowerCase().trim();

    // Check if query is like "Gen 2:6"
    const verseQueryMatch = queryStr.match(/^([a-z\s\.]+?)\s+(\d+):(\d+)$/);
    if (verseQueryMatch) {
      const [, bookPart, searchChapStr, searchVerseStr] = verseQueryMatch;
      const searchChap = parseInt(searchChapStr, 10);
      const searchVerse = parseInt(searchVerseStr, 10);
      const queryValue = searchChap * 1000 + searchVerse;
      const cleanBookPart = bookPart.replace(/\./g, '').trim();

      return book.stories.filter(s => {
        const refLower = s.reference.toLowerCase();
        if (!refLower.includes(cleanBookPart)) return false;

        // Parse story reference: "2:4-25" or "1:1-2:3"
        const refPattern = /(\d+):(\d+)(?:[a-z])?(?:[-–]\s*(?:(\d+):)?(\d+)(?:[a-z])?)?/;
        const refMatch = refLower.match(refPattern);
        if (refMatch) {
          const startChap = parseInt(refMatch[1], 10);
          const startVerse = parseInt(refMatch[2], 10);
          const endChap = refMatch[3] ? parseInt(refMatch[3], 10) : startChap;
          const endVerse = refMatch[4] ? parseInt(refMatch[4], 10) : startVerse;

          const startValue = startChap * 1000 + startVerse;
          const endValue = endChap * 1000 + endVerse;

          return queryValue >= startValue && queryValue <= endValue;
        }
        return false;
      });
    }

    // Check if the query looks like "Book Chapter" (e.g. "Gen 2" or "Genesis 2")
    const chapterMatch = queryStr.match(/^([a-z\s]+?)\s+(\d+)$/);

    if (chapterMatch) {
      // If it's a chapter search, we want to match references like "Gen. 2:" or "Genesis 2:"
      // We don't want to match "Gen. 1:2"
      const [, bookPart, chapter] = chapterMatch;

      return book.stories.filter(s => {
        const refLower = s.reference.toLowerCase();
        // Match the exact chapter start: e.g. " 2:" or ". 2:" or just "2:" 
        // to ensure we're matching the chapter number, not a verse number.
        const chapterPattern = new RegExp(`\\b${chapter}:`);

        return refLower.includes(bookPart) && chapterPattern.test(refLower);
      });
    }

    // Fallback to the standard boolean AND search across terms
    const queryTerms = queryStr.split(/\s+/).filter(Boolean);
    return book.stories.filter(s => {
      const titleLower = s.title.toLowerCase();
      const refLower = s.reference.toLowerCase();

      return queryTerms.every(term =>
        titleLower.includes(term) || refLower.includes(term)
      );
    });
  }, [book.stories, searchQuery]);

  const availableStories = useMemo(() => filteredStories.filter(s => s.resources.length > 0), [filteredStories]);
  const unavailableStories = useMemo(() => filteredStories.filter(s => s.resources.length === 0), [filteredStories]);

  const [isToolbarSticky, setIsToolbarSticky] = useState(false);
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (toolbarRef.current) {
        setIsToolbarSticky(toolbarRef.current.getBoundingClientRect().top <= 1);
      } else {
        setIsToolbarSticky(window.scrollY > 400);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderStory = (story: Story) => {
    const hasResources = story.resources.length > 0;
    const storyContent = (
      <div className={cn(
        "group bg-brand-card p-4 md:p-6 rounded-xl border border-black/5 flex flex-col md:flex-row md:items-center gap-4 transition-all mb-3",
        hasResources && !showNestedResources ? "hover:border-black/20" : (!hasResources ? "grayscale opacity-50 cursor-not-allowed" : "")
      )}>
        <div className="w-24 text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
          {story.reference}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h4 className={cn("font-semibold text-lg transition-colors", hasResources && !showNestedResources && "group-hover:text-[#6576F3]")}>
              {story.title}
            </h4>
            {hasResources && (
              <span className="text-[10px] font-semibold h-6 w-6 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-200 rounded-full border border-gray-200 flex items-center justify-center">
                {story.resources.length}
              </span>
            )}
          </div>
          {story.themes && story.themes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {story.themes.map(theme => (
                <span key={theme} className="text-[9px] font-semibold uppercase tracking-wider text-brand-muted/60">
                  #{theme}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 text-sm text-brand-muted italic">
          {story.summary}
        </div>
        {hasResources && !showNestedResources && (
          <ChevronRight className="w-5 h-5 text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
        )}
      </div>
    );

    if (!hasResources) return <div key={story.id + story.reference}>{storyContent}</div>;

    if (showNestedResources && hasResources) {
      return (
        <div key={story.id} className="mb-8">
          {storyContent}
          <div className="pl-6 md:pl-20 mt-2 mb-6 space-y-2">
            {story.resources.map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-brand-card p-3 rounded-xl border border-black/5 hover:border-black/20 transition-all"
              >
                <div className="flex-shrink-0">
                  <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                    {res.type}
                  </span>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 truncate">
                  <h4 className="font-semibold text-sm group-hover:text-[#6576F3] transition-colors truncate">{res.title}</h4>
                  {res.author && (
                    <span className="text-xs text-brand-muted truncate">
                      by {res.author}
                      {res.collection && <span> in <span className="italic">{res.collection}</span></span>}
                    </span>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-brand-muted group-hover:text-[#6576F3] transition-colors flex-shrink-0 hidden sm:block" />
              </a>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Link key={story.id} to={`/book/${book.id}/story/${story.id}`}>
        {storyContent}
      </Link>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-20"
    >
      <div className="max-w-5xl mx-auto px-6 pt-12 relative">
        <div className="absolute top-4 right-6 md:top-6">
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3 mb-12">
          <LogoLink size="small" />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-4xl font-semibold">{book.name}</h1>
          <CategoryBadge category={book.category} />
        </div>

        <p className="text-2xl text-brand-text/80 max-w-2xl mb-8 leading-relaxed">
          {book.description}
        </p>
      </div>

      <div
        ref={toolbarRef}
        className={cn(
          "sticky top-0 z-10 transition-all duration-300 border-b bg-brand-bg/95 backdrop-blur-md mb-8",
          isToolbarSticky ? "border-black/10 py-2" : "border-transparent py-4"
        )}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
            {/* Left: Toggles and Logo */}
            <div className={cn(
              "flex items-center justify-between md:justify-start gap-2 md:gap-4 w-full md:w-auto flex-shrink-0",
              isToolbarSticky && "hidden md:flex"
            )}>
              <div className="flex items-center gap-2 md:gap-4">
                <AnimatePresence mode="popLayout">
                  {isToolbarSticky && (
                    <motion.div
                      key="logo"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LogoLink size="small" />
                    </motion.div>
                  )}
                  <motion.div
                    key="sort"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex flex-wrap items-center gap-1 bg-brand-card border border-black/5 p-1 rounded-xl h-10"
                  >
                    <button
                      onClick={() => setStorySort('by_story')}
                      title="By story"
                      className={cn(
                        "flex items-center gap-1.5 px-3 h-full rounded-xl text-sm font-semibold transition-colors cursor-pointer",
                        storySort === 'by_story' ? (resolvedTheme === 'dark' ? "bg-brand-bg/50 text-white" : "bg-brand-bg/50 text-[#6576F3]") : "text-brand-muted hover:text-brand-text"
                      )}
                    >
                      <BookOpen className="w-4 h-4" fill={storySort === 'by_story' ? "currentColor" : "none"} fillOpacity={0.15} />
                      <span className="hidden sm:inline">By story</span>
                    </button>
                    <button
                      onClick={() => setStorySort('by_availability')}
                      title="By availability"
                      className={cn(
                        "flex items-center gap-1.5 px-3 h-full rounded-xl text-sm font-semibold transition-colors cursor-pointer",
                        storySort === 'by_availability' ? (resolvedTheme === 'dark' ? "bg-brand-bg/50 text-white" : "bg-brand-bg/50 text-[#6576F3]") : "text-brand-muted hover:text-brand-text"
                      )}
                    >
                      <Filter className="w-4 h-4" fill={storySort === 'by_availability' ? "currentColor" : "none"} fillOpacity={0.15} />
                      <span className="hidden sm:inline">By availability</span>
                    </button>
                    {hasBookResources && (
                      <button
                        onClick={() => setStorySort('about_book')}
                        title="About the book"
                        className={cn(
                          "flex items-center gap-1.5 px-3 h-full rounded-xl text-sm font-semibold transition-colors cursor-pointer",
                          storySort === 'about_book' ? (resolvedTheme === 'dark' ? "bg-brand-bg/50 text-white" : "bg-brand-bg/50 text-[#6576F3]") : "text-brand-muted hover:text-brand-text"
                        )}
                      >
                        <Info className="w-4 h-4" fill={storySort === 'about_book' ? "currentColor" : "none"} fillOpacity={0.15} />
                        <span className="hidden sm:inline">About</span>
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {!isToolbarSticky && (
                <div className="flex items-center gap-3 md:hidden">
                  <span className={cn("text-sm font-semibold whitespace-nowrap", hasAnyStoryResources ? "text-brand-muted" : "text-brand-muted/50")}>Nested resources</span>
                  <button
                    onClick={() => setShowNestedResources(!showNestedResources)}
                    disabled={!hasAnyStoryResources}
                    className={cn(
                      "group relative inline-flex h-5 w-10 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      !hasAnyStoryResources ? "bg-black/5 dark:bg-white/5 cursor-not-allowed" : "cursor-pointer",
                      hasAnyStoryResources && showNestedResources ? "bg-[#6576F3]" : (hasAnyStoryResources ? "bg-[#6576F3]/50" : "")
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        showNestedResources ? "translate-x-5" : "translate-x-0",
                        !hasAnyStoryResources && "opacity-50"
                      )}
                    />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full">
              {isToolbarSticky && (
                <div className="md:hidden flex-shrink-0">
                  <LogoLink size="small" />
                </div>
              )}
              {storySort !== 'about_book' && (
                <div className="relative flex-1 md:max-w-lg md:mx-auto w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  <input
                    type="text"
                    placeholder="Find story or Bible passage"
                    className="w-full h-10 pl-10 pr-4 bg-brand-card border border-black/5 rounded-xl focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/10 text-sm font-medium placeholder:text-brand-muted transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
              {!isToolbarSticky && storySort !== 'about_book' && (
                <div className="hidden md:flex items-center gap-3">
                  <span className={cn("text-sm font-semibold whitespace-nowrap", hasAnyStoryResources ? "text-brand-muted" : "text-brand-muted/50")}>Nested resources</span>
                  <button
                    onClick={() => setShowNestedResources(!showNestedResources)}
                    disabled={!hasAnyStoryResources}
                    className={cn(
                      "group relative inline-flex h-5 w-10 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      !hasAnyStoryResources ? "bg-black/5 dark:bg-white/5 cursor-not-allowed" : "cursor-pointer",
                      hasAnyStoryResources && showNestedResources ? "bg-[#6576F3]" : (hasAnyStoryResources ? "bg-[#6576F3]/50" : "")
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        showNestedResources ? "translate-x-5" : "translate-x-0",
                        !hasAnyStoryResources && "opacity-50"
                      )}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6">
        {storySort === 'about_book' ? (
          book.resources && book.resources.length > 0 ? (
            <div className="space-y-8">
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-6 border-b border-black/5 pb-2">
                  Resources ({book.resources.length})
                </h2>
                <div className="grid gap-4">
                  {book.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-brand-card p-6 rounded-2xl border border-black/5 card-shadow flex items-start justify-between hover:border-black/20 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                            {res.type}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold group-hover:text-[#6576F3] transition-colors">{res.title}</h3>
                        {res.author && (
                          <p className="text-sm text-brand-muted mt-1">
                            by {res.author}
                            {res.collection && <span> in <span className="italic">{res.collection}</span></span>}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-brand-muted group-hover:text-[#6576F3] transition-colors mt-1" />
                    </a>
                  ))}
                </div>
              </section>
            </div>
          ) : null
        ) : storySort === 'by_story' ? (
          <div className="space-y-3">
            {filteredStories.length > 0 ? (
              filteredStories.map(renderStory)
            ) : searchQuery ? (
              <p className="text-brand-muted py-8 text-center bg-brand-card/50 border border-dashed border-black/10 rounded-2xl">No stories match your search.</p>
            ) : (
              <p className="text-brand-muted py-8 text-center bg-brand-card/50 border border-dashed border-black/10 rounded-2xl">No stories yet.</p>
            )}
          </div>
        ) : storySort === 'by_availability' ? (
          <div className="space-y-12">
            {availableStories.length > 0 ? (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-6 border-b border-black/5 pb-2">With resources ({availableStories.length})</h2>
                <div className="space-y-3">
                  {availableStories.map(renderStory)}
                </div>
              </div>
            ) : (
              <p className="text-brand-muted py-8 text-center bg-brand-card/50 border border-dashed border-black/10 rounded-2xl">No stories with resources yet.</p>
            )}

            {unavailableStories.length > 0 && (
              <div>

                <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-6 border-b border-black/5 pb-2">No resources yet ({unavailableStories.length})</h2>
                <div className="space-y-3">
                  {unavailableStories.map(renderStory)}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </motion.div>
  );
};

const StoryDetailPage = () => {
  const { bookId, storyId } = useParams();
  const navigate = useNavigate();
  const book = (contentData.books as BibleBook[]).find(b => b.id === bookId);
  const story = book?.stories.find(s => s.id === storyId);

  if (!book || !story) return <div>Story not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-20"
    >
      <div className="max-w-3xl mx-auto px-6 pt-12">
        <div className="flex items-center gap-3 mb-12">
          <LogoLink size="small" />
          <button
            onClick={() => navigate(`/book/${book.id}`)}
            className="ml-5 text-[10px] font-semibold text-brand-muted hover:text-brand-text transition-colors uppercase tracking-widest cursor-pointer"
          >
            {book.name}
          </button>
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold text-brand-muted uppercase tracking-widest">{story.reference}</span>
            <span className="w-1 h-1 bg-brand-muted/30 rounded-full" />
            <CategoryBadge category={book.category} />
          </div>
          <h1 className="text-2xl font-semibold mb-6">{story.title}</h1>
          <p className="text-xl text-brand-muted italic leading-relaxed mb-8">
            {story.summary}
          </p>

          {story.themes && story.themes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {story.themes.map(theme => (
                <Link
                  key={theme}
                  to={`/?q=${encodeURIComponent(theme)}&view=topics`}
                  className="px-3 py-1 bg-black/5 rounded-full text-[10px] font-semibold uppercase tracking-widest text-brand-muted hover:bg-black/10 hover:text-brand-text transition-all"
                >
                  {theme}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-6 border-b border-black/5 pb-2">
              Resources ({story.resources.length})
            </h2>

            {story.resources.length > 0 ? (
              <div className="grid gap-4">
                {story.resources.map((res, i) => (
                  <a
                    key={i}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-brand-card p-6 rounded-2xl border border-black/5 card-shadow flex items-start justify-between hover:border-black/20 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                          {res.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold group-hover:text-[#6576F3] transition-colors">{res.title}</h3>
                      {res.author && (
                        <p className="text-sm text-brand-muted mt-1">
                          by {res.author}
                          {res.collection && <span> in <span className="italic">{res.collection}</span></span>}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-brand-muted group-hover:text-[#6576F3] transition-colors mt-1" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-brand-card/50 border border-dashed border-black/10 rounded-2xl p-12 text-center">
                <BookOpen className="w-8 h-8 text-brand-muted/30 mx-auto mb-4" />
                <p className="text-brand-muted">No resources added for this story yet.</p>
                <p className="text-xs text-brand-muted/60 mt-2">Check back soon or contribute a resource.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </motion.div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
};

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

const GlobalBackButton = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (pathname === '/') return null;

  return (
    <button
      onClick={() => navigate(-1)}
      className="fixed top-4 left-4 md:top-6 md:left-6 z-50 flex items-center justify-center gap-2 w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 bg-white/90 dark:bg-black/90 backdrop-blur border border-black/10 dark:border-white/10 rounded-full shadow-sm text-[10px] md:text-xs font-semibold uppercase tracking-widest text-brand-text hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all hover:-translate-x-1 cursor-pointer group"
      aria-label="Go back"
    >
      <ArrowLeft className="w-4 h-4 text-brand-muted group-hover:text-brand-text transition-colors" />
      <span className="hidden md:inline">Back</span>
    </button>
  );
};

function AppContent() {
  const location = useLocation();

  return (
    <>
      <GlobalBackButton />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/book/:bookId" element={<BookDetailPage />} />
          <Route path="/book/:bookId/story/:storyId" element={<StoryDetailPage />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
