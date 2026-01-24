const Footer = () => {
    return (
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Simple E-Commerce. Spring Boot & Next.js Project.
          </p>
        </div>
      </footer>
    );
  };
  
export default Footer;