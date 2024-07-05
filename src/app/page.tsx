'use client'
// pages/index.tsx
import type { NextPage } from 'next';
import PlaylistDisplay from './components/PlaylistDisplay';


const Home: NextPage = () => {
  return (
    <div>
      <PlaylistDisplay />
    </div>
  );
};

export default Home;