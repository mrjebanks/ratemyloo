import React from 'react';

const StarRating = ({ rating = 0 }) => {
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full_${i}`} className="text-yellow-400 text-xl">★</span>
      ))}
      {halfStar && <span className="text-yellow-400 text-xl">☆</span>} // Simple half-star representation
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty_${i}`} className="text-gray-300 text-xl">☆</span>
      ))}
    </div>
  );
};

export default StarRating;
*/

// --- File: src/components/AddReviewForm.jsx ---
/*
import React, { useState } from 'react';

const AddReviewForm = ({ toiletId, onReviewAdded }) => {
    const [ratings, setRatings] = useState({
        overall_rating: 0,
        cleanliness_rating: 0,
        accessibility_rating: 0,
    });
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const token = localStorage.getItem('token'); // Assumes token is stored in localStorage

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('You must be logged in to leave a review.');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${toiletId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ ...ratings, comment }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to submit review.');
            
            // Pass the new review up to parent component
            onReviewAdded(data);
            
            // Reset form
            setRatings({ overall_rating: 0, cleanliness_rating: 0, accessibility_rating: 0 });
            setComment('');

        } catch (err) {
            setError(err.message);
        }
    };

    const handleRating = (name, value) => {
        setRatings(prev => ({...prev, [name]: value}));
    }

    return (
        <div className="my-6 p-4 border rounded-lg">
            <h3 className="font-bold text-lg mb-4">Leave a Review</h3>
            {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
            { !token && <p className="text-blue-500 bg-blue-100 p-2 rounded-md mb-4">Please log in to add your review.</p> }
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating Inputs */}
                {/* A more advanced implementation would use clickable stars */}
                <div>
                    <label>Overall (1-5)</label>
                    <input type="number" min="1" max="5" value={ratings.overall_rating} onChange={e => handleRating('overall_rating', e.target.value)} required className="w-full p-2 border rounded"/>
                </div>
                 <div>
                    <label>Cleanliness (1-5)</label>
                    <input type="number" min="1" max="5" value={ratings.cleanliness_rating} onChange={e => handleRating('cleanliness_rating', e.target.value)} required className="w-full p-2 border rounded"/>
                </div>
                 <div>
                    <label>Accessibility (1-5)</label>
                    <input type="number" min="1" max="5" value={ratings.accessibility_rating} onChange={e => handleRating('accessibility_rating', e.target.value)} required className="w-full p-2 border rounded"/>
                </div>

                <div>
                    <label>Comment</label>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full p-2 border rounded"></textarea>
                </div>

                <button type="submit" disabled={!token} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400">Submit Review</button>
            </form>
        </div>
    );
};

export default AddReviewForm;