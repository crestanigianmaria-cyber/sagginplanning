import React from 'react';
import FleetMapClient from './FleetMapClient';

export const metadata = {
  title: 'Mappa Flotta Live | Saggin Planning',
  description: 'Tracciamento GPS in tempo reale della flotta e dei cantieri'
};

export default function FleetMapPage() {
  return <FleetMapClient />;
}
