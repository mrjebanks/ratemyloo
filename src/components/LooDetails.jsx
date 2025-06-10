import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import AddReviewForm from './AddReviewForm';

const LooDetails = ({ selectedLoo }) => {
  const [looData, setLooData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedLoo) return;

    const fetchLooDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/toilets/${selectedLoo}`);
        if (!response.ok) throw new Error('Could not fetch toilet details.');
        const data = await response.json();
        setLooData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLooDetails();
  }, [selectedLoo]);

  if (!selectedLoo) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Select a toilet on the map to see details.</p>
      </div>
    );
  }

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!looData) return null;
  
  // Function to refresh details after submitting a review
  const handleReviewAdded = (newReview) => {
    setLooData(prevData => ({
        ...prevData,
        reviews: [newReview, ...prevData.reviews]
    }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{looData.name}</h2>
      <p className="text-gray-600 mb-4">{looData.address}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
        <div className="p-4 bg-blue-100 rounded-lg">
          <h3 className="font-semibold text-blue-800">Overall</h3>
          <StarRating rating={looData.avg_overall_rating} />
          <span className="text-sm text-blue-600">{Number(looData.avg_overall_rating).toFixed(1)}/5</span>
        </div>
        <div className="p-4 bg-green-100 rounded-lg">
          <h3 className="font-semibold text-green-800">Cleanliness</h3>
          <StarRating rating={looData.avg_cleanliness_rating} />
           <span className="text-sm text-green-600">{Number(looData.avg_cleanliness_rating).toFixed(1)}/5</span>
        </div>
        <div className="p-4 bg-purple-100 rounded-lg">
          <h3 className="font-semibold text-purple-800">Accessibility</h3>
          <StarRating rating={looData.avg_accessibility_rating} />
           <span className="text-sm text-purple-600">{Number(looData.avg_accessibility_rating).toFixed(1)}/5</span>
        </div>
      </div>
      
      <AddReviewForm toiletId={looData.toilet_id} onReviewAdded={handleReviewAdded} />

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Reviews ({looData.review_count})</h3>
        <div className="space-y-4">
          {looData.reviews.map(review => (
            <div key={review.review_id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{review.username}</span>
                    <StarRating rating={review.overall_rating} />
                </div>
              <p className="text-gray-700">{review.comment}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LooDetails;