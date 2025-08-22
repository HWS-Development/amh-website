
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumb = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="content-wrapper flex items-center space-x-2 text-sm text-brand-ink/70">
        <li>
          <Link to="/" className="hover:text-brand-action">Home</Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4" />
            {item.href ? (
              <Link to={item.href} className="hover:text-brand-action">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-brand-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
