import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

const QuartierDetailPage = () => {
  const { slug } = useParams();
  return <Navigate to={`/all-riads?quartier=${encodeURIComponent(slug || '')}`} replace />;
};

export default QuartierDetailPage;
