import "./styles.css";

const Blurb = () => {
  return (
    <section className="blurb-container">
      <p className="paragraph">
        Product engineer @{" "}
        <a className="link" href="https://play.underdogfantasy.com/bigriss-bbbdfc02f9d75f4b">Underdog</a>
      </p>
      <p className="paragraph">
        I like puzzles and live music. I study French. I live in Brooklyn. I
        value meaningful projects, thorough code review and winning as a team.
        Currently supporting Underdog products, building fun things on my
        own time, and adding to a collection of useless domains.
      </p>
      <p className="paragraph">
        Fullstack product engineer, with an expertise in Web. Typescript, React/RN, NodeJS, 
        Swift, Kotlin, Rails, REST/GraphQL, Storybook, testing libraries.
      </p>
    </section>
  );
};

export default Blurb;
