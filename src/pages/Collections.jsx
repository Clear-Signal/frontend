import { useState } from "react";
import CollectionCard from "../components/collections/CollectionCard";
import CollectionModal from "../components/collections/CollectionModal";
import { useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";


export default function CollectionsPage() {
  const [openCollection, setOpenCollection] = useState(null);
  const navigate = useNavigate();

  const { data: collections, loading, error } = useFetch(`/api/general/collection`);

  function handleView(collection) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg-black)] text-[var(--color-fg)] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Problem Collections
          </h1>
        </header>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections?.map((c) => (
              <CollectionCard key={c._id} collection={c} onView={handleView} setOpenCollection={setOpenCollection}/>
            ))}
          </div>
        </section>
      </div>
      <CollectionModal
        isOpen={!!openCollection}
        onClose={() => setOpenCollection(null)}
        onOpenProblem={(problem) => navigate(`/problems/${problem._id}`)}
        collectionId={openCollection}
      />
    </main>
  );
}
