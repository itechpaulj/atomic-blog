import {
  useState,
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { faker } from "@faker-js/faker";
import { HasPost } from "./App";

function CreateRandomPost() {
  return {
    title: `${faker.hacker.adjective()} ${faker.hacker.noun()}`,
    body: faker.hacker.phrase(),
  };
}
export interface PostContextType {
  posts: boolean | HasPost[];
  onAddPost: (data: HasPost) => void;
  onClearPosts: () => void;
  searchQuery: string;
  setSearchQuery: (data: string) => void;
  totalPosts: string;
  //setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

interface HasPostContext {
  children: ReactNode;
}
const PostContext = createContext<PostContextType | null>(null);

function PostProvider({ children }: HasPostContext) {
  const [posts, setPosts] = useState<HasPost[]>(() =>
    Array.from({ length: 30 }, () => CreateRandomPost())
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const totalPosts =
    useMemo<string>(() => {
      return `${posts.length}`;
    }, [posts.length]) ?? "";

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

  const handleAddPost = useCallback(function handleAddPost(post: HasPost) {
    setPosts((posts: HasPost[]) => [
      {
        title: post.title,
        body: post.body,
      },
      ...posts,
    ]);
  }, []);

  function handleClearPosts() {
    setPosts([]);
  }

  const value = useMemo(() => {
    return {
      posts: searchedPosts,
      onAddPost: handleAddPost,
      onClearPosts: handleClearPosts,
      searchQuery: searchQuery,
      setSearchQuery: setSearchQuery,
      totalPosts: totalPosts,
    };
  }, [searchedPosts, handleAddPost, setSearchQuery, searchQuery, totalPosts]);

  return (
    <>
      <PostContext.Provider value={value}>{children}</PostContext.Provider>
    </>
  );
}

function UsePosts() {
  const context = useContext(PostContext);
  if (context === null) {
    throw new Error(
      `Developer mode: Post Context only applied in the Children prop [PostProvider]`
    );
  }
  return context;
}

export { PostProvider, PostContext, CreateRandomPost, UsePosts };
