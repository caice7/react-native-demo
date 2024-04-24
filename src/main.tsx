import React, { useState } from 'react';
import MType from './MType';
import MList from './MList';

export default function Main() {
  const [page, setPage] = useState(1);

  return (
    page === 1 ? <MType setPage={setPage} /> :
      <MList setPage={setPage} />
  )
}
