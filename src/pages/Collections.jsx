import { useState, useMemo, useContext } from "react"; // 1. Import useContext
import { useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import LoadingScreen from "../components/LoadingScreen";
import CollectionCard from "../components/collections/CollectionCard";
import CollectionModal from "../components/collections/CollectionModal";
import { AuthContext } from "../stores/authStore"; // 2. Import your AuthContext

export default function CollectionsPage() {
  const [openCollection, setOpenCollection] = useState(null);
  const navigate = useNavigate();

  // 3. Get the current user from the context
  const { user } = useContext(AuthContext);

  const {
    data: collections,
    loading,
    error,
  } = useFetch(`/api/general/collection`);

  const { freeCollections, premiumCollections } = useMemo(() => {
    const free = [];
    const premium = [];
    (collections?.data || []).forEach((collection) => {
      if (collection.isPremium) {
        premium.push(collection);
      } else {
        free.push(collection);
      }
    });
    return { freeCollections: free, premiumCollections: premium };
  }, [collections]);

  // 4. Update the click handler with the new logic
  function handleView(collection) {
    // Check if the collection is premium AND the user does not have access
    if (collection.isPremium && !user?.data?.hasPremiumAccess) {
      // If so, redirect them to the subscription page
      navigate("/subscription");
    } else {
      // Otherwise, open the collection modal as normal
      setOpenCollection(collection._id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--color-bg-black)] text-red-400 py-12 text-center">
        <h1 className="text-2xl">Failed to load collections.</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg-black)] text-[var(--color-fg)] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Problem Collections
          </h1>
        </header>

        {freeCollections.length > 0 && (
          <section className="mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeCollections.map((c) => (
                // 5. Pass the updated handleView function to the card
                <CollectionCard
                  key={c._id}
                  collection={c}
                  onView={() => handleView(c)}
                />
              ))}
            </div>
          </section>
        )}

        {premiumCollections.length > 0 && (
          <section>
            <h2 className=" text-3xl sm:text-4xl font-semibold text-center mb-6 pb-3 text-[var(--text-default)]">
              Premium Collections{" "}
              <span className="text-sm bg-yellow-500 text-black p-1 rounded-3xl">
                PRO
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumCollections.map((c) => (
                // 5. Pass the updated handleView function to the card
                <CollectionCard
                  user={user}
                  key={c._id}
                  collection={c}
                  onView={() => handleView(c)}
                />
              ))}
            </div>
          </section>
        )}

        {!collections.data?.length && (
          <div className="text-center text-gray-500 py-16">
            <p>No collections are available at the moment.</p>
          </div>
        )}
      </div>
      {openCollection && (
        <CollectionModal
        isOpen={!!openCollection}
        onClose={() => setOpenCollection(null)}
        onOpenProblem={(problem) => navigate(`/problems/${problem._id}`)}
        collectionId={openCollection}
      />
      )}
    </main>
  );
}
