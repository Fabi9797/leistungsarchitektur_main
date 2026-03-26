import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Edit2, Trash2 } from "lucide-react";
import TestimonialFlipCard from "@/components/testimonials/TestimonialFlipCard";
import TestimonialForm from "@/components/testimonialcards/TestimonialForm";
import TestimonialCardModal from "@/components/testimonialcards/TestimonialCardModal";

export default function TestimonialCards832() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const records = await base44.entities.Testimonial.list();
      setTestimonials(records || []);
    } catch (error) {
      console.error("Error loading testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sicher, dass du dieses Testimonial löschen möchtest?")) return;
    try {
      await base44.entities.Testimonial.delete(id);
      setTestimonials(testimonials.filter(t => t.id !== id));
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting testimonial:", error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTestimonial(null);
  };

  const handleFormSuccess = () => {
    loadTestimonials();
    handleFormClose();
  };

  const activeTestimonials = testimonials.filter(t => t.is_active !== false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Testimonial Flip-Cards
          </h1>
          <p className="text-muted-foreground">
            Verwalte und präsentiere Kundenerfolgsgeschichten als interaktive 3D-Flip-Cards
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => {
              setEditingTestimonial(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Neues Testimonial
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {activeTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="group relative">
              <TestimonialFlipCard testimonial={testimonial} />
              
              {/* Action Buttons Overlay */}
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingTestimonial(testimonial)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
                  title="Bearbeiten"
                >
                  <Edit2 className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-red-50 transition-colors"
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {activeTestimonials.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Noch keine aktiven Testimonials vorhanden</p>
            <button
              onClick={() => {
                setEditingTestimonial(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Erstes Testimonial erstellen
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <TestimonialForm
          testimonial={editingTestimonial}
          onSuccess={handleFormSuccess}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}