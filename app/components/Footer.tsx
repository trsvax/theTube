export default function Footer() {
  const app = process.env.COMMIT_APP;
  const content = process.env.COMMIT_CONTENT;
  const priv = process.env.COMMIT_PRIVATE;
  return (
    <footer>
      <div>© {new Date().getFullYear()}</div>
      <div className="build-sha">
        <a href={`https://github.com/trsvax/theTube/commit/${app}`}>{app}</a>
        {" · "}
        <a href={`https://github.com/trsvax/theTube-content/commit/${content}`}>{content}</a>
        {" · "}
        <span title="private">{priv}</span>
      </div>
    </footer>
  );
}
