import { useEffect, useState, FormEvent, memo, useMemo } from "react";
import {
  PostProvider,
  CreateRandomPost as createRandomPost,
  UsePosts as usePosts,
} from "./PostProvider"; // custom hook context API Provider

export interface HasPost {
  title: string;
  body: string;
}
interface HasResults {
  posts: HasPost[] | boolean;
}
/*
    1. create a var in a createContext();
    2. return a App component add <PostComponent> <PostComponent/>
  */

function App() {
  const [isFakeDark, setIsFakeDark] = useState<boolean>(false);
  // Whenever `isFakeDark` changes, we toggle the `fake-dark-mode` class on the HTML element (see in "Elements" dev tool).
  useEffect(
    function () {
      document.documentElement.classList.toggle("fake-dark-mode");
    },
    [isFakeDark]
  );

  const archivePosts = useMemo(() => {
    return {
      show: false,
      title: `Post archive`,
    };
  }, []);
  return (
    <section>
      <button
        onClick={() => setIsFakeDark((isFakeDark) => !isFakeDark)}
        className="btn-fake-dark-mode"
      >
        {isFakeDark ? "☀️" : "🌙"}
      </button>
      {/*  [PostProvider] custom hook provider */}
      <PostProvider>
        <Header />
        <Main />
        <Archive archivePosts={archivePosts} />
        <Footer />
      </PostProvider>
      {/*  [PostProvider] custom hook provider */}
    </section>
  );
}

interface HasHeader {
  posts: HasPost[] | boolean;
  onClearPosts: () => void;
  searchQuery?: string;
  setSearchQuery?: (data: string) => void;
}

function Header() {
  const headerContext = usePosts();
  if (!headerContext) return <></>;

  const { posts, onClearPosts }: HasHeader = headerContext;
  return (
    <header>
      <h1>
        <span>⚛️</span>The Atomic Blog
      </h1>
      <div>
        {posts instanceof Array && <Results />}
        <SearchPosts />
        <button onClick={onClearPosts}>Clear posts</button>
      </div>
    </header>
  );
}

interface HasSearchPosts {
  searchQuery: string;
  setSearchQuery: (data: string) => void;
}

function SearchPosts() {
  const searchPostsContext = usePosts();
  if (!searchPostsContext) return <></>;
  const { searchQuery, setSearchQuery }: HasSearchPosts = searchPostsContext;
  return (
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search posts..."
    />
  );
}

function Results() {
  const resultsContext = usePosts();
  if (!resultsContext) return <></>;
  const { posts }: HasResults = resultsContext;

  return (
    <p>
      🚀 {posts && posts instanceof Array && posts.length} atomic posts found
    </p>
  );
}

// interface HasMain {
//   posts: HasPost[] | boolean;
//   onAddPost: (post: HasPost) => void;
// }

const Main = memo(function Main() {
  const mainContext = usePosts();
  if (!mainContext) return <></>;

  return (
    <main>
      <FormAddPost />
      <Posts />
    </main>
  );
});

// interface HasPosts {
//   posts: HasPost[] | boolean;
// }

function Posts() {
  const postsContext = usePosts();
  if (!postsContext) return <></>;
  //const { posts }: HasPosts = postsContext;
  return (
    <section>
      <List />
    </section>
  );
}

interface HasFormAddPost {
  onAddPost: (post: HasPost) => void;
}

function FormAddPost() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = function (e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!body || !title) return;
    onAddPost({ title: title, body: body });
    setTitle("");
    setBody("");
  };
  const formAddPostContext = usePosts();
  if (!formAddPostContext) return <></>;
  const { onAddPost }: HasFormAddPost = formAddPostContext;
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

function List() {
  const listContext = usePosts();
  if (!listContext) return <></>;
  const { posts }: Haslists = listContext;
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
  onAddPost: (post: HasPost) => void;
  totalPosts: string;
}

type HasAcrhived = {
  archivePosts: {
    show: boolean;
    title: string;
  };
};

const Archive = memo(function Archive({ archivePosts }: HasAcrhived) {
  // Here we don't need the setter function. We're only using state to store these posts because the callback function passed into useState (which generates the posts) is only called once, on the initial render. So we use this trick as an optimization technique, because if we just used a regular variable, these posts would be re-created on every render. We could also move the posts outside the components, but I wanted to show you this trick 😉

  const [getPosts] = useState(() =>
    // 💥 WARNING: This might make your computer slow! Try a smaller `length` first
    Array.from({ length: 10000 }, () => createRandomPost())
  );

  const [showArchive, setShowArchive] = useState(archivePosts.show);
  const archieveContext = usePosts();
  if (!archieveContext) return <></>;
  const { onAddPost, totalPosts }: HasArchive = archieveContext;

  return (
    <aside>
      <h2>
        {archivePosts.title} Total: {`${totalPosts}`}
      </h2>
      <button onClick={() => setShowArchive((s) => !s)}>
        {showArchive ? "Hide archive posts" : "Show archive posts"}
      </button>

      {showArchive && (
        <ul>
          {getPosts.map((post, i) => (
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
});

function Footer() {
  return <footer>&copy; by The Atomic Blog ✌️</footer>;
}

export default App;
