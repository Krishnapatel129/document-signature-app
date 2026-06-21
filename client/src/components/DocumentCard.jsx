import { Link } from "react-router-dom";

export default function DocumentCard({
  document,
}) {
  const getBadgeColor = () => {
    switch (
      document.status?.toLowerCase()
    ) {
      case "signed":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-lg transition p-5">

      <div className="flex justify-between items-start">
        <h2 className="font-semibold text-lg break-all">
          {document.fileName || "Untitled Document"}
        </h2>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor()}`}
        >
          {document.status}
        </span>
      </div>

      {document.status?.toLowerCase() === "rejected" && document.rejectionReason && (
        <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="font-medium">Rejection reason:</span>
          <span className="ml-2 break-words">{document.rejectionReason}</span>
        </p>
      )}

      <p className="text-gray-500 text-sm mt-3">
        Size:
        {" "}
        {document.fileSize ? (document.fileSize / 1024).toFixed(2) : "N/A"}
      </p>

      <p className="text-gray-500 text-sm">
        Uploaded:
        {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : "N/A"}
      </p>

      <Link
        to={`/viewer/${document._id}`}
        className="mt-5 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Open Document
      </Link>

    </div>
  );
}