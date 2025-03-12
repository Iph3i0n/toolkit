import { App } from "components/app";
import { Layout } from "components/layout";
import { Search } from "components/search";
import { render } from "preact";
import { useState } from "preact/hooks";

const Main = () => {
  const [path] = useState(window.location.pathname.split("/").filter((r) => r));

  return (
    <Layout>
      {path[0] === "search" ? <Search /> : <App path={path.slice(1)} />}
    </Layout>
  );
};

render(<Main />, document.body);
