import React from 'react';
import NavBar from '../Components/NavBar';

export default function OtherPage() {
  return (
    <>
      <NavBar />
      <div className="container py-4">
        <h2>Other Page</h2>
        <p>
          This is an example of an additional protected route in your application. 
          Replace this content with the actual UI or features you want to expose here.
        </p>
      </div>
    </>
  );
}
