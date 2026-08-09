import { useEffect, useState } from "react";
import client from "../api/client";

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadBooks = () => {
    setLoading(true);
    client
      .get("/library/books", { params: { search } })
      .then((res) => setBooks(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadBooks();
  };

  return (
    <div>
      <p className="eyebrow">Module 02</p>
      <h1 className="font-display text-3xl text-ledger-text mt-1">Library Catalog</h1>
      <p className="text-ledger-muted mt-2 text-sm">
        Live availability across all titles. Reserve a book to be notified the moment it's returned.
      </p>
      <div className="ledger-rule mt-6" />

      <form onSubmit={handleSearch} className="mt-6 flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or author…"
          className="flex-1 bg-ledger-panel border border-ledger-line rounded px-3 py-2 text-sm focus:outline-none focus:border-ledger-accent"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-ledger-accent text-ledger-bg rounded text-sm font-medium"
        >
          Search
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-ledger-muted">Loading catalog…</p>}
        {!loading &&
          books.map((book) => <BookRow key={book._id} book={book} />)}
        {!loading && books.length === 0 && (
          <p className="text-ledger-muted">No books match your search.</p>
        )}
      </div>
    </div>
  );
}

function BookRow({ book }) {
  const available = book.availableCopies > 0;
  return (
    <div className="bg-ledger-panel border border-ledger-line rounded px-5 py-4 flex items-center justify-between">
      <div>
        <h3 className="font-display text-base">{book.title}</h3>
        <p className="text-sm text-ledger-muted">{book.author}</p>
      </div>
      <div className="text-right">
        <span
          className={`text-xs font-mono uppercase tracking-wide px-2 py-0.5 rounded ${
            available
              ? "bg-ledger-accent2/15 text-ledger-accent2"
              : "bg-ledger-danger/15 text-ledger-danger"
          }`}
        >
          {available ? "Available" : "Unavailable"}
        </span>
        <p className="text-xs text-ledger-muted mt-1 font-mono">
          {book.availableCopies}/{book.totalCopies} copies free
        </p>
      </div>
    </div>
  );
}
