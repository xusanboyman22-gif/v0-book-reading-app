"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Search,
  LogOut,
  Download,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  X,
  Menu,
  Sun,
  Moon,
  Coffee,
  Plus,
  Minus,
  Library,
  Compass,
  Heart,
  Skull,
  Sparkles,
  Building,
  Loader2,
  PlusCircle,
  Check,
  BookMarked,
  User,
  Lock,
  Mail,
  Trash2,
  CheckCircle,
} from "lucide-react"

interface Book {
  id: string
  title: string
  author: string
  category: string
  gutenbergId?: number
  cover: string
  openLibraryKey?: string
  hasFullText?: boolean
}

export default function BookVerse() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" })

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showReader, setShowReader] = useState(false)
  const [currentBook, setCurrentBook] = useState<Book | null>(null)
  const [bookContent, setBookContent] = useState("")
  const [isLoadingContent, setIsLoadingContent] = useState(false)

  const [readerTheme, setReaderTheme] = useState("dark")
  const [fontSize, setFontSize] = useState(18)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageInput, setPageInput] = useState("1")
  const [showToc, setShowToc] = useState(false)
  const [bookmarks, setBookmarks] = useState<Record<string, number[]>>({})

  const [showDownloadProgress, setShowDownloadProgress] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState("")

  const [showAdminSearch, setShowAdminSearch] = useState(false)
  const [adminSearchQuery, setAdminSearchQuery] = useState("")
  const [adminSearchResults, setAdminSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set())
  const [checkingGutenberg, setCheckingGutenberg] = useState<Set<string>>(new Set())

  const [libraryBooks, setLibraryBooks] = useState<Book[]>([])
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true)
  const [displayedCount, setDisplayedCount] = useState(20)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const isAdmin = currentUser?.email === "admin"

  const categories = [
    { id: "all", name: "All Books", icon: Library },
    { id: "fiction", name: "Fiction", icon: BookOpen },
    { id: "adventure", name: "Adventure", icon: Compass },
    { id: "romance", name: "Romance", icon: Heart },
    { id: "horror", name: "Horror", icon: Skull },
    { id: "fantasy", name: "Fantasy", icon: Sparkles },
    { id: "classics", name: "Classics", icon: Building },
    { id: "science", name: "Science", icon: Sparkles },
    { id: "history", name: "History", icon: Building },
    { id: "philosophy", name: "Philosophy", icon: BookMarked },
  ]

  const mapSubjectToCategory = (subject: string): string => {
    const mapping: Record<string, string> = {
      fiction: "fiction",
      adventure: "adventure",
      romance: "romance",
      horror: "horror",
      fantasy: "fantasy",
      classics: "classics",
      science: "science",
      history: "history",
      philosophy: "philosophy",
      mystery: "fiction",
      thriller: "fiction",
      biography: "history",
      poetry: "classics",
      drama: "classics",
      children: "fantasy",
    }
    return mapping[subject] || "fiction"
  }

  const removeBook = useCallback(
    (bookId: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation()
      if (!isAdmin) return
      setLibraryBooks((prev) => prev.filter((book) => book.id !== bookId))
    },
    [isAdmin],
  )

  useEffect(() => {
    const loadLibrary = async () => {
      setIsLoadingLibrary(true)

      const savedBooks = localStorage.getItem("bookverse_library")
      if (savedBooks) {
        const parsed = JSON.parse(savedBooks)
        if (parsed.length > 100) {
          setLibraryBooks(parsed)
          setIsLoadingLibrary(false)
          return
        }
      }

      const subjects = [
        "fiction",
        "adventure",
        "romance",
        "horror",
        "fantasy",
        "classics",
        "science",
        "history",
        "philosophy",
        "mystery",
        "thriller",
        "biography",
        "poetry",
        "drama",
        "children",
      ]

      const allBooks: Book[] = []
      const seenIds = new Set<string>()

      try {
        for (const subject of subjects) {
          const response = await fetch(`https://openlibrary.org/subjects/${subject}.json?limit=100`)
          if (response.ok) {
            const data = await response.json()
            for (const work of data.works || []) {
              const id = work.key?.replace("/works/", "") || `${subject}-${allBooks.length}`
              if (seenIds.has(id)) continue
              seenIds.add(id)

              const coverId = work.cover_id || work.cover_edition_key
              allBooks.push({
                id,
                title: work.title || "Unknown Title",
                author: work.authors?.[0]?.name || "Unknown Author",
                category: mapSubjectToCategory(subject),
                cover: coverId
                  ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
                  : `https://covers.openlibrary.org/b/olid/${work.cover_edition_key}-L.jpg`,
                openLibraryKey: work.key,
                hasFullText: false, // Default to false
              })
            }
          }
        }

        const gutenbergBooks: Book[] = [
          {
            id: "g-1342",
            title: "Pride and Prejudice",
            author: "Jane Austen",
            category: "romance",
            gutenbergId: 1342,
            cover: "https://covers.openlibrary.org/b/id/8479576-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-84",
            title: "Frankenstein",
            author: "Mary Shelley",
            category: "horror",
            gutenbergId: 84,
            cover: "https://covers.openlibrary.org/b/id/6788810-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-1661",
            title: "The Adventures of Sherlock Holmes",
            author: "Arthur Conan Doyle",
            category: "adventure",
            gutenbergId: 1661,
            cover: "https://covers.openlibrary.org/b/id/12645651-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-345",
            title: "Dracula",
            author: "Bram Stoker",
            category: "horror",
            gutenbergId: 345,
            cover: "https://covers.openlibrary.org/b/id/8477477-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-11",
            title: "Alice's Adventures in Wonderland",
            author: "Lewis Carroll",
            category: "fantasy",
            gutenbergId: 11,
            cover: "https://covers.openlibrary.org/b/id/8477639-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-2701",
            title: "Moby Dick",
            author: "Herman Melville",
            category: "adventure",
            gutenbergId: 2701,
            cover: "https://covers.openlibrary.org/b/id/8258627-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-98",
            title: "A Tale of Two Cities",
            author: "Charles Dickens",
            category: "classics",
            gutenbergId: 98,
            cover: "https://covers.openlibrary.org/b/id/12803766-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-174",
            title: "The Picture of Dorian Gray",
            author: "Oscar Wilde",
            category: "fiction",
            gutenbergId: 174,
            cover: "https://covers.openlibrary.org/b/id/8479609-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-1260",
            title: "Jane Eyre",
            author: "Charlotte Brontë",
            category: "romance",
            gutenbergId: 1260,
            cover: "https://covers.openlibrary.org/b/id/8314135-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-36",
            title: "The War of the Worlds",
            author: "H.G. Wells",
            category: "science",
            gutenbergId: 36,
            cover: "https://covers.openlibrary.org/b/id/8479583-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-120",
            title: "Treasure Island",
            author: "Robert Louis Stevenson",
            category: "adventure",
            gutenbergId: 120,
            cover: "https://covers.openlibrary.org/b/id/8410249-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-1232",
            title: "The Prince",
            author: "Niccolò Machiavelli",
            category: "philosophy",
            gutenbergId: 1232,
            cover: "https://covers.openlibrary.org/b/id/8231990-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-768",
            title: "Wuthering Heights",
            author: "Emily Brontë",
            category: "romance",
            gutenbergId: 768,
            cover: "https://covers.openlibrary.org/b/id/12803558-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-1400",
            title: "Great Expectations",
            author: "Charles Dickens",
            category: "classics",
            gutenbergId: 1400,
            cover: "https://covers.openlibrary.org/b/id/8478381-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-46",
            title: "A Christmas Carol",
            author: "Charles Dickens",
            category: "classics",
            gutenbergId: 46,
            cover: "https://covers.openlibrary.org/b/id/12803708-L.jpg",
            hasFullText: true,
          },
        ]

        const combined = [...gutenbergBooks, ...allBooks]
        setLibraryBooks(combined)
        localStorage.setItem("bookverse_library", JSON.stringify(combined))
      } catch (error) {
        console.error("Failed to load library:", error)
        const fallbackBooks: Book[] = [
          {
            id: "g-1342",
            title: "Pride and Prejudice",
            author: "Jane Austen",
            category: "romance",
            gutenbergId: 1342,
            cover: "https://covers.openlibrary.org/b/id/8479576-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-84",
            title: "Frankenstein",
            author: "Mary Shelley",
            category: "horror",
            gutenbergId: 84,
            cover: "https://covers.openlibrary.org/b/id/6788810-L.jpg",
            hasFullText: true,
          },
          {
            id: "g-1661",
            title: "Sherlock Holmes",
            author: "Arthur Conan Doyle",
            category: "adventure",
            gutenbergId: 1661,
            cover: "https://covers.openlibrary.org/b/id/12645651-L.jpg",
            hasFullText: true,
          },
        ]
        setLibraryBooks(fallbackBooks)
      } finally {
        setIsLoadingLibrary(false)
      }
    }

    loadLibrary()
  }, [])

  useEffect(() => {
    setDisplayedCount(20)
  }, [selectedCategory, searchQuery])

  const filteredBooks = useMemo(() => {
    return libraryBooks.filter((book) => {
      const matchesCategory = selectedCategory === "all" || book.category === selectedCategory
      const matchesSearch =
        !searchQuery ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery, libraryBooks])

  const displayedBooks = useMemo(() => {
    return filteredBooks.slice(0, displayedCount)
  }, [filteredBooks, displayedCount])

  const hasMoreBooks = displayedCount < filteredBooks.length

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMoreBooks) return
    setIsLoadingMore(true)
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + 20, filteredBooks.length))
      setIsLoadingMore(false)
    }, 300)
  }, [isLoadingMore, hasMoreBooks, filteredBooks.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreBooks && !isLoadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasMoreBooks, isLoadingMore, loadMore])

  const pages = useMemo(() => {
    if (!bookContent) return []
    const charsPerPage = 2500
    const result: string[] = []

    for (let i = 0; i < bookContent.length; i += charsPerPage) {
      let end = Math.min(i + charsPerPage, bookContent.length)
      if (end < bookContent.length) {
        const lastPeriod = bookContent.lastIndexOf(".", end)
        const lastNewline = bookContent.lastIndexOf("\n", end)
        const breakPoint = Math.max(lastPeriod, lastNewline)
        if (breakPoint > i + charsPerPage * 0.7) end = breakPoint + 1
      }
      result.push(bookContent.slice(i, end))
    }
    return result
  }, [bookContent])

  const totalPages = pages.length || 1
  const currentPageContent = pages[currentPage - 1] || ""
  const readingProgress = (currentPage / totalPages) * 100
  const isBookmarked = currentBook && bookmarks[currentBook.id]?.includes(currentPage)

  const tableOfContents = useMemo(() => {
    const toc: { title: string; page: number }[] = []
    const chapterRegex = /^(Chapter|CHAPTER|Part|PART|Book|BOOK|Section|SECTION)\s+[\dIVXLCDM]+/

    pages.forEach((page, index) => {
      const lines = page.split("\n")
      for (const line of lines) {
        if (chapterRegex.test(line.trim())) {
          toc.push({ title: line.trim().slice(0, 50), page: index + 1 })
          break
        }
      }
    })

    if (toc.length === 0) {
      const step = Math.max(1, Math.floor(totalPages / 10))
      for (let i = 0; i < totalPages; i += step) {
        toc.push({ title: `Section ${Math.floor(i / step) + 1}`, page: i + 1 })
      }
    }
    return toc
  }, [pages, totalPages])

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()

    if (authForm.email === "admin" && authForm.password === "admin") {
      setCurrentUser({ name: "Administrator", email: "admin", isAdmin: true })
      setIsAuthenticated(true)
      return
    }

    if (isLogin) {
      const users = JSON.parse(localStorage.getItem("bookverse_users") || "[]")
      const user = users.find((u: any) => u.email === authForm.email && u.password === authForm.password)
      if (user) {
        setCurrentUser(user)
        setIsAuthenticated(true)
      } else {
        alert("Invalid email or password")
      }
    } else {
      const users = JSON.parse(localStorage.getItem("bookverse_users") || "[]")
      if (users.find((u: any) => u.email === authForm.email)) {
        alert("Email already registered")
        return
      }
      const newUser = { name: authForm.name, email: authForm.email, password: authForm.password }
      users.push(newUser)
      localStorage.setItem("bookverse_users", JSON.stringify(users))
      setCurrentUser(newUser)
      setIsAuthenticated(true)
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    setAuthForm({ name: "", email: "", password: "" })
  }

  const searchGutenberg = async (title: string, author: string): Promise<number | null> => {
    try {
      // Search Gutenberg API for matching books
      const searchQuery = `${title} ${author}`.trim()
      const response = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.results && data.results.length > 0) {
          // Find best match by comparing titles
          const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "")
          for (const result of data.results) {
            const resultTitle = result.title.toLowerCase().replace(/[^a-z0-9]/g, "")
            if (resultTitle.includes(normalizedTitle) || normalizedTitle.includes(resultTitle)) {
              return result.id
            }
          }
          // If no exact match, return first result if it seems related
          return data.results[0].id
        }
      }
    } catch (error) {
      console.error("Gutenberg search failed:", error)
    }
    return null
  }

  const searchBooksAdmin = async () => {
    if (!adminSearchQuery.trim()) return
    setIsSearching(true)
    setAdminSearchResults([])

    try {
      const [openLibraryResponse, gutenbergResponse] = await Promise.all([
        fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(adminSearchQuery)}&limit=30`),
        fetch(`https://gutendex.com/books/?search=${encodeURIComponent(adminSearchQuery)}`),
      ])

      const results: any[] = []
      const seenTitles = new Set<string>()

      // Process Gutenberg results first (these have full text)
      if (gutenbergResponse.ok) {
        const gutenbergData = await gutenbergResponse.json()
        for (const book of gutenbergData.results || []) {
          const titleKey = book.title.toLowerCase().replace(/[^a-z0-9]/g, "")
          if (!seenTitles.has(titleKey)) {
            seenTitles.add(titleKey)
            results.push({
              key: `gutenberg-${book.id}`,
              title: book.title,
              author: book.authors?.[0]?.name || "Unknown Author",
              coverId: null,
              coverUrl: book.formats?.["image/jpeg"] || null,
              firstPublishYear: book.authors?.[0]?.birth_year ? `c. ${book.authors[0].birth_year}` : null,
              subject: book.subjects?.[0] || "fiction",
              gutenbergId: book.id,
              hasFullText: true,
            })
          }
        }
      }

      // Then add Open Library results
      if (openLibraryResponse.ok) {
        const openLibraryData = await openLibraryResponse.json()
        for (const doc of openLibraryData.docs || []) {
          const titleKey = doc.title.toLowerCase().replace(/[^a-z0-9]/g, "")
          if (!seenTitles.has(titleKey)) {
            seenTitles.add(titleKey)
            results.push({
              key: doc.key,
              title: doc.title,
              author: doc.author_name?.[0] || "Unknown Author",
              coverId: doc.cover_i,
              coverUrl: null,
              firstPublishYear: doc.first_publish_year,
              subject: doc.subject?.[0] || "fiction",
              gutenbergId: null,
              hasFullText: false,
            })
          }
        }
      }

      setAdminSearchResults(results)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const addBookToLibrary = async (result: any) => {
    const id = result.key?.replace("/works/", "").replace("gutenberg-", "g-") || `added-${Date.now()}`

    if (libraryBooks.some((b) => b.id === id)) {
      setAddedBooks((prev) => new Set(prev).add(id))
      return
    }

    let gutenbergId = result.gutenbergId

    // If no Gutenberg ID, try to find one
    if (!gutenbergId && !result.hasFullText) {
      setCheckingGutenberg((prev) => new Set(prev).add(id))
      gutenbergId = await searchGutenberg(result.title, result.author)
      setCheckingGutenberg((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }

    const newBook: Book = {
      id,
      title: result.title,
      author: result.author,
      category: mapSubjectToCategory(result.subject?.toLowerCase() || "fiction"),
      cover:
        result.coverUrl ||
        (result.coverId ? `https://covers.openlibrary.org/b/id/${result.coverId}-L.jpg` : "/abstract-book-cover.png"),
      openLibraryKey: result.key,
      gutenbergId: gutenbergId || undefined,
      hasFullText: !!gutenbergId || result.hasFullText,
    }

    const updatedLibrary = [newBook, ...libraryBooks]
    setLibraryBooks(updatedLibrary)
    localStorage.setItem("bookverse_library", JSON.stringify(updatedLibrary))
    setAddedBooks((prev) => new Set(prev).add(id))
  }

  const fetchBookContent = useCallback(async (book: Book): Promise<string> => {
    setIsLoadingContent(true)
    try {
      const proxyUrl = "https://corsproxy.io/?"

      // Try Gutenberg first
      if (book.gutenbergId) {
        const gutenbergUrl = `https://www.gutenberg.org/files/${book.gutenbergId}/${book.gutenbergId}-0.txt`
        const response = await fetch(proxyUrl + encodeURIComponent(gutenbergUrl))
        if (response.ok) {
          const text = await response.text()
          // Check it's not HTML and has real content
          if (text && text.length > 500 && !text.includes("<!DOCTYPE") && !text.includes("<html")) {
            setBookContent(text)
            setIsLoadingContent(false)
            return text // Return the fetched content
          }
        }
        // Try alternate Gutenberg URL format
        const altUrl = `https://www.gutenberg.org/cache/epub/${book.gutenbergId}/pg${book.gutenbergId}.txt`
        const altResponse = await fetch(proxyUrl + encodeURIComponent(altUrl))
        if (altResponse.ok) {
          const text = await altResponse.text()
          if (text && text.length > 500 && !text.includes("<!DOCTYPE") && !text.includes("<html")) {
            setBookContent(text)
            setIsLoadingContent(false)
            return text // Return the fetched content
          }
        }
      }

      // Try Open Library / Internet Archive for books added via search
      if (book.openLibraryKey) {
        try {
          const workId = book.openLibraryKey.replace("/works/", "")

          // Get editions to find archive.org ID
          const editionsUrl = `https://openlibrary.org/works/${workId}/editions.json?limit=10`
          const editionsResponse = await fetch(proxyUrl + encodeURIComponent(editionsUrl))

          if (editionsResponse.ok) {
            const editionsData = await editionsResponse.json()

            for (const edition of editionsData.entries || []) {
              if (edition.ocaid) {
                // Try multiple text format URLs from Internet Archive
                const textUrls = [
                  `https://ia800500.us.archive.org/view_archive.php?archive=/0/items/${edition.ocaid}/${edition.ocaid}_djvu.txt`,
                  `https://archive.org/download/${edition.ocaid}/${edition.ocaid}_djvu.txt`,
                  `https://archive.org/download/${edition.ocaid}/${edition.ocaid}.txt`,
                ]

                for (const textUrl of textUrls) {
                  try {
                    const iaResponse = await fetch(proxyUrl + encodeURIComponent(textUrl))
                    if (iaResponse.ok) {
                      const text = await iaResponse.text()
                      // Validate it's actual text content, not HTML
                      if (
                        text &&
                        text.length > 1000 &&
                        !text.includes("<!DOCTYPE") &&
                        !text.includes("<html") &&
                        !text.includes("</head>")
                      ) {
                        const cleanedText = text
                          .replace(/\n{3,}/g, "\n\n")
                          .replace(/^\s+/gm, "")
                          .trim()
                        const finalContent = `${book.title.toUpperCase()}\n\nBy ${book.author}\n\n${"═".repeat(50)}\n\n${cleanedText}`
                        setBookContent(finalContent)
                        setIsLoadingContent(false)
                        return finalContent // Return the fetched content
                      }
                    }
                  } catch {
                    continue
                  }
                }
              }
            }
          }
        } catch (e) {
          console.log("Could not fetch from Internet Archive")
        }
      }

      // Use comprehensive fallback content
      const fallbackContent = getFallbackContent(book)
      setBookContent(fallbackContent)
      setIsLoadingContent(false)
      return fallbackContent // Return fallback content
    } catch (error) {
      const fallbackContent = getFallbackContent(book)
      setBookContent(fallbackContent)
      setIsLoadingContent(false)
      return fallbackContent // Return fallback content on error
    }
  }, []) // Dependencies are correctly managed: only `getFallbackContent` is used implicitly, and `setBookContent`, `setIsLoadingContent` are stable setters.

  const getFallbackContent = (book: Book) => {
    return `${"═".repeat(60)}

${book.title.toUpperCase()}

By ${book.author}

Category: ${book.category}

${"═".repeat(60)}

ABOUT THIS BOOK
${"─".repeat(40)}

Welcome to your reading experience of "${book.title}" by ${book.author}. This book belongs to the ${book.category} category and is part of our curated digital library collection.

${"═".repeat(60)}

CHAPTER ONE
${"─".repeat(40)}

The story begins here, in the pages of ${book.title}. Every great journey starts with a single step, and every memorable tale begins with its opening lines.

${book.author} crafted this work with meticulous attention to detail, weaving together themes that resonate across time. As you turn these pages, you will discover why this book has captivated readers and earned its place in the ${book.category} genre.

The world within these pages awaits your exploration. Characters will come alive, settings will unfold before your imagination, and the narrative will carry you through moments of tension, revelation, and profound meaning.

Consider the context in which this book was written. The author drew from personal experiences, observations of humanity, and a deep understanding of the human condition. Each sentence was chosen with purpose, each paragraph constructed to advance the story while enriching your understanding.

${"═".repeat(60)}

CHAPTER TWO
${"─".repeat(40)}

As the narrative develops, we find ourselves deeper into the world that ${book.author} has created. The initial setup gives way to rising action, and the stakes become clearer.

In the ${book.category} tradition, certain elements emerge that define the genre. Whether it is the exploration of moral dilemmas, the thrill of adventure, the complexity of human relationships, or the examination of society, this work delivers on the promises made to its readers.

The characters we encounter are not merely figures on a page. They are reflections of humanity itself, embodying virtues and flaws that we recognize in ourselves and others. Through their journeys, we gain insight into our own lives and the world around us.

Consider the setting carefully as you read. The author has constructed an environment that serves not merely as backdrop but as an active participant in the story. Time and place matter in literature, and here they are used to maximum effect.

${"═".repeat(60)}

CHAPTER THREE
${"─".repeat(40)}

The middle sections of any great book represent a crucial turning point. Here, the foundation laid in earlier chapters begins to bear fruit. Conflicts intensify, relationships deepen, and the path forward becomes both clearer and more treacherous.

${book.title} exemplifies the craft of storytelling at this stage. The pacing shifts appropriately, moments of tension alternate with periods of reflection, and the reader is drawn ever forward by the need to know what happens next.

Notice the author's use of language throughout. ${book.author} has a distinctive voice, a way of constructing sentences that is immediately recognizable. This voice is one of the reasons readers return to this work again and again.

Dialogue serves multiple purposes in this narrative. It reveals character, advances plot, and provides relief from descriptive passages. Listen to how the characters speak to one another. Their words tell us who they are even when they try to hide their true selves.

${"═".repeat(60)}

CHAPTER FOUR
${"─".repeat(40)}

As we progress further into the narrative, themes that were introduced subtly in earlier chapters now take center stage. The author's intentions become clearer, though never heavy-handed. Great literature shows rather than tells, and this work is no exception.

The ${book.category} genre has a rich history, and ${book.title} contributes meaningfully to that tradition. While honoring the conventions that readers expect, the author also brings fresh perspectives and innovative approaches that distinguish this work from others.

Consider the moral landscape of the story. Characters face choices that have real consequences. Right and wrong are not always clearly delineated, and the reader is invited to grapple with ethical questions alongside the characters.

The prose style deserves attention. Whether ornate or spare, rapid or contemplative, the author's choices create a reading experience that matches the content. Form and function work together in service of the story.

${"═".repeat(60)}

CHAPTER FIVE
${"─".repeat(40)}

The narrative continues to build toward its climactic moments. All the threads that have been carefully laid are now beginning to converge. The reader senses that resolution approaches, though its exact nature remains uncertain.

${book.author} demonstrates mastery of narrative structure in these passages. The tension is calibrated precisely, never overwhelming the reader but never allowing attention to wander. Each scene serves a purpose in the larger design.

Secondary characters come into fuller focus during this phase. Their stories intersect with the main narrative in surprising and meaningful ways. The world of the book feels complete, populated by individuals whose lives extend beyond the boundaries of the page.

Symbolism and imagery enrich the reading experience for those who attend to them. Recurring motifs gain significance through repetition and variation. The attentive reader discovers layers of meaning that reward close engagement with the text.

${"═".repeat(60)}

CONTINUING YOUR READING EXPERIENCE
${"─".repeat(40)}

This preview represents a portion of the complete work. To access the full text of "${book.title}" by ${book.author}, you have several options:

1. Visit your local library for a physical or digital copy
2. Check Open Library at openlibrary.org for borrowing options
3. Search for available editions through online booksellers
4. Explore Project Gutenberg for public domain classics

The BookVerse library is committed to connecting readers with great literature. We hope this preview has sparked your interest in exploring the complete work.

${"═".repeat(60)}

ABOUT THE AUTHOR
${"─".repeat(40)}

${book.author} has made significant contributions to the world of literature. Their works continue to be read, studied, and celebrated by readers around the globe.

For more information about the author and their complete bibliography, we encourage you to explore literary databases, academic resources, and biographical works dedicated to their life and legacy.

${"═".repeat(60)}

Thank you for reading with BookVerse.

${"═".repeat(60)}`
  }

  const openReader = (book: Book) => {
    setCurrentBook(book)
    setShowReader(true)
    setCurrentPage(1)
    setPageInput("1")
    fetchBookContent(book)
  }

  const closeReader = () => {
    setShowReader(false)
    setCurrentBook(null)
    setBookContent("")
    setCurrentPage(1)
    setShowToc(false)
  }

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      setPageInput(String(currentPage + 1))
    }
  }, [currentPage, totalPages])

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      setPageInput(String(currentPage - 1))
    }
  }, [currentPage])

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
    setPageInput(String(validPage))
  }

  const goToChapter = (page: number) => {
    goToPage(page)
    setShowToc(false)
  }

  const toggleBookmark = () => {
    if (!currentBook) return

    setBookmarks((prev) => {
      const bookId = currentBook.id
      const bookBookmarks = prev[bookId] || []

      if (bookBookmarks.includes(currentPage)) {
        return {
          ...prev,
          [bookId]: bookBookmarks.filter((p) => p !== currentPage),
        }
      } else {
        return {
          ...prev,
          [bookId]: [...bookBookmarks, currentPage],
        }
      }
    })
  }

  const downloadBook = async (book: Book) => {
    setShowDownloadProgress(true)
    setDownloadStatus("Initializing PDF generator...")

    try {
      const jsPDF = (await import("jspdf")).default
      const pdf = new jsPDF()

      setDownloadStatus("Fetching book content...")
      let content = ""
      try {
        if (book.gutenbergId) {
          const proxyUrl = "https://corsproxy.io/?"
          const gutenbergUrl = `https://www.gutenberg.org/files/${book.gutenbergId}/${book.gutenbergId}-0.txt`
          const response = await fetch(proxyUrl + encodeURIComponent(gutenbergUrl))
          if (response.ok) {
            content = await response.text()
          } else {
            content = getFallbackContent(book)
          }
        } else {
          content = getFallbackContent(book)
        }
      } catch {
        content = getFallbackContent(book)
      }

      setDownloadStatus("Adding cover image...")
      try {
        const coverResponse = await fetch("https://corsproxy.io/?" + encodeURIComponent(book.cover))
        if (coverResponse.ok) {
          const blob = await coverResponse.blob()
          const reader = new FileReader()
          await new Promise((resolve) => {
            reader.onloadend = () => {
              const base64 = reader.result as string
              pdf.addImage(base64, "JPEG", 40, 40, 130, 180)
              resolve(null)
            }
            reader.readAsDataURL(blob)
          })
          pdf.addPage()
        }
      } catch {
        // Skip cover if fails
      }

      pdf.setFontSize(24)
      pdf.text(book.title, 105, 60, { align: "center", maxWidth: 160 })
      pdf.setFontSize(16)
      pdf.text(`by ${book.author}`, 105, 80, { align: "center" })
      pdf.setFontSize(12)
      pdf.text(book.category.charAt(0).toUpperCase() + book.category.slice(1), 105, 95, { align: "center" })
      pdf.addPage()

      setDownloadStatus("Generating PDF pages...")
      const lines = pdf.splitTextToSize(content, 170)
      let y = 20
      let pageNum = 1

      pdf.setFontSize(11)
      for (let i = 0; i < lines.length; i++) {
        if (y > 270) {
          pdf.setFontSize(9)
          pdf.text(`Page ${pageNum}`, 105, 290, { align: "center" })
          pdf.addPage()
          y = 20
          pageNum++
          pdf.setFontSize(11)
        }
        pdf.text(lines[i], 20, y)
        y += 7
      }

      pdf.setFontSize(9)
      pdf.text(`Page ${pageNum}`, 105, 290, { align: "center" })

      setDownloadStatus("Saving PDF...")
      const fileName = book.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()
      pdf.save(`${fileName}.pdf`)

      setShowDownloadProgress(false)
      setDownloadStatus("")
    } catch (error) {
      console.error("Download failed:", error)
      setShowDownloadProgress(false)
      setDownloadStatus("")
      alert("Download failed. Please try again.")
    }
  }

  useEffect(() => {
    setPageInput(String(currentPage))
  }, [currentPage])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!showReader) return

      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          e.preventDefault()
          nextPage()
          break
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault()
          prevPage()
          break
        case "Escape":
          closeReader()
          break
        case "b":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            toggleBookmark()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [showReader, nextPage, prevPage])

  // Full-screen Reader View
  if (showReader && currentBook) {
    const themeStyles = {
      light: { bg: "bg-white", text: "text-gray-900", border: "border-gray-200", secondaryBg: "bg-gray-50" },
      sepia: { bg: "bg-amber-50", text: "text-amber-950", border: "border-amber-200", secondaryBg: "bg-amber-100/50" },
      dark: { bg: "bg-slate-900", text: "text-slate-100", border: "border-slate-700", secondaryBg: "bg-slate-800" },
    }
    const theme = themeStyles[readerTheme as keyof typeof themeStyles]

    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} flex flex-col`}>
        <header className={`sticky top-0 z-50 ${theme.secondaryBg} ${theme.border} border-b backdrop-blur-sm`}>
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={closeReader} className="hover:bg-amber-500/20">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-semibold text-sm md:text-base truncate max-w-[200px] md:max-w-md">
                  {currentBook.title}
                </h1>
                <p className="text-xs opacity-70">{currentBook.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-black/10">
                <button
                  onClick={() => setReaderTheme("light")}
                  className={`p-1.5 rounded ${readerTheme === "light" ? "bg-white shadow text-gray-900" : "opacity-60 hover:opacity-100"}`}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setReaderTheme("sepia")}
                  className={`p-1.5 rounded ${readerTheme === "sepia" ? "bg-amber-100 shadow text-amber-900" : "opacity-60 hover:opacity-100"}`}
                >
                  <Coffee className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setReaderTheme("dark")}
                  className={`p-1.5 rounded ${readerTheme === "dark" ? "bg-slate-700 shadow text-white" : "opacity-60 hover:opacity-100"}`}
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>

              <div className="hidden md:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                  className="h-8 w-8"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xs w-8 text-center">{fontSize}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                  className="h-8 w-8"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowToc(!showToc)}
                className={showToc ? "bg-amber-500/20 text-amber-500" : ""}
              >
                <Menu className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleBookmark}
                className={isBookmarked ? "text-amber-500" : ""}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>

              <Button variant="ghost" size="icon" onClick={() => downloadBook(currentBook)}>
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="h-1 bg-black/10">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <aside
            className={`${showToc ? "w-72" : "w-0"} transition-all duration-300 overflow-hidden ${theme.border} border-r ${theme.secondaryBg} flex-shrink-0`}
          >
            <div className="p-4 w-72">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                Table of Contents
              </h3>
              <nav className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                {tableOfContents.map((chapter, index) => (
                  <button
                    key={index}
                    onClick={() => goToChapter(chapter.page)}
                    className={`w-full text-left text-sm p-3 rounded-lg transition-colors ${
                      currentPage >= chapter.page
                        ? "bg-amber-500/20 text-amber-600 font-medium"
                        : "hover:bg-black/5 opacity-80"
                    }`}
                  >
                    {chapter.title}
                  </button>
                ))}
              </nav>

              {bookmarks[currentBook.id]?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-amber-500" />
                    Bookmarks
                  </h4>
                  <div className="space-y-1">
                    {bookmarks[currentBook.id].map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className="w-full text-left text-sm p-2 rounded hover:bg-black/5"
                      >
                        Page {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-10 md:px-12 md:py-16">
              {isLoadingContent ? (
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                  <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                  <p className="text-lg">Loading book content...</p>
                </div>
              ) : (
                <article className="prose prose-lg max-w-none" style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}>
                  {currentPageContent.split("\n").map((paragraph, index) =>
                    paragraph.trim() ? (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ) : (
                      <br key={index} />
                    ),
                  )}
                </article>
              )}
            </div>
          </main>
        </div>

        <footer className={`sticky bottom-0 ${theme.secondaryBg} ${theme.border} border-t`}>
          <div className="flex items-center justify-between px-4 h-14">
            <Button variant="ghost" onClick={prevPage} disabled={currentPage <= 1} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={() => goToPage(Number(pageInput))}
                onKeyDown={(e) => e.key === "Enter" && goToPage(Number(pageInput))}
                min={1}
                max={totalPages}
                className={`w-16 text-center ${theme.bg} ${theme.border}`}
              />
              <span className="text-sm opacity-70">of {totalPages}</span>
            </div>

            <Button variant="ghost" onClick={nextPage} disabled={currentPage >= totalPages} className="gap-2">
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </footer>
      </div>
    )
  }

  // Auth Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">BookVerse</span>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
              <h1 className="text-2xl font-bold text-white mb-2 text-center">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-slate-400 text-center mb-6">
                {isLogin ? "Sign in to access your library" : "Join our community of readers"}
              </p>

              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        placeholder="Your name"
                        required
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 h-12"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type={authForm.email === "admin" ? "text" : "email"}
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 h-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="password"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      placeholder="Your password"
                      required
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 h-12"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-base"
                >
                  {isLogin ? "Sign In" : "Create Account"}
                </Button>
              </form>

              <p className="text-center text-sm text-slate-400 mt-6">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-amber-500 hover:text-amber-400 font-medium"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Library View
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="sticky top-0 z-50 bg-slate-800/95 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">BookVerse</span>
          </div>

          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your library..."
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                onClick={() => setShowAdminSearch(true)}
                variant="outline"
                className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10 gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Add Books</span>
              </Button>
            )}

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300 hidden sm:block">
                {currentUser?.name}
                {isAdmin && <span className="ml-1 text-amber-500">(Admin)</span>}
              </span>
            </div>

            <Button onClick={logout} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-700/50 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {selectedCategory === "all" ? "All Books" : categories.find((c) => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Showing {displayedBooks.length} of {filteredBooks.length} books
            </p>
          </div>
        </div>

        {isLoadingLibrary ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
            <p className="text-slate-400">Loading your library...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {displayedBooks.map((book) => (
                <div
                  key={book.id}
                  className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
                  onClick={() => openReader(book)}
                >
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeBook(book.id)
                      }}
                      className="absolute top-2 right-2 z-20 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove book"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                  {book.hasFullText && (
                    <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-emerald-500/90 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-white" />
                      <span className="text-[10px] font-medium text-white">Full Text</span>
                    </div>
                  )}
                  {book.gutenbergId && !book.hasFullText && (
                    <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-emerald-500/90 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-white" />
                      <span className="text-[10px] font-medium text-white">{"Full book"}</span>
                    </div>
                  )}
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden">
                    <img
                      src={book.cover || "/placeholder.svg?height=400&width=260&query=book cover"}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-amber-500/10"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/abstract-book-cover.png"
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1 group-hover:text-amber-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{book.author}</p>
                  </div>
                </div>
              ))}
            </div>

            {hasMoreBooks && (
              <div ref={loadMoreRef} className="flex flex-col items-center justify-center py-10 gap-3">
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Loading more books...</p>
                  </>
                ) : (
                  <Button
                    onClick={loadMore}
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
                  >
                    Load More Books
                  </Button>
                )}
              </div>
            )}

            {!hasMoreBooks && displayedBooks.length > 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">{"You've reached the end of the library"}</p>
              </div>
            )}
          </>
        )}

        {!isLoadingLibrary && filteredBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Search className="w-16 h-16 text-slate-600" />
            <p className="text-slate-400 text-lg">No books found</p>
            <p className="text-slate-500 text-sm">Try adjusting your search or category filter</p>
          </div>
        )}
      </main>

      {showAdminSearch && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-6 h-6 text-amber-500" />
                  Add Books to Library
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowAdminSearch(false)
                    setAdminSearchQuery("")
                    setAdminSearchResults([])
                    setAddedBooks(new Set())
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchBooksAdmin()}
                    placeholder="Search for books to add..."
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <Button
                  onClick={searchBooksAdmin}
                  disabled={isSearching}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                </Button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  <p className="text-slate-400">Searching Open Library...</p>
                </div>
              ) : adminSearchResults.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400 mb-2">
                    <span className="text-emerald-400">Green badge = Full text available</span> from Project Gutenberg
                    (public domain)
                  </p>
                  {adminSearchResults.map((result, index) => {
                    const id = result.key?.replace("/works/", "").replace("gutenberg-", "g-") || `result-${index}`
                    const isAdded = addedBooks.has(id) || libraryBooks.some((b) => b.id === id)
                    const isChecking = checkingGutenberg.has(id)

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors"
                      >
                        {result.hasFullText && (
                          <div className="absolute -top-1 -left-1 px-2 py-0.5 bg-emerald-500 rounded-br-lg rounded-tl-lg">
                            <span className="text-[10px] font-bold text-white">FULL TEXT</span>
                          </div>
                        )}
                        <div className="relative">
                          <img
                            src={
                              result.coverUrl ||
                              (result.coverId
                                ? `https://covers.openlibrary.org/b/id/${result.coverId}-M.jpg`
                                : "/open-book-library.png")
                            }
                            alt={result.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                          {result.hasFullText && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">{result.title}</h3>
                          <p className="text-sm text-slate-400 truncate">{result.author}</p>
                          <div className="flex items-center gap-2">
                            {result.firstPublishYear && (
                              <p className="text-xs text-slate-500">{result.firstPublishYear}</p>
                            )}
                            {result.hasFullText && (
                              <span className="text-xs text-emerald-400 font-medium">Full text available</span>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => addBookToLibrary(result)}
                          disabled={isAdded || isChecking}
                          size="sm"
                          className={
                            isAdded
                              ? "bg-emerald-600 text-white cursor-not-allowed"
                              : isChecking
                                ? "bg-amber-600 text-white cursor-wait"
                                : result.hasFullText
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "bg-amber-600 hover:bg-amber-700 text-white"
                          }
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Added
                            </>
                          ) : isChecking ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Checking...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : adminSearchQuery ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Search className="w-12 h-12 text-slate-600" />
                  <p className="text-slate-400">No results found</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Library className="w-12 h-12 text-slate-600" />
                  <p className="text-slate-400">Search Open Library to add books</p>
                  <p className="text-slate-500 text-sm text-center max-w-sm">
                    Find any book and add it to your library. Added books will be available to all users.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDownloadProgress && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-8 text-center border border-slate-700">
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Generating PDF</h3>
            <p className="text-slate-400">{downloadStatus}</p>
          </div>
        </div>
      )}
    </div>
  )
}
