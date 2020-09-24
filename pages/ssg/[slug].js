import { useRouter } from "next/router";
import Head from "next/head";
import ErrorPage from "next/error";
import Container from "../../components/container";
import PostBody from "../../components/post-body";
import MoreStories from "../../components/more-stories";
import Header from "../../components/header";
import PostHeader from "../../components/post-header";
import SectionSeparator from "../../components/section-separator";
import Layout from "../../components/layout";
import { getAllPostsWithSlug, getPostAndMorePosts } from "../../lib/api";
import PostTitle from "../../components/post-title";
import { CMS_NAME } from "../../lib/constants";
import { useEffect, useState } from "react";
import Axios from "axios";

export default function Post({ post, morePosts, preview }) {
  const [qoutes, setqoutes] = useState(null);

  const loadQoutes = () => {
    setqoutes(null);
    Axios.get("https://www.randomtext.me/api/ol-6/3-5").then((response) => {
      setqoutes(response.data.text_out);
    });
  };
  useEffect(() => {
    //load Janus

    loadQoutes();

    return () => {
      // cleanup;
    };
  }, []);
  const getData = (author) => {
    console.log("post.author", post.author);
    alert("author : " + author);
  };
  const router = useRouter();

  if (!router.isFallback && !post) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <Layout preview={preview}>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article>
              <Head>
                <title>
                  {post.title} | Next.js Blog Example with {CMS_NAME}
                </title>
                <meta property="og:image" content={post.coverImage.url} />
              </Head>

              <PostHeader title={post.title} coverImage={post.coverImage} date={post.date} author={post.author} />
              {console.log("render body", post.author.name)}
              <PostBody content={post.content} />
              <button className="p-4 bg-black text-white" onClick={() => getData(post.author.name)}>
                Alert Author Name
              </button>
            </article>
            {/* <SectionSeparator />
            {morePosts && morePosts.length > 0 && <MoreStories posts={morePosts} />} */}

            <hr className="mt-4" />
            <div className="p-5 qoutes-container">
              <h1 className="h1">
                Dynamic Qoutes <span onClick={() => loadQoutes()}>Load more </span>
              </h1>
              {qoutes == null ? (
                <div className="loading">loading..</div>
              ) : (
                <div className="p-5">
                  <div className="list-qoutes" dangerouslySetInnerHTML={{ __html: qoutes }} />
                </div>
              )}
            </div>
          </>
        )}
      </Container>
    </Layout>
  );
}

export async function getStaticProps({ params, preview = false }) {
  const data = await getPostAndMorePosts(params.slug, preview);

  return {
    props: {
      preview,
      post: data?.post ?? null,
      morePosts: data?.morePosts ?? null,
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  const allPosts = await getAllPostsWithSlug();
  return {
    paths: allPosts?.map(({ slug }) => `/ssg/${slug}`) ?? [],
    fallback: false,
  };
}
