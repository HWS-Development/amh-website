import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found · MGH</title>
        <meta name="description" content="The page you are looking for could not be found." />
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-white text-center px-4">
        <h1 className="text-8xl font-bold text-brand-action">404</h1>
        <h2 className="text-3xl font-bold text-brand-ink mt-4 mb-2">Page Not Found</h2>
        <p className="text-lg text-brand-ink/80 mb-8 max-w-md">
          Oops! The page you’re looking for doesn’t exist. It might have been moved or deleted.
        </p>
        <Button asChild size="lg" className="btn-action">
          <Link to="/">Go Back Home</Link>
        </Button>
      </div>
    </>
  );
};

export default NotFoundPage;