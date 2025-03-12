import { ComponentChildren } from "preact";

export const Layout = (props: { children?: ComponentChildren }) => {
  return (
    <>
      <l-header logo="/_/site-icon.jpeg">
        <t-link href="/">Inventoy</t-link>
        <t-link href="/search">Search</t-link>
      </l-header>
      {props.children}
    </>
  );
};
