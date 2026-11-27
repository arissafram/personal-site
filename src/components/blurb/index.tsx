import "./styles.css";

const Blurb = () => {
  return (
    <section className="blurb-container">
      <p className="paragraph">
        AI-native
        <br />
        fullstack
        <br />
        product
        <br />
        engineer.
      </p>
      <p className="paragraph">
        I like puzzles and live music. I study French. I live in Brooklyn. I
        value meaningful projects, finding the best solution, and winning as a team.
        Currently supporting{" "}
        <a className="link" href="https://play.underdogsports.com/vgwg/ybhlkyip">Underdog Rips</a>,
        building fun things on my own time, and adding to a
        collection of useless domains.
      </p>
      <p className="paragraph">
        JS/Typescript, React, React Native, Expo, NodeJS, Rails, REST/GraphQL,
        Storybook, testing libraries, etc, etc.
      </p>
    </section>
  );
};

export default Blurb;
