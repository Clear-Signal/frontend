import { useState } from "react";
import CollectionCard from "../components/CollectionCard";
import CollectionModal from "../components/CollectionModal";

const COLLECTIONS = [
  {
    id: "deep-learning",
    title: "Deep Learning",
    sections: 6,
    progress: 0,
    badgeUrl: "",
    resource: null,
  },
  {
    id: "densenet",
    title: "DenseNet",
    sections: 1,
    progress: 0,
    badgeUrl: "",
    resource: "https://example.com/densenet",
  },
  {
    id: "linear-algebra",
    title: "Linear Algebra",
    sections: 4,
    progress: 0,
    badgeUrl: "",
    resource: null,
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    sections: 7,
    progress: 0,
    badgeUrl: "",
    resource: null,
  },
  {
    id: "resnet",
    title: "ResNet",
    sections: 1,
    progress: 0,
    badgeUrl: "",
    resource: "https://example.com/resnet",
  },
];

export default function CollectionsPage({ collections = COLLECTIONS }) {
  const [openCollection, setOpenCollection] = useState(null);
  function handleView(collection) {
    console.log("View collection:", collection.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Problem Collections
          </h1>
          <p className="mt-2 text-sm text-[var(--color-fg)]">
            Collections grouped by topic — complete sections to earn badges.
          </p>
        </header>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((c) => (
              <CollectionCard key={c.id} collection={c} onView={handleView} setOpenCollection={setOpenCollection}/>
            ))}
          </div>
        </section>
      </div>
      <CollectionModal
        isOpen={!!openCollection}
        onClose={() => setOpenCollection(null)}
        onOpenProblem={(problem) => console.log("Open problem:", problem.id)}
      />
    </main>
  );
}
