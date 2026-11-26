import "./styles.css";

const Blurb = () => {
  return (
    <section className="blurb-container">
      <p className="paragraph paragraph-short">AI-native fullstack product engineer.</p>
      <p className="paragraph">
        Mostly web. TypeScript, React, React Native, Node, Rails,
        REST/GraphQL, Storybook, testing libraries, etc, etc.
      </p>
      <p className="paragraph paragraph-short">
        Rips @{" "}
        <a className="link" href="https://play.underdogfantasy.com/bigriss-bbbdfc02f9d75f4b">Underdog</a>.
      </p>
      <p className="paragraph">
        I like puzzles and live music. I study French. I live in Brooklyn. I
        value meaningful projects, thorough code review and winning as a team.
      </p>
      <p className="paragraph">
        I make small, pointless games that make me laugh. I collect useless
        domains.
      </p>
    </section>
  );
};

export default Blurb;
