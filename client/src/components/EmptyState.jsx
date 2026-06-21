export default function EmptyState() {
  return (
    <div
      className="
        text-center
        py-16
      "
    >
      <h3 className="text-xl font-semibold">
        No documents found
      </h3>

      <p className="text-gray-500 mt-2">
        Upload a document to get started.
      </p>
    </div>
  );
}