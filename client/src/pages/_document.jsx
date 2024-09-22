//And use the _document. js file only if you need to edit the basic structure of your HTML Code

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
        <div id="photo-picker-element"></div>
      </body>
    </Html>
  );
}
