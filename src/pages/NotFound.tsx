import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SEO 
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Return to FUZO to discover amazing food and restaurants."
        keywords="404, page not found, error"
        tags={['404', 'error']}
      />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-primary font-serif" style={{ fontFamily: 'Georgia, Times New Roman, Times, serif' }}>
          404
        </h1>
        <p className="text-xl text-gray-600 mb-4 font-serif" style={{ fontFamily: 'Georgia, Times New Roman, Times, serif' }}>
          Oops! Page not found
        </p>
        <a href="/" className="text-primary hover:text-primary/80 underline font-serif" style={{ fontFamily: 'Georgia, Times New Roman, Times, serif' }}>
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
