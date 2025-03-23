import Link from "next/link";

export default function FileList({ title, files }) {
  return (
    <div className="p-4 border rounded-lg bg-gray-100 h-48 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {files.length === 0 ? (
        <p className="text-gray-500">No files available.</p>
      ) : (
        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file.id} className="p-2 border rounded-md bg-white">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-600">{file.description}</p>
              
              <Link href={file.theFile.url} target="_blank">
                <span className="text-blue-500 underline">Download</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
