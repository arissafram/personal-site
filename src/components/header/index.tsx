import "./styles.css";

// Each word is its own span so phones can stack them, one word per line.
const Header = () => {
  return (
    <header>
      <h1 className="header">
        <span>Arissa</span> <span>Fram.</span>
      </h1>
    </header>
  );
};

export default Header;
