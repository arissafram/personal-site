import "./styles.css";

const LINKS = [
  {
    href: "https://www.linkedin.com/in/arissafram/",
    label: "LinkedIn",
  },
  {
    href: "https://github.com/arissafram",
    label: "Github",
  },
  {
    href: "https://medium.com/@arissafram",
    label: "Medium",
  },
  {
    href: "https://www.strava.com/athletes/61215365",
    label: "Strava",
  },
  {
    href: "https://www.linkedin.com/posts/underdogfantasy_udlife-activity-7084570560994652160-1eI4?utm_source=share&utm_medium=member_desktop",
    label: "Me at work",
  },
  {
    href: "https://arissafram.github.io/react-jigsaw/demo/",
    label: "react-jigsaw",
  },
];

const Links = () => {
  return (
    <ul className="links">
      {LINKS.map((link) => (
        <li className="link">
          <a href={link.href} rel="noopener noreferrer" target="_blank">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default Links;
