import "./styles.css";

const Blurb = () => {
  return (
    <section className="blurb-container">
      <p className="paragraph">AI-native fullstack product engineer.</p>
      <p className="paragraph">
        Expertise in Web. Typescript, React, React Native, NodeJS, Rails,
        REST/GraphQL, Storybook, testing libraries, etc, etc.
      </p>
      <p className="paragraph">
        Rips @{" "}
        <a className="link" href="https://play.underdogfantasy.com/bigriss-bbbdfc02f9d75f4b">Underdog</a>
      </p>
      <p className="paragraph">
        I like puzzles and live music. I study French. I live in Brooklyn. I
        value meaningful projects, thorough code review and winning as a team.
      </p>
      <p className="paragraph">
        I make small, pointless games that make me laugh. Currently supporting
        Underdog products and adding to a collection of useless domains.
      </p>
    </section>
  );
};

export default Blurb;
