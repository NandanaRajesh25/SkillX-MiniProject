export default function FileList({ title, files }) {
  return (
    <div className="p-4 bg-[#0b0f19] rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
      {files.length === 0 ? (
        <p className="text-gray-400 mt-2">No files found.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {files.map((file, index) => (
            <li
              key={index}
              className="p-3 flex justify-between items-center bg-[#161b27] rounded-md shadow-md hover:bg-[#1c2433] transition-all"
            >
              <div className="flex flex-col">
                <span className="text-gray-300">
                  {file.name}{" "}
                  <span className="text-gray-500">
                    ({file.sender?.userName || "Unknown"})
                  </span>
                </span>
                {file.description && (
                  <p className="text-gray-400 text-sm mt-1">{file.description}</p>
                )}
              </div>

              <a
                href={file.theFile}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 px-4 py-2 text-[18px] text-gray-400 bg-[#0b0f19] rounded-md transition-all ease-in-out duration-300 hover:bg-[#161b27] hover:text-gray-200 hover:shadow-lg hover:shadow-blue-900/50"
              >
                <span className="hidden sm:block opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  View
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
