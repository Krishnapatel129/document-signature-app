export default function StatusFilter({
  value,
  onChange,
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        border
        rounded-lg
        px-4
        py-2
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
      "
    >
      <option value="all">
        All Documents
      </option>

      <option value="signed">
        Signed
      </option>

      <option value="pending">
        Pending
      </option>

      <option value="rejected">
        Rejected
      </option>
    </select>
  );
}
