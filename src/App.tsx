import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, ChevronRight, ArrowLeft, BookOpen, ExternalLink, Filter, Menu, X, Info, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import contentData from './content.json';
import logoMain from './logo.svg';
import logoSmall from './logo_small.svg';

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

  return (
    <Link
      to="/"
      className="relative flex items-center group isolate"
    >
      {!isFrontPage && (
        <motion.div
          initial={{ opacity: 0, x: 2 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute -left-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 text-brand-muted" />
        </motion.div>
      )}
      <div className={cn(
        "transition-all duration-200 rounded-xl p-1 border border-transparent",
        !isFrontPage && "group-hover:border-black/5 group-hover:bg-black/[0.02]"
      )}>
        <img
          src={size === 'large' ? logoMain : logoSmall}
          alt="Manifold"
          className={cn(
            "w-auto transition-all",
            size === 'large' ? "h-10 md:h-12" : "h-6 md:h-7"
          )}
        />
      </div>
    </Link>
  );
};

const Header = () => {
  return (
    <header className="pt-16 pb-12 px-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-10 inline-block">
          <LogoLink size="large" />
        </div>
        <h1 className="text-3xl md:text-4xl leading-tight max-w-2xl font-normal text-brand-text">
          A free repository of inclusive, liberating, queer-affirming, anti-racist, trauma-sensitive resources on every single story in the Bible.
        </h1>
      </motion.div>
    </header>
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

  return (
    <footer className="py-12 md:py-16 px-6 border-t border-black/5 mt-12">
      {domains.length > 0 && (
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-6 text-center border-b border-black/5 pb-4">
            Sources & Organizations
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
  bookSort?: 'by_book' | 'by_availability',
  setBookSort?: (s: 'by_book' | 'by_availability') => void,
  showBookSort?: boolean
}) => {
  const [isSticky, setIsSticky] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={cn(
      "sticky top-0 z-10 transition-all duration-300 border-b bg-brand-bg/95 backdrop-blur-md",
      isSticky ? "border-black/10 py-2" : "border-transparent py-4"
    )}>
      <div className="max-w-5xl mx-auto px-6 my-1">
        <div className="flex flex-row items-center justify-between gap-2 md:gap-4">
          {/* Left: Toggles and/or Logo */}
          {(isSticky || (showBookSort && view === 'books' && bookSort && setBookSort)) && (
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
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
                    className="flex items-center gap-1 bg-white border border-black/5 p-1 rounded-xl h-10"
                  >
                    <button
                      onClick={() => setBookSort('by_book')}
                      title="By book"
                      className={cn(
                        "flex items-center gap-1.5 px-3 h-full rounded-xl text-sm font-semibold transition-colors cursor-pointer",
                        bookSort === 'by_book' ? "bg-brand-bg/50 text-[#6576F3]" : "text-brand-muted hover:text-brand-text"
                      )}
                    >
                      <BookOpen className="w-4 h-4" fill={bookSort === 'by_book' ? "currentColor" : "none"} fillOpacity={0.15} />
                      <span className="hidden lg:inline">By book</span>
                    </button>
                    <button
                      onClick={() => setBookSort('by_availability')}
                      title="By availability"
                      className={cn(
                        "flex items-center gap-1.5 px-3 h-full rounded-xl text-sm font-semibold transition-colors cursor-pointer",
                        bookSort === 'by_availability' ? "bg-brand-bg/50 text-[#6576F3]" : "text-brand-muted hover:text-brand-text"
                      )}
                    >
                      <Filter className="w-4 h-4" fill={bookSort === 'by_availability' ? "currentColor" : "none"} fillOpacity={0.15} />
                      <span className="hidden lg:inline">By availability</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Middle: Left-aligned or Centered Search Input */}
          <div className={cn(
            "relative flex-1 max-w-lg w-full transition-all duration-300",
            view === 'topics' ? "md:ml-0 md:mr-auto" : "mx-2 md:mx-auto"
          )}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              type="text"
              placeholder={view === 'books' ? "Find book" : "Find topic"}
              className="w-full h-10 pl-10 pr-4 bg-white border border-black/5 rounded-xl focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/10 text-sm font-medium placeholder:text-brand-muted transition-all"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>

          {/* Right: View Toggles */}
          <div className="flex items-center text-sm font-semibold whitespace-nowrap h-10">
            <div className="flex items-center gap-1 md:gap-2 px-1 md:px-3 h-full">
              <span className={cn("cursor-default inline transition-colors", view === 'books' ? 'text-brand-text' : 'text-brand-muted')}>Books</span>
              <button
                onClick={() => setView(view === 'books' ? 'topics' : 'books')}
                className="relative w-8 md:w-10 h-4 md:h-5 bg-[#6576F3] rounded-full p-0.5 md:p-1 transition-colors cursor-pointer"
              >
                <motion.div
                  animate={{ x: view === 'books' ? 0 : (window.innerWidth < 768 ? 16 : 20) }}
                  className="w-3 md:w-3 h-3 md:h-3 bg-white rounded-full"
                />
              </button>
              <span className={cn("cursor-default inline transition-colors", view === 'topics' ? 'text-brand-text' : 'text-brand-muted')}>Topics</span>
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
    const map: Record<string, { bookId: string, bookName: string, story: Story, resource: Resource }[]> = {};
    (contentData.books as BibleBook[]).forEach(book => {
      book.stories.forEach(story => {
        story.resources.forEach(resource => {
          // If resource has its own themes, use them. Otherwise, inherit from story.
          const themes = (resource.themes && resource.themes.length > 0) ? resource.themes : (story.themes || []);
          themes.forEach(theme => {
            if (!map[theme]) map[theme] = [];
            map[theme].push({ bookId: book.id, bookName: book.name, story, resource });
          });
        });
      });
    });
    return map;
  }, []);

  const sortedThemes = useMemo(() => {
    return Object.keys(themesMap).sort().filter(t =>
      t.toLowerCase().includes(search.toLowerCase())
    );
  }, [themesMap, search]);

  const [bookSort, setBookSort] = useState<'by_book' | 'by_availability'>('by_book');

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
    <div className="min-h-screen pb-20">
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
              {[
                { title: 'Old Testament', books: otBooks },
                { title: 'Deuterocanonical', books: deuterocanonBooks },
                { title: 'New Testament', books: ntBooks }
              ].map(({ title, books: sectionBooks }) => {
                if (sectionBooks.length === 0) return null;

                const availableInSection = sectionBooks.filter(b => {
                  const totalStoryResources = b.stories.reduce((acc, s) => acc + s.resources.length, 0);
                  return (b.resources && b.resources.length > 0) || (b.stories.length > 0 && totalStoryResources > 0);
                });

                const unavailableInSection = sectionBooks.filter(b => {
                  const totalStoryResources = b.stories.reduce((acc, s) => acc + s.resources.length, 0);
                  return !((b.resources && b.resources.length > 0) || (b.stories.length > 0 && totalStoryResources > 0));
                });

                return (
                  <section key={title} className="space-y-8">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-6 border-b border-black/5 pb-2">{title}</h2>

                    {bookSort === 'by_book' ? (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {sectionBooks.map((book) => (
                          <BookCard key={book.id} book={book} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-12">
                        {availableInSection.length > 0 && (
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            {availableInSection.map((book) => (
                              <BookCard key={book.id} book={book} />
                            ))}
                          </div>
                        )}

                        {unavailableInSection.length > 0 && (
                          <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-muted/40 mb-4 flex items-center gap-2">
                              <span className="h-px bg-black/5 flex-1" />
                              No resources yet
                              <span className="h-px bg-black/5 flex-1" />
                            </h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                              {unavailableInSection.map((book) => (
                                <BookCard key={book.id} book={book} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {themesMap[theme].map(({ bookId, bookName, story, resource }) => (
                        <a key={`${bookId}-${story.id}-${resource.title}`} href={resource.url} target="_blank" rel="noopener noreferrer">
                          <div className="group bg-brand-card p-4 rounded-xl border border-black/5 card-shadow hover:border-black/20 transition-all">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="text-[10px] font-semibold text-[#6576F3] uppercase tracking-wider mb-1">
                                  {resource.type}
                                </div>
                                <h4 className="font-semibold text-brand-text group-hover:text-[#6576F3] transition-colors leading-tight mb-2">
                                  {resource.title}
                                </h4>
                                {resource.author && (
                                  <div className="text-xs text-brand-muted italic mb-3">
                                    By {resource.author}
                                    {resource.collection && ` in ${resource.collection}`}
                                  </div>
                                )}

                                <div className="pt-3 border-t border-black/5">
                                  <div className="flex items-center gap-2 text-[10px] font-medium text-brand-muted">
                                    <BookOpen className="w-3 h-3" />
                                    <span>{bookName} · {story.title}</span>
                                    <span className="opacity-60">{story.reference}</span>
                                  </div>
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-brand-muted group-hover:text-[#6576F3] transition-colors flex-shrink-0" />
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
    </div>
  );
};

const BookDetailPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const book = (contentData.books as BibleBook[]).find(b => b.id === bookId);

  if (!book) return <div>Book not found</div>;

  const hasBookResources = book.resources && book.resources.length > 0;
  const initialSort = hasBookResources && book.stories.filter(s => s.resources.length > 0).length === 0 ? 'about_book' : 'by_story';

  const [storySort, setStorySort] = useState<'by_story' | 'by_availability' | 'about_book'>(
    initialSort
  );
  const [showNestedResources, setShowNestedResources] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  React.useEffect(() => {
    const handleScroll = () => {
      setIsToolbarSticky(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
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
              <span className="text-[10px] font-semibold h-6 w-6 bg-gray-100 text-gray-500 rounded-full border border-gray-200 flex items-center justify-center">
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
    <div className="min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-12">
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

      <div className={cn(
        "sticky top-0 z-10 transition-all duration-300 border-b bg-brand-bg/95 backdrop-blur-md mb-8",
        isToolbarSticky ? "border-black/10 py-2" : "border-transparent py-4"
      )}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-row items-center justify-between gap-2 md:gap-4">
            {/* Left: Toggles and Logo */}
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
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
                  className="flex flex-wrap items-center gap-1 bg-white border border-black/5 p-1 rounded-xl h-10"
                >
                  <button
                    onClick={() => setStorySort('by_story')}
                    title="By story"
                    className={cn(
                      "flex items-center gap-1.5 px-3 h-full rounded-xl text-sm font-semibold transition-colors cursor-pointer",
                      storySort === 'by_story' ? "bg-brand-bg/50 text-[#6576F3]" : "text-brand-muted hover:text-brand-text"
                    )}
                  >
                    <BookOpen className="w-4 h-4" fill={storySort === 'by_story' ? "currentColor" : "none"} fillOpacity={0.15} />
                    <span className="hidden lg:inline">By story</span>
                  </button>
                  <button
                    onClick={() => setStorySort('by_availability')}
                    title="By availability"
                    className={cn(
                      "flex items-center gap-1.5 px-3 h-full rounded-xl text-sm font-semibold transition-colors cursor-pointer",
                      storySort === 'by_availability' ? "bg-brand-bg/50 text-[#6576F3]" : "text-brand-muted hover:text-brand-text"
                    )}
                  >
                    <Filter className="w-4 h-4" fill={storySort === 'by_availability' ? "currentColor" : "none"} fillOpacity={0.15} />
                    <span className="hidden lg:inline">By availability</span>
                  </button>
                  {hasBookResources && (
                    <button
                      onClick={() => setStorySort('about_book')}
                      title="About the book"
                      className={cn(
                        "flex items-center gap-1.5 px-3 h-full rounded-xl text-sm font-semibold transition-colors cursor-pointer",
                        storySort === 'about_book' ? "bg-brand-bg/50 text-[#6576F3]" : "text-brand-muted hover:text-brand-text"
                      )}
                    >
                      <Info className="w-4 h-4" fill={storySort === 'about_book' ? "currentColor" : "none"} fillOpacity={0.15} />
                      <span className="hidden lg:inline">About</span>
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Middle: Centered Search */}
            {storySort !== 'about_book' && (
              <div className="relative flex-1 max-w-lg mx-2 md:mx-auto w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="text"
                  placeholder="Find story or Bible passage"
                  className="w-full h-10 pl-10 pr-4 bg-white border border-black/5 rounded-xl focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/10 text-sm font-medium placeholder:text-brand-muted transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {/* Right: Switch */}
            {storySort !== 'about_book' && (
              <div className="flex items-center h-10">
                <label className="flex items-center gap-2 md:gap-3 cursor-pointer h-full px-1 md:px-3">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={showNestedResources} onChange={() => setShowNestedResources(!showNestedResources)} />
                    <div className={cn("block w-8 md:w-10 h-4 md:h-6 rounded-full transition-colors", showNestedResources ? "bg-[#6576F3]" : "bg-black/20")} />
                    <div className={cn("absolute left-1 top-0.5 md:top-1 bg-white w-3 md:w-4 h-3 md:h-4 rounded-full transition-transform", showNestedResources ? "translate-x-4" : "translate-x-0")} />
                  </div>
                  <span className="text-sm font-semibold text-brand-muted hidden sm:inline">Nested resources</span>
                </label>
              </div>
            )}
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
    </div>
  );
};

const StoryDetailPage = () => {
  const { bookId, storyId } = useParams();
  const navigate = useNavigate();
  const book = (contentData.books as BibleBook[]).find(b => b.id === bookId);
  const story = book?.stories.find(s => s.id === storyId);

  if (!book || !story) return <div>Story not found</div>;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-6 pt-12">
        <div className="flex items-center gap-3 mb-12">
          <LogoLink size="small" />
          <div className="w-px h-4 bg-black/10 mx-1" />
          <button
            onClick={() => navigate(`/book/${book.id}`)}
            className="text-[10px] font-semibold text-brand-muted hover:text-brand-text transition-colors uppercase tracking-widest"
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
    </div>
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
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:bookId" element={<BookDetailPage />} />
        <Route path="/book/:bookId/story/:storyId" element={<StoryDetailPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}
