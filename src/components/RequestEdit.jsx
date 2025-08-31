import { useState, useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

// ✅ 1. Removed CATEGORIES constant
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const FIELDS = ["Title", "Description", "Test Cases", "Learn Section", "Difficulty", "Category"];

export default function RequestEditModal({ isOpen, onClose, problem }) {
  const [editType, setEditType] = useState("general");
  const [feedback, setFeedback] = useState("");
  const [checkedFields, setCheckedFields] = useState({});
  const [edits, setEdits] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const modalRef = useRef(null);

  const originalData = useMemo(() => ({
    title: problem?.title || '',
    description: problem?.description || '',
    testCases: JSON.stringify(problem?.sample, null, 2) || '',
    learnSection: problem?.aboutTopic || '',
    difficulty: problem?.difficulty || '',
    category: problem?.category || ''
  }), [problem]);

  useEffect(() => {
    if (isOpen) {
      setEdits(originalData);
    } else {
      setTimeout(() => {
        setEditType("general");
        setFeedback("");
        setCheckedFields({});
        setEdits({});
        setSubmitError("");
      }, 300);
    }
  }, [isOpen, originalData]);
  
  const handleCheckboxChange = (field) => {
    setCheckedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleEditChange = (field, value) => {
    setEdits(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    const payload = { problemId: problem._id, feedbackType: editType };

    if (editType === 'general') {
        payload.generalIssue = feedback;
    } else {
        Object.keys(checkedFields).forEach(fieldKey => {
            if (checkedFields[fieldKey]) {
                const schemaKey = fieldKey.charAt(0).toLowerCase() + fieldKey.slice(1).replace(' ', '');
                if (edits[schemaKey] !== originalData[schemaKey]) {
                    payload[schemaKey] = edits[schemaKey];
                }
            }
        });
    }

    try {
        await axios.post('/api/user/feedback/add', payload, { withCredentials: true });
        alert("Feedback submitted successfully!");
        onClose();
    } catch (err) {
        setSubmitError(err.response?.data?.message || "An error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // This sub-component now only renders the two-column inputs
  const renderEditFieldInputs = (field) => {
    const key = field.charAt(0).toLowerCase() + field.slice(1).replace(' ', '');
    const originalValue = originalData[key] || '';
    const isTextarea = ['description', 'testCases', 'learnSection'].includes(key);

    const inputComponent = (isEditable) => {
      const baseClasses = "w-full border rounded-lg p-3 text-sm placeholder:text-gray-500 focus:outline-none transition-all duration-200";
      const editableClasses = "bg-zinc-800 border-green-500/50 text-white focus:ring-2 focus:ring-green-500 ";
      const disabledClasses = "bg-zinc-900 border-red-500/50 text-gray-400 cursor-not-allowed ";
      const commonProps = {
        className: `${baseClasses} ${isEditable ? editableClasses : disabledClasses}`
      };

      if (key === 'difficulty') {
        return <select {...commonProps} value={isEditable ? edits.difficulty : originalValue} onChange={(e) => handleEditChange('difficulty', e.target.value)} disabled={!isEditable}>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      }

      // ✅ 2. Category is no longer a dropdown
      if (isTextarea) {
        return <textarea {...commonProps} value={isEditable ? edits[key] : originalValue} onChange={(e) => handleEditChange(key, e.target.value)} rows="5" disabled={!isEditable} />;
      }
      return <input type="text" {...commonProps} value={isEditable ? edits[key] : originalValue} onChange={(e) => handleEditChange(key, e.target.value)} disabled={!isEditable} />;
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Original</label>
          {inputComponent(false)}
        </div>
        <div>
          <label className="text-xs text-gray-300 block mb-1">
            {key === 'testCases' ? 'Your Edit (JSON format)' : 'Your Edit'}
          </label>
          {inputComponent(true)}
        </div>
      </div>
    );
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-4xl bg-[var(--color-bg)] text-white rounded-2xl shadow-xl border border-zinc-700 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold">Request Edit</h2>
              <p className="text-sm text-gray-400 mt-1">Help us improve this problem by suggesting edits or corrections.</p>
              <fieldset className="mt-6">
                <legend className="text-sm font-medium text-gray-300">Edit Type</legend>
                <div className="mt-2 flex items-center gap-6">
                  {["General Feedback", "Specific Changes"].map(type => {
                     const value = type.split(' ')[0].toLowerCase();
                     return (
                        <label key={value} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="editType" value={value} checked={editType === value} onChange={() => setEditType(value)} className="hidden" />
                            <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${editType === value ? 'border-white-500' : 'border-zinc-600'}`}>
                                {editType === value && <span className="h-2 w-2 rounded-full bg-indigo-400"></span>}
                            </span>
                            <span className="text-sm">{type}</span>
                        </label>
                     )
                  })}
                </div>
              </fieldset>
            </div>

            <div className="px-6 sm:px-8 py-6 overflow-y-auto">
              {editType === 'general' ? (
                <div>
                  <label htmlFor="feedback" className="text-sm font-medium text-gray-300">Describe the issue or suggest improvements</label>
                  <div className="relative">
                     <textarea
                        id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)}
                        maxLength={500} placeholder="Describe the issue or suggest improvements..."
                        className="w-full mt-2 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm placeholder:text-gray-500 h-30 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500"
                     />
                     <span className="absolute bottom-3 right-3 text-xs text-gray-500">{feedback.length}/500</span>
                  </div>
                </div>
              ) : (
                // ✅ 3. Updated JSX structure for "Specific Changes"
                <div className="space-y-6">
                  <p className="text-sm font-medium text-gray-300 -mb-2">Select the fields you want to edit and provide your changes:</p>
                  {FIELDS.map(field => (
                    <div key={field} className="border-t border-zinc-800 pt-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={!!checkedFields[field]} onChange={() => handleCheckboxChange(field)}
                          className="h-4 w-4 rounded bg-zinc-700 border-zinc-600 text-zinc-500 focus:ring-zinc-500"
                        />
                        <span className="font-semibold">{field}</span>
                      </label>
                      <AnimatePresence>
                        {checkedFields[field] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {renderEditFieldInputs(field)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 sm:px-8 py-4 bg-[var(--color-bg)] flex items-center justify-end gap-3 rounded-b-2xl mt-auto">
              {submitError && <p className="text-xs text-red-400 mr-auto">{submitError}</p>}
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-zinc-800 transition border border-zinc-500 cursor-pointer">Cancel</button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium bg-zinc-400 text-black rounded-lg transition disabled:opacity-50 cursor-pointer">
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}