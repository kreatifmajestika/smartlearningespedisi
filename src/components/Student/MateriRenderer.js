// src/components/Student/Renderers.js

export const renderElement = ({ element, attributes, children }) => {
  const style = { textAlign: element.align || "left" };

  switch (element.type) {
    case "heading-one":
      return (
        <h1 {...attributes} style={style} className="text-3xl font-bold my-4">
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 {...attributes} style={style} className="text-2xl font-bold my-3">
          {children}
        </h2>
      );
    case "block-quote":
      return (
        <blockquote
          {...attributes}
          style={style}
          className="border-l-4 pl-4 italic my-4"
        >
          {children}
        </blockquote>
      );
    case "numbered-list":
      return (
        <ol {...attributes} style={style} className="list-decimal pl-8 my-2">
          {children}
        </ol>
      );
    case "bulleted-list":
      return (
        <ul {...attributes} style={style} className="list-disc pl-8 my-2">
          {children}
        </ul>
      );
    case "list-item":
      return (
        <li {...attributes} style={style} className="my-1">
          {children}
        </li>
      );
    case "image":
      return (
        <div {...attributes} contentEditable={false} className="my-4">
          <img
            src={element.url}
            alt=""
            className="max-w-full h-auto rounded-lg shadow-sm"
          />
          {children}
        </div>
      );
    case "video":
      return (
        <div {...attributes} contentEditable={false} className="my-4">
          {element.url.includes("youtube") ||
          element.url.includes("youtu.be") ? (
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(
                  element.url
                )}`}
                className="w-full h-96 rounded-lg"
                frameBorder="0"
                allowFullScreen
                title="YouTube video"
              />
            </div>
          ) : (
            <video controls className="w-full rounded-lg">
              <source src={element.url} />
            </video>
          )}
          {children}
        </div>
      );

    // Tambahkan dukungan untuk elemen tabel dan link
    case "table":
      return (
        <table {...attributes} className="border-collapse w-full my-4">
          <tbody>{children}</tbody>
        </table>
      );
    case "table-row":
      return <tr {...attributes}>{children}</tr>;
    case "table-cell":
      return (
        <td {...attributes} className="border border-gray-300 px-4 py-2">
          {children}
        </td>
      );
    case "link":
      return (
        <a
          {...attributes}
          href={element.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {children}
        </a>
      );
    default:
      return (
        <p {...attributes} style={style} className="my-2">
          {children}
        </p>
      );
  }
};

export const renderLeaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  if (leaf.code)
    children = <code className="bg-gray-100 px-1 rounded">{children}</code>;
  return <span {...attributes}>{children}</span>;
};

function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
