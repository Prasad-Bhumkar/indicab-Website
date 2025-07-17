import React from "react";

const Blog = () => {
  const blogPosts = [
    {
      title: "Top 10 Must-Visit Destinations in Rajasthan",
      date: "July 15, 2025",
      views: "1.2K",
      preview:
        "Discover the majestic forts, vibrant markets, and rich culture of Rajasthan. Our guide covers the top destinations you can't miss on your next trip.",
      category: "Travel Guide",
      image:
        "https://i.ytimg.com/vi/nF3icHV6TnU/hqdefault.jpg",
    },
    {
      title: "The Ultimate Mumbai to Pune Road Trip Guide",
      date: "July 10, 2025",
      views: "2.5K",
      preview:
        "Planning a road trip from Mumbai to Pune? We've got you covered with the best routes, must-see stops, and essential tips for a memorable journey.",
      category: "Road Trips",
      image:
        "https://s3.india.com/travel/wp-content/uploads/2014/09/Mumbai-Gateway-625x470.jpg",
    },
    {
      title: "Exploring the Beaches of Pondicherry",
      date: "July 5, 2025",
      views: "890",
      preview:
        "From serene shores to bustling promenades, explore the best beaches Pondicherry has to offer. Your perfect coastal getaway awaits.",
      category: "Destinations",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZF4Hi6_hXHC6_M5nkuSNeTA2GVkTC4bDb8tS3esDbz4aXE1CcPj0LNdE9XvjJbrL2hv8&usqp=CAU",
    },
    {
      title: "A Guide to Delhi's Historical Monuments",
      date: "June 28, 2025",
      views: "950",
      preview:
        "Step back in time and explore the rich history of Delhi through its magnificent monuments. This guide will take you through the city's most iconic landmarks.",
      category: "History & Culture",
      image:
        "https://www.adventurush.com/wp-content/uploads/2024/04/MicrosoftTeams-image-41.jpg",
    },
    {
      title: "Street Food Experiences in Kolkata",
      date: "June 22, 2025",
      views: "1.8K",
      preview:
        "A culinary journey through the streets of Kolkata. Discover the must-try dishes and the best spots to find them.",
      category: "Food & Travel",
      image:
        "https://www.savaari.com/blog/wp-content/uploads/2023/08/Best-street-food-in-Kolkata.webp",
    },
    {
      title: "Weekend Getaways from Bangalore",
      date: "June 15, 2025",
      views: "3.1K",
      preview:
        "Escape the city buzz with these refreshing weekend getaways from Bangalore. From hill stations to historical sites, find your perfect retreat.",
      category: "Weekend Trips",
      image:
        "https://tds.indianeagle.com/wp-content/uploads/2021/10/3-Perfect-Weekend-Getaways-from-Bangalore-01.png",
    },
  ];

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4" style={{ fontWeight: "bold" }}>
        IndiCab Travel Blog
      </h1>
      <p className="text-center text-muted mb-5">
        Your ultimate guide to exploring India, one road trip at a time.
      </p>
      <div className="row">
        {blogPosts.map((post, index) => (
          <div className="col-md-6 col-lg-4 mb-4" key={index}>
            <div
              className="card h-100 shadow-sm"
              style={{ borderRadius: "15px" }}
            >
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
              <div className="card-body d-flex flex-column">
                <h5 className="card-title" style={{ fontWeight: "bold" }}>
                  {post.title}
                </h5>
                <div className="text-muted small mb-2">
                  <span>{post.date}</span> &middot;{" "}
                  <span>{post.views} Views</span>
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
