
//Use _app. js file when you need to add some Global Layout or Meta Tags

import { StateProvider } from "@/context/StateContext";
import "@/styles/globals.css";
import Head from "next/head";
import reducer,{intialState} from "@/context/StateReducers";

export default function App({ Component, pageProps }) {
  return (
    <StateProvider intialState={intialState} reducer={reducer}>
      <Head>
        <title>ChatNow</title>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>
      <Component {...pageProps} />;
    </StateProvider> 
  )
}
