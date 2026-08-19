import katex from "katex";

export default function Formula({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, {
    throwOnError: false,
    displayMode: true,
    output: "html",
  });
  return <div className="formula" dangerouslySetInnerHTML={{ __html: html }} />;
}
