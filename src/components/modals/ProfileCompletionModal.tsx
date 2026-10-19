"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useReputation } from "@/context/ReputationContext";
import { X, Award, CheckCircle2, Sparkles } from "lucide-react";

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, completeProfileBonus } = useAuth();
  const { addPoints } = useReputation();

  const [title, setTitle] = useState(user?.title || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [github, setGithub] = useState(user?.github || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [claimed, setClaimed] = useState(false);

  if (!isOpen || !user) return null;

  const isComplete = title.trim() !== "" && bio.trim() !== "" && location.trim() !== "";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      title,
      bio,
      location,
      github,
      website,
    });

    if (!user.profileCompleted) {
      completeProfileBonus();
      addPoints(10, "Profile completion bonus: 10 points awarded!");
      setClaimed(true);
      setTimeout(() => {
        setClaimed(false);
        onClose();
      }, 1800);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Complete Profile</span>
              {!user.profileCompleted && (
                <span className="text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                  +10 Points Bonus
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500">
              Provide mandatory details to boost community visibility.
            </p>
          </div>
        </div>

        {claimed ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              Profile Completed!
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              You earned <strong className="text-primary font-bold">+10 reputation points</strong> added to your public profile.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Professional Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Bio / About Me *
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your tech stack, goals, and experience..."
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Location (City, Country) *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Jaipur, Rajasthan, India"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  GitHub Handle
                </label>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="e.g. AmArChOuBeYu2"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Portfolio / Website
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {!user.profileCompleted && (
              <div className="bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Fill mandatory fields (*) to claim your one-time 10 reputation bonus!</span>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-xl text-xs font-medium border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isComplete}
                className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-dark text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                Save & Claim Points
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
