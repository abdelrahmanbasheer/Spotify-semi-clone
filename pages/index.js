import Head from "next/head";

import Sidebar from "../components/Sidebar";
import Center from "../components/Center";
import { getSession } from "next-auth/react";

import Player from "../components/Player";
export default function Home() {
  return (
    <div className="bg-black h-screen overflow-hidden">
      <Head>
        <title>Spotify-clone</title>
        <link rel="icon" href="" />
      </Head>
      <main className="flex">
        <Sidebar></Sidebar>
        <Center></Center>
      </main>
      <div className="sticky bottom-0">
        <Player></Player>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
}
