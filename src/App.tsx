import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, ChevronRight, ArrowLeft, BookOpen, ExternalLink, Filter, Menu, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import contentData from './content.json';
import logo from './logo.svg';
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

const Header = () => (
  <header className="pt-16 pb-12 px-6 max-w-5xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Link to="/" className="inline-block mb-10">
        <img src={logo} alt="Manifold Logo" className="h-10 w-auto" />
      </Link>
      <h1 className="text-3xl md:text-4xl leading-tight max-w-2xl">
        A free repository of inclusive, liberating, queer-affirming, anti-racist, trauma-sensitive Resources on every single story in the Christian Bible.
      </h1>
    </motion.div>
  </header>
);

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

const SearchBar = ({ value, onChange, view, setView }: { value: string, onChange: (v: string) => void, view: 'books' | 'topics', setView: (v: 'books' | 'topics') => void }) => {
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
      "sticky top-0 z-10 transition-all duration-300 border-b",
      isSticky ? "bg-brand-bg/95 backdrop-blur-md border-black/10 py-2" : "bg-brand-bg/0 border-transparent py-4"
    )}>
      <div className="max-w-5xl mx-auto px-6 my-1">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-6 flex-1 min-w-0">
            <AnimatePresence>
              {isSticky && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to="/">
                    <img src={logoSmall} alt="Manifold" className="h-6 w-auto" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-brand-muted" />
              <input
                type="text"
                placeholder="Type to find book"
                className="w-full pl-8 md:pl-10 pr-2 py-2 bg-transparent border-none focus:ring-0 text-xs md:text-sm placeholder:text-brand-muted truncate"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-sm font-medium whitespace-nowrap">
            <span className={cn(view === 'books' ? 'text-brand-text' : 'text-brand-muted')}>Books</span>
            <button
              onClick={() => setView(view === 'books' ? 'topics' : 'books')}
              className="relative w-10 h-5 bg-[#6576F3] rounded-full p-1 transition-colors"
            >
              <motion.div
                animate={{ x: view === 'books' ? 0 : 20 }}
                className="w-3 h-3 bg-white rounded-full"
              />
            </button>
            <span className={cn(view === 'topics' ? 'text-brand-text' : 'text-brand-muted')}>Topics</span>
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
        "bg-brand-card p-6 rounded-2xl border border-black/5 card-shadow h-full flex flex-col transition-all",
        !isAvailable && "grayscale opacity-50 cursor-not-allowed"
      )}
    >
      <div className="mb-4">
        <CategoryBadge category={book.category} />
      </div>
      <h3 className="text-xl font-semibold mb-2">{book.name}</h3>
      <div className="mt-auto flex items-center gap-4  text-[10px] text-brand-muted uppercase tracking-wider font-semibold">
        <span>{book.stories.length} stories</span>
        <span>{totalResources} resources</span>
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
    const map: Record<string, { bookId: string, bookName: string, story: Story }[]> = {};
    (contentData.books as BibleBook[]).forEach(book => {
      book.stories.forEach(story => {
        if (story.resources.length > 0) {
          story.themes?.forEach(theme => {
            if (!map[theme]) map[theme] = [];
            map[theme].push({ bookId: book.id, bookName: book.name, story });
          });
        }
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

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <SearchBar value={search} onChange={setSearch} view={view} setView={setView} />

      <main className="max-w-5xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {view === 'books' ? (
            <motion.div
              key="books"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 bg-brand-card p-1 rounded-lg w-full sm:w-fit border border-black/5 card-shadow mb-8">
                <button
                  onClick={() => setBookSort('by_book')}
                  className={cn("flex flex-1 sm:flex-initial justify-center items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors", bookSort === 'by_book' ? "bg-white shadow-sm text-brand-text" : "text-brand-muted hover:text-brand-text")}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="truncate">By book</span>
                </button>
                <button
                  onClick={() => setBookSort('by_availability')}
                  className={cn("flex flex-1 sm:flex-initial justify-center items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors", bookSort === 'by_availability' ? "bg-white shadow-sm text-brand-text" : "text-brand-muted hover:text-brand-text")}
                >
                  <Filter className="w-4 h-4" />
                  <span className="truncate">By availability</span>
                </button>
              </div>

              {bookSort === 'by_book' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {availableBooks.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>

                  {unavailableBooks.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6">No resources yet</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {unavailableBooks.map((book) => (
                          <BookCard key={book.id} book={book} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {themesMap[theme].map(({ bookId, bookName, story }) => (
                        <Link key={`${bookId}-${story.id}`} to={`/book/${bookId}/story/${story.id}`}>
                          <div className="group bg-brand-card p-4 rounded-xl border border-black/5 card-shadow hover:border-black/20 transition-all flex items-center justify-between">
                            <div>
                              <div className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider mb-1">
                                {bookName} · {story.reference}
                              </div>
                              <h4 className="font-semibold group-hover:text-[#6576F3] transition-colors">{story.title}</h4>
                            </div>
                            <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-[#6576F3] transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="bg-brand-card p-12 rounded-3xl border border-black/5 card-shadow text-center">
                  <Filter className="w-12 h-12 text-brand-muted/20 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">No themes found</h2>
                  <p className="text-brand-muted max-w-md mx-auto">
                    Try searching for something else or switch back to the Books view.
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

  const availableStories = useMemo(() => book.stories.filter(s => s.resources.length > 0), [book.stories]);
  const unavailableStories = useMemo(() => book.stories.filter(s => s.resources.length === 0), [book.stories]);

  const hasBookResources = book.resources && book.resources.length > 0;
  const initialSort = hasBookResources && availableStories.length === 0 ? 'about_book' : 'by_story';

  const [storySort, setStorySort] = useState<'by_story' | 'by_availability' | 'about_book'>(
    initialSort
  );
  const [showNestedResources, setShowNestedResources] = useState(false);

  const renderStory = (story: Story) => {
    const hasResources = story.resources.length > 0;
    const storyContent = (
      <div className={cn(
        "group bg-brand-card p-4 md:p-6 rounded-xl border border-black/5 card-shadow flex flex-col md:flex-row md:items-center gap-4 transition-all mb-3",
        hasResources && !showNestedResources ? "hover:border-black/20" : (!hasResources ? "grayscale opacity-50 cursor-not-allowed" : "")
      )}>
        <div className="w-24 text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
          {story.reference}
        </div>
        <div className="flex-1">
          <h4 className={cn("font-semibold text-lg transition-colors", hasResources && !showNestedResources && "group-hover:text-[#6576F3]")}>{story.title}</h4>
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

    if (!hasResources) return <div key={story.id}>{storyContent}</div>;

    if (showNestedResources) {
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
                className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-brand-card p-3 rounded-xl border border-black/5 card-shadow hover:border-black/20 transition-all"
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
          <Link to="/">
            <img src={logoSmall} alt="Manifold" className="h-6 w-auto" />
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-4xl font-semibold">{book.name}</h1>
          <CategoryBadge category={book.category} />
        </div>

        <p className="text-2xl text-brand-text/80 max-w-2xl mb-12 leading-relaxed">
          {book.description}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 bg-brand-card p-1 rounded-lg w-full sm:w-fit border border-black/5 card-shadow">
            <button
              onClick={() => setStorySort('by_story')}
              className={cn("flex flex-1 sm:flex-initial justify-center items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors", storySort === 'by_story' ? "bg-white shadow-sm text-brand-text" : "text-brand-muted hover:text-brand-text")}
            >
              <BookOpen className="w-4 h-4" />
              <span className="truncate">By story</span>
            </button>
            <button
              onClick={() => setStorySort('by_availability')}
              className={cn("flex flex-1 sm:flex-initial justify-center items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors", storySort === 'by_availability' ? "bg-white shadow-sm text-brand-text" : "text-brand-muted hover:text-brand-text")}
            >
              <Filter className="w-4 h-4" />
              <span className="truncate">By availability</span>
            </button>
            {hasBookResources && (
              <button
                onClick={() => setStorySort('about_book')}
                className={cn("flex flex-1 sm:flex-initial justify-center items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors", storySort === 'about_book' ? "bg-white shadow-sm text-brand-text" : "text-brand-muted hover:text-brand-text")}
              >
                <Info className="w-4 h-4" />
                <span className="truncate">About the book</span>
              </button>
            )}
          </div>

          {storySort !== 'about_book' && (
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm font-medium text-brand-muted">Show nested resources</span>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={showNestedResources} onChange={() => setShowNestedResources(!showNestedResources)} />
                <div className={cn("block w-10 h-6 rounded-full transition-colors", showNestedResources ? "bg-[#6576F3]" : "bg-black/20")} />
                <div className={cn("absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform", showNestedResources ? "translate-x-4" : "translate-x-0")} />
              </div>
            </label>
          )}
        </div>

        {storySort === 'about_book' && book.resources && book.resources.length > 0 ? (
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
        ) : storySort === 'by_story' ? (
          <div className="space-y-3">
            {book.stories.map(renderStory)}
          </div>
        ) : (
          <div className="space-y-12">
            {availableStories.length > 0 && (
              <div className="space-y-3">
                {availableStories.map(renderStory)}
              </div>
            )}

            {unavailableStories.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">No resources yet</h2>
                <div className="space-y-3">
                  {unavailableStories.map(renderStory)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
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
          <Link to="/">
            <img src={logoSmall} alt="Manifold" className="h-6 w-auto" />
          </Link>
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
          <h1 className="text-5xl font-semibold mb-6">{story.title}</h1>
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
