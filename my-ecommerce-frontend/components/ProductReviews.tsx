'use client';

import { useState, useEffect, useRef } from 'react';
import { API_URL } from '@/src/lib/api';
import { useAuth } from '@/src/context/AuthContext';
import { useNotification } from '@/src/context/NotificationContext';
import { Star, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  images: string[];
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { isLoggedIn, user } = useAuth();
  const { showNotification } = useNotification();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/reviews/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Max 3 images
    if (images.length + files.length > 3) {
      showNotification('Maximum 3 images allowed per review', 'error');
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]); // cleanup
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      showNotification('Please log in to leave a review', 'error');
      return;
    }
    if (!comment.trim()) {
      showNotification('Please write a comment', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('rating', rating.toString());
      formData.append('comment', comment);
      images.forEach(img => formData.append('images', img));

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/reviews/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        showNotification('Review submitted successfully!', 'success');
        setShowForm(false);
        setComment('');
        setRating(5);
        setImages([]);
        setPreviews([]);
        fetchReviews(); // Refresh list
      } else {
        const errorData = await res.json();
        showNotification(errorData.message || 'Failed to submit review', 'error');
      }
    } catch (error) {
      showNotification('Network error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16 border-t border-brand-text/5 mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight mb-3">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-brand-accent text-brand-accent' : 'text-brand-text/20'}`} 
                />
              ))}
            </div>
            <span className="font-sans font-medium">{averageRating.toFixed(1)} out of 5</span>
            <span className="text-brand-muted font-sans text-sm">({reviews.length} reviews)</span>
          </div>
        </div>

        {isLoggedIn && !reviews.some(r => r.user?._id === user?._id) && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-secondary whitespace-nowrap"
          >
            {showForm ? 'Cancel Review' : 'Write a Review'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-brand-panel p-6 md:p-8 rounded-3xl border border-brand-text/5 shadow-soft mb-12 overflow-hidden"
          >
            <h3 className="text-xl font-serif font-bold mb-6">Leave Your Review</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-sans font-medium mb-3">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star className={`w-8 h-8 ${star <= rating ? 'fill-brand-accent text-brand-accent' : 'text-brand-text/20 hover:text-brand-accent/50'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-sans font-medium mb-2">Review</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your thoughts about this piece..."
                className="w-full bg-brand-bg border border-brand-text/10 rounded-2xl p-4 min-h-[120px] focus:outline-none focus:border-brand-accent resize-none font-sans"
                required
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-sans font-medium mb-3">Add Photos <span className="text-brand-muted font-normal text-xs">(Max 3)</span></label>
              <div className="flex flex-wrap gap-4">
                {previews.map((preview, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl border border-brand-text/10 overflow-hidden group">
                    <img src={preview} alt="upload preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {images.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-brand-text/20 flex flex-col items-center justify-center gap-2 hover:border-brand-accent hover:bg-brand-accent/5 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-brand-muted" />
                    <span className="text-[10px] font-sans font-medium uppercase tracking-widest text-brand-muted">Upload</span>
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={submitting}
                className="btn-gold px-8 py-3 w-full md:w-auto flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Posting Review...' : 'Post Review'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
          </div>
        ) : reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review._id} className="bg-brand-panel p-6 md:p-8 rounded-3xl border border-brand-text/5 shadow-soft">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-text/5 overflow-hidden flex-shrink-0">
                    {review.user?.avatar ? (
                      <img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-text font-serif font-bold text-lg">
                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-base">{review.user?.name || 'Anonymous User'}</h4>
                    <span className="text-brand-muted text-xs font-sans">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= review.rating ? 'fill-brand-accent text-brand-accent' : 'text-brand-text/20'}`} 
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-brand-text font-sans leading-relaxed mb-6">
                {review.comment}
              </p>

              {review.images && review.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {review.images.map((img, idx) => (
                    <div key={idx} className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-brand-text/10">
                      <img src={img} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-brand-panel rounded-3xl border border-brand-text/5">
            <ImageIcon className="w-12 h-12 text-brand-text/10 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold mb-2">No Reviews Yet</h3>
            <p className="text-brand-muted font-sans max-w-sm mx-auto">
              Be the first to share your experience with this beautiful piece.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
