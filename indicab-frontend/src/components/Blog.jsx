import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../features/admin/adminSlice";

const Blog = () => {
  const dispatch = useDispatch();
  const { blogs, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const blogPosts = blogs && blogs.length > 0 ? blogs : [];

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <p>Loading blogs...</p>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4" style={{ fontWeight: "bold" }}>
        IndiCab Travel Blog
      </h1>
      <p className="text-center text-muted mb-5">
        Your ultimate guide to exploring India, one road trip at a time.
      </p>
      {blogPosts && blogPosts.length > 0 ? (
        <div className="row">
          {blogPosts.map((post) => (
            <div className="col-md-6 col-lg-4 mb-4" key={post.id || post.title}>
              <div
                className="card h-100 shadow-sm"
                style={{ borderRadius: "15px" }}
              >
                {post.image && (
                  <img
                    src={post.image}
                    className="card-img-top"
                    alt={post.title}
                    style={{
                      borderTopLeftRadius: "15px",
                      borderTopRightRadius: "15px",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title" style={{ fontWeight: "bold" }}>
                    {post.title}
                  </h5>
                  <div className="text-muted small mb-2">
                    <span>{post.date}</span> &middot;{" "}
                    <span>{post.views || 0} Views</span>
                  </div>
                  <p className="card-text flex-grow-1">{post.preview}</p>
                  <a
                    href="#"
                    className="btn btn-primary mt-auto align-self-start"
                  >
                    Read More
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info text-center">
          No blogs available. Check back soon!
        </div>
      )}
      <div className="row mt-5">
        <div className="col-lg-8 offset-lg-2">
          <div
            className="text-center p-4 bg-light"
            style={{ borderRadius: "15px" }}
          >
            <h3 style={{ fontWeight: "bold" }}>
              Subscribe to Our Newsletter
            </h3>
            <p className="text-muted">
              Get the latest travel tips, guides, and offers delivered straight
              to your inbox.
            </p>
            <form className="d-flex justify-content-center">
              <input
                type="email"
                className="form-control w-50 me-2"
                placeholder="Enter your email"
              />
              <button type="submit" className="btn btn-success">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
