import "./styles.css";

interface HeaderProps {
  className?: string;
}

const Header = (props: HeaderProps) => {
  const { className = "" } = props;

  return (
    <header>
      <h1 className={`header ${className}`}>Arissa Fram.</h1>
    </header>
  );
};

export default Header;
