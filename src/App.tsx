import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronRight, ArrowLeft, BookOpen, ExternalLink, Filter, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import contentData from './content.json';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Resource {
  type: string;
  title: string;
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
  name: string;
  category: string;
  description: string;
  stories: Story[];
}

// --- Components ---

const CategoryBadge = ({ category }: { category: string }) => {
  const styles: Record<string, string> = {
    'Torah': 'bg-category-torah text-category-torah-dot',
    'Former Prophets': 'bg-category-prophets text-category-prophets-dot',
    'Five Scrolls': 'bg-category-scrolls text-category-scrolls-dot',
    'Writings': 'bg-category-writings text-category-writings-dot',
  };

  const dotStyles: Record<string, string> = {
    'Torah': 'bg-category-torah-dot',
    'Former Prophets': 'bg-category-prophets-dot',
    'Five Scrolls': 'bg-category-scrolls-dot',
    'Writings': 'bg-category-writings-dot',
  };

  return (
    <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", styles[category] || 'bg-gray-100 text-gray-500')}>
      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", dotStyles[category] || 'bg-gray-400')} />
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
      <h1 className="text-3xl md:text-4xl font-bold leading-tight max-w-2xl">
        <span className="text-brand-text">Manifold</span> is a free repository of inclusive, queer-affirming, anti-racist, trauma-sensitive study resources on every single story in the Bible.
      </h1>
    </motion.div>
  </header>
);

const Footer = () => (
  <footer className="py-12 px-6 border-t border-black/5">
    <div className="max-w-5xl mx-auto text-center text-sm text-brand-muted font-medium">
      <p>
        Currently lovingly supported by{' '}
        <a
          href="https://zinzy.website"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-text hover:text-blue-600 transition-colors underline decoration-black/10 underline-offset-4"
        >
          Zinzy Waleson Geene
        </a>
      </p>
    </div>
  </footer>
);

const SearchBar = ({ value, onChange, view, setView }: { value: string, onChange: (v: string) => void, view: 'books' | 'topics', setView: (v: 'books' | 'topics') => void }) => (
  <div className="sticky top-0 z-10 bg-brand-bg/80 backdrop-blur-md border-b border-black/5 mb-8">
    <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
        <input
          type="text"
          placeholder="Type to find a Bible Book"
          className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 text-sm placeholder:text-brand-muted"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4 text-sm font-medium">
        <span className={cn(view === 'books' ? 'text-brand-text' : 'text-brand-muted')}>Books</span>
        <button
          onClick={() => setView(view === 'books' ? 'topics' : 'books')}
          className="relative w-10 h-5 bg-black rounded-full p-1 transition-colors"
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
);

const BookCard: React.FC<{ book: BibleBook }> = ({ book }) => (
  <Link to={`/book/${book.id}`}>
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-brand-card p-6 rounded-2xl border border-black/5 card-shadow h-full flex flex-col"
    >
      <div className="mb-4">
        <CategoryBadge category={book.category} />
      </div>
      <h3 className="text-2xl font-bold mb-2">{book.name}</h3>
      <div className="mt-auto flex items-center gap-4 text-[11px] text-brand-muted uppercase tracking-wider font-semibold">
        <span>{book.stories.length} Bible stories</span>
        <span className="w-1 h-1 bg-brand-muted/30 rounded-full" />
        <span>{book.stories.reduce((acc, s) => acc + s.resources.length, 0)} resources</span>
      </div>
    </motion.div>
  </Link>
);

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
    return (contentData.books as BibleBook[]).filter(b =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const themesMap = useMemo(() => {
    const map: Record<string, { bookId: string, bookName: string, story: Story }[]> = {};
    (contentData.books as BibleBook[]).forEach(book => {
      book.stories.forEach(story => {
        story.themes?.forEach(theme => {
          if (!map[theme]) map[theme] = [];
          map[theme].push({ bookId: book.id, bookName: book.name, story });
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="topics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              {sortedThemes.length > 0 ? (
                sortedThemes.map(theme => (
                  <section key={theme}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-6 border-b border-black/5 pb-2">
                      {theme} ({themesMap[theme].length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {themesMap[theme].map(({ bookId, bookName, story }) => (
                        <Link key={`${bookId}-${story.id}`} to={`/book/${bookId}/story/${story.id}`}>
                          <div className="group bg-brand-card p-4 rounded-xl border border-black/5 card-shadow hover:border-black/20 transition-all flex items-center justify-between">
                            <div>
                              <div className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1">
                                {bookName} · {story.reference}
                              </div>
                              <h4 className="font-bold group-hover:text-blue-600 transition-colors">{story.title}</h4>
                            </div>
                            <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-blue-600 transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="bg-brand-card p-12 rounded-3xl border border-black/5 card-shadow text-center">
                  <Filter className="w-12 h-12 text-brand-muted/20 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No themes found</h2>
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

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors mb-8 uppercase tracking-wider"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to the Manifold Index
        </button>

        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-4xl font-bold">{book.name}</h1>
          <CategoryBadge category={book.category} />
        </div>

        <p className="text-2xl text-brand-text/80 max-w-2xl mb-12 leading-relaxed">
          {book.description}
        </p>

        <div className="space-y-3">
          {book.stories.map((story) => (
            <Link key={story.id} to={`/book/${book.id}/story/${story.id}`}>
              <div className="group bg-brand-card p-4 md:p-6 rounded-xl border border-black/5 card-shadow flex flex-col md:flex-row md:items-center gap-4 hover:border-black/20 transition-all mb-3">
                <div className="w-24 text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                  {story.reference}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{story.title}</h4>
                  {story.themes && story.themes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {story.themes.map(theme => (
                        <span key={theme} className="text-[9px] font-bold uppercase tracking-wider text-brand-muted/60">
                          #{theme}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-sm text-brand-muted italic">
                  {story.summary}
                </div>
                <ChevronRight className="w-5 h-5 text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
              </div>
            </Link>
          ))}
        </div>
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
        <button
          onClick={() => navigate(`/book/${book.id}`)}
          className="flex items-center gap-2 text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors mb-8 uppercase tracking-wider"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to {book.name}
        </button>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">{story.reference}</span>
            <span className="w-1 h-1 bg-brand-muted/30 rounded-full" />
            <CategoryBadge category={book.category} />
          </div>
          <h1 className="text-5xl font-bold mb-6">{story.title}</h1>
          <p className="text-xl text-brand-muted italic leading-relaxed mb-8">
            {story.summary}
          </p>

          {story.themes && story.themes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {story.themes.map(theme => (
                <Link
                  key={theme}
                  to={`/?q=${encodeURIComponent(theme)}&view=topics`}
                  className="px-3 py-1 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-muted hover:bg-black/10 hover:text-brand-text transition-all"
                >
                  {theme}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-6 border-b border-black/5 pb-2">
              Study Resources ({story.resources.length})
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
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                          {res.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors">{res.title}</h3>
                      {res.author && <p className="text-sm text-brand-muted mt-1">by {res.author}</p>}
                    </div>
                    <ExternalLink className="w-4 h-4 text-brand-muted group-hover:text-blue-600 transition-colors mt-1" />
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

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:bookId" element={<BookDetailPage />} />
        <Route path="/book/:bookId/story/:storyId" element={<StoryDetailPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}
