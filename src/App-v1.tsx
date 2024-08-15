import { useEffect, useState, FormEvent, createContext } from "react";
import { faker } from "@faker-js/faker";

function createRandomPost() {
  return {
    title: `${faker.hacker.adjective()} ${faker.hacker.noun()}`,
    body: faker.hacker.phrase(),
  };
}

interface HasPost {
  title: string;
  body: string;
}

function App() {
  const [posts, setPosts] = useState<HasPost[]>(() =>
    Array.from({ length: 30 }, () => createRandomPost())
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFakeDark, setIsFakeDark] = useState<boolean>(false);

  /*
    1. create a var in a createContext();
    2. return a App component add <PostComponent> <PostComponent/>
  */
  interface PostContextType {
    posts: boolean | HasPost[];
    onAddPost: (data: HasPost) => void;
    onClearPosts: () => void;
    searchQuery: string;
    setSearchQuery: (data: string) => void;
    //setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  }
  const PostContext = createContext<PostContextType | null>(null);

  // Derived state. These are the posts that will actually be displayed
  const searchedPosts =
    searchQuery.length > 0
      ? posts instanceof Array &&
        posts.filter((post) =>
          `${post.title} ${post.body}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
      : posts;

  function handleAddPost(post: HasPost) {
    setPosts((posts: HasPost[]) => [
      {
        title: post.title,
        body: post.body,
      },
      ...posts,
    ]);
  }

  function handleClearPosts() {
    setPosts([]);
  }

  // Whenever `isFakeDark` changes, we toggle the `fake-dark-mode` class on the HTML element (see in "Elements" dev tool).
  useEffect(
    function () {
      document.documentElement.classList.toggle("fake-dark-mode");
    },
    [isFakeDark]
  );

  return (
    <PostContext.Provider
      value={{
        posts: searchedPosts,
        onAddPost: handleAddPost,
        onClearPosts: handleClearPosts,
        searchQuery: searchQuery,
        setSearchQuery: setSearchQuery,
      }}
    >
      <section>
        <button
          onClick={() => setIsFakeDark((isFakeDark) => !isFakeDark)}
          className="btn-fake-dark-mode"
        >
          {isFakeDark ? "☀️" : "🌙"}
        </button>

        <Header
          posts={searchedPosts}
          onClearPosts={handleClearPosts}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <Main posts={searchedPosts} onAddPost={handleAddPost} />
        <Archive onAddPost={handleAddPost} />
        <Footer />
      </section>
    </PostContext.Provider>
  );
}

interface HasHeader {
  posts: HasPost[] | boolean;
  onClearPosts: () => void;
  searchQuery: string;
  setSearchQuery: (data: string) => void;
}

function Header({
  posts,
  onClearPosts,
  searchQuery,
  setSearchQuery,
}: HasHeader) {
  return (
    <header>
      <h1>
        <span>⚛️</span>The Atomic Blog
      </h1>
      <div>
        {posts instanceof Array && <Results posts={posts} />}
        <SearchPosts
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <button onClick={onClearPosts}>Clear posts</button>
      </div>
    </header>
  );
}

interface HasSearchPosts {
  searchQuery: string;
  setSearchQuery: (data: string) => void;
}

function SearchPosts({ searchQuery, setSearchQuery }: HasSearchPosts) {
  return (
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search posts..."
    />
  );
}

function Results({
  posts,
}: {
  posts: {
    title: string;
    body: string;
  }[];
}) {
  return <p>🚀 {posts.length} atomic posts found</p>;
}

interface HasMain {
  posts: HasPost[] | boolean;
  onAddPost: (post: { title: string; body: string }) => void;
}

function Main({ posts, onAddPost }: HasMain) {
  return (
    <main>
      <FormAddPost onAddPost={onAddPost} />
      <Posts posts={posts} />
    </main>
  );
}

function Posts({ posts }: { posts: HasPost[] | boolean }) {
  return (
    <section>
      <List posts={posts} />
    </section>
  );
}

function FormAddPost({
  onAddPost,
}: {
  onAddPost: (post: { title: string; body: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = function (e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!body || !title) return;
    onAddPost({ title: title, body: body });
    setTitle("");
    setBody("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Post body"
      />
      <button>Add post</button>
    </form>
  );
}
interface Haslists {
  posts: HasPost[] | boolean;
}

function List({ posts }: Haslists) {
  return (
    <ul>
      {posts instanceof Array &&
        posts.map((post: HasPost, i: number) => (
          <li key={i}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
          </li>
        ))}
    </ul>
  );
}

interface HasArchive {
  onAddPost(post: HasPost): void;
}

function Archive({ onAddPost }: HasArchive) {
  // Here we don't need the setter function. We're only using state to store these posts because the callback function passed into useState (which generates the posts) is only called once, on the initial render. So we use this trick as an optimization technique, because if we just used a regular variable, these posts would be re-created on every render. We could also move the posts outside the components, but I wanted to show you this trick 😉
  const [posts] = useState(() =>
    // 💥 WARNING: This might make your computer slow! Try a smaller `length` first
    Array.from({ length: 10000 }, () => createRandomPost())
  );

  const [showArchive, setShowArchive] = useState(false);

  return (
    <aside>
      <h2>Post archive</h2>
      <button onClick={() => setShowArchive((s) => !s)}>
        {showArchive ? "Hide archive posts" : "Show archive posts"}
      </button>

      {showArchive && (
        <ul>
          {posts.map((post, i) => (
            <li key={i}>
              <p>
                <strong>{post.title}:</strong> {post.body}
              </p>
              <button onClick={() => onAddPost(post)}>Add as new post</button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function Footer() {
  return <footer>&copy; by The Atomic Blog ✌️</footer>;
}

export default App;
